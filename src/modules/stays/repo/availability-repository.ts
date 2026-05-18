import type { PrismaClient } from "@prisma/client";
import type {
  Availability,
  AvailabilityRepository,
  AvailabilityStatus,
} from "@/modules/stays/domain/types";

function toAvailability(row: {
  id: string;
  stayId: string;
  date: Date;
  status: string;
  bookingId: string | null;
}): Availability {
  return { ...row, status: row.status as AvailabilityStatus };
}

export class PrismaAvailabilityRepository implements AvailabilityRepository {
  constructor(private readonly db: PrismaClient) {}

  async rangeForStay(
    stayId: string,
    from: Date,
    to: Date
  ): Promise<Availability[]> {
    const rows = await this.db.availability.findMany({
      where: { stayId, date: { gte: from, lt: to } },
      orderBy: { date: "asc" },
    });
    return rows.map(toAvailability);
  }

  // Bloquea fechas (CU-11). Si una fecha tiene reserva (BOOKED), la operación
  // debe fallar arriba — aquí asumimos que ya se validó.
  async blockDates(stayId: string, dates: Date[]): Promise<void> {
    if (dates.length === 0) return;
    await this.db.$transaction(async (tx) => {
      for (const date of dates) {
        await tx.availability.upsert({
          where: { stayId_date: { stayId, date } },
          create: { stayId, date, status: "BLOCKED" },
          update: { status: "BLOCKED" },
        });
      }
    });
  }

  async unblockDates(stayId: string, dates: Date[]): Promise<void> {
    if (dates.length === 0) return;
    await this.db.availability.deleteMany({
      where: { stayId, date: { in: dates }, status: "BLOCKED" },
    });
  }
}
