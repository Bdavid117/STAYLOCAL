import type { PrismaClient } from "@prisma/client";
import type {
  Booking,
  BookingRepository,
  BookingStatus,
  BookingWithStay,
} from "@/modules/bookings/domain/types";

function toBooking(row: {
  id: string;
  guestId: string;
  stayId: string;
  checkIn: Date;
  checkOut: Date;
  totalAmount: { toNumber(): number } | number;
  status: string;
  createdAt: Date;
}): Booking {
  return {
    ...row,
    totalAmount:
      typeof row.totalAmount === "number"
        ? row.totalAmount
        : row.totalAmount.toNumber(),
    status: row.status as BookingStatus,
  };
}

export class PrismaBookingRepository implements BookingRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<Booking | null> {
    const row = await this.db.booking.findUnique({ where: { id } });
    return row ? toBooking(row) : null;
  }

  async findByIdForGuest(id: string, guestId: string): Promise<Booking | null> {
    const row = await this.db.booking.findFirst({ where: { id, guestId } });
    return row ? toBooking(row) : null;
  }

  async listByGuest(
    guestId: string,
    filter?: { status?: BookingStatus }
  ): Promise<BookingWithStay[]> {
    const rows = await this.db.booking.findMany({
      where: { guestId, ...(filter?.status ? { status: filter.status } : {}) },
      orderBy: { createdAt: "desc" },
      include: {
        stay: {
          select: {
            id: true,
            title: true,
            locationText: true,
            images: { orderBy: { orderIdx: "asc" }, take: 1, select: { url: true } },
          },
        },
      },
    });
    return rows.map((r) => ({
      ...toBooking(r),
      stay: {
        id: r.stay.id,
        title: r.stay.title,
        locationText: r.stay.locationText,
        coverImageUrl: r.stay.images[0]?.url ?? null,
      },
    }));
  }

  async updateStatus(id: string, status: BookingStatus): Promise<void> {
    await this.db.booking.update({ where: { id }, data: { status } });
  }
}
