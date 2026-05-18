// Fake PrismaClient enfocado en simular el comportamiento crítico de
// createBooking: UNIQUE(stayId, date) en Availability y transacciones
// con commit atómico al final del callback.

import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { toUtcDate } from "@/modules/stays/domain/dates";

type StayRow = {
  id: string;
  hostId: string;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  pricePerNight: Prisma.Decimal;
};

type BookingRow = {
  id: string;
  guestId: string;
  stayId: string;
  checkIn: Date;
  checkOut: Date;
  totalAmount: Prisma.Decimal;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: Date;
};

type AvailabilityRow = {
  id: string;
  stayId: string;
  date: Date;
  status: "AVAILABLE" | "BLOCKED" | "BOOKED";
  bookingId: string | null;
};

type Snapshot = {
  stays: StayRow[];
  bookings: BookingRow[];
  availability: AvailabilityRow[];
};

function cloneSnapshot(s: Snapshot): Snapshot {
  return {
    stays: s.stays.map((r) => ({ ...r })),
    bookings: s.bookings.map((r) => ({ ...r })),
    availability: s.availability.map((r) => ({ ...r })),
  };
}

class TxClient {
  constructor(public data: Snapshot) {}

  stay = {
    findUnique: async ({
      where,
      select: _select,
    }: {
      where: { id: string };
      select?: Record<string, boolean>;
    }) => {
      const found = this.data.stays.find((s) => s.id === where.id);
      return found ? { ...found } : null;
    },
  };

  booking = {
    create: async ({ data }: { data: Omit<BookingRow, "id" | "createdAt"> }) => {
      const row: BookingRow = {
        id: randomUUID(),
        createdAt: new Date(),
        ...data,
        totalAmount: new Prisma.Decimal(data.totalAmount.toString()),
        checkIn: toUtcDate(data.checkIn),
        checkOut: toUtcDate(data.checkOut),
      };
      this.data.bookings.push(row);
      return { ...row };
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<BookingRow>;
    }) => {
      const b = this.data.bookings.find((r) => r.id === where.id);
      if (!b) throw new Error("booking not found");
      Object.assign(b, data);
      return { ...b };
    },
  };

  availability = {
    createMany: async ({
      data,
    }: {
      data: Array<{
        stayId: string;
        date: Date;
        status: "BOOKED" | "BLOCKED" | "AVAILABLE";
        bookingId: string | null;
      }>;
    }) => {
      // Aplica todas o ninguna — eso es lo que hace createMany atomicamente
      // dentro de la tx; el rollback de la tx revertirá el push si falla.
      for (const row of data) {
        const d = toUtcDate(row.date);
        const exists = this.data.availability.some(
          (a) => a.stayId === row.stayId && a.date.getTime() === d.getTime()
        );
        if (exists) {
          // Simula P2002 de Prisma sobre la UNIQUE(stayId, date)
          throw new Prisma.PrismaClientKnownRequestError(
            "Unique constraint failed on the fields: (`stayId`,`date`)",
            { code: "P2002", clientVersion: "fake", meta: { target: ["stayId", "date"] } }
          );
        }
        this.data.availability.push({
          id: randomUUID(),
          stayId: row.stayId,
          date: d,
          status: row.status,
          bookingId: row.bookingId,
        });
      }
      return { count: data.length };
    },
    deleteMany: async ({
      where,
    }: {
      where: { bookingId?: string; stayId?: string };
    }) => {
      const before = this.data.availability.length;
      this.data.availability = this.data.availability.filter((a) => {
        if (where.bookingId !== undefined && a.bookingId !== where.bookingId) return true;
        if (where.stayId !== undefined && a.stayId !== where.stayId) return true;
        return false;
      });
      return { count: before - this.data.availability.length };
    },
  };
}

export class FakePrismaClient {
  constructor(public data: Snapshot = { stays: [], bookings: [], availability: [] }) {}

  // Mutex que serializa transacciones concurrentes. Emula el efecto de
  // isolationLevel=Serializable a nivel de scheduler: dos tx que corren
  // en paralelo se intercalan secuencialmente en orden de inicio.
  private txMutex: Promise<unknown> = Promise.resolve();

  // Para los repos que usan prisma directamente (booking.findUnique, etc.).
  booking = {
    findUnique: async ({ where }: { where: { id: string } }) =>
      this.data.bookings.find((b) => b.id === where.id) ?? null,
    findFirst: async ({
      where,
    }: {
      where: { id: string; guestId?: string };
    }) =>
      this.data.bookings.find(
        (b) => b.id === where.id && (where.guestId === undefined || b.guestId === where.guestId)
      ) ?? null,
    update: async ({ where, data }: { where: { id: string }; data: Partial<BookingRow> }) => {
      const b = this.data.bookings.find((r) => r.id === where.id);
      if (!b) throw new Error("not found");
      Object.assign(b, data);
      return { ...b };
    },
  };

  async $transaction<T>(
    fn: (tx: TxClient) => Promise<T>,
    _options?: { isolationLevel?: unknown }
  ): Promise<T> {
    const next = this.txMutex.then(async () => {
      // Aísla en un snapshot; commit al final si no hubo error.
      const working = cloneSnapshot(this.data);
      const tx = new TxClient(working);
      try {
        const result = await fn(tx);
        this.data = working;
        return result;
      } catch (err) {
        // Rollback: no aplicamos `working`.
        throw err;
      }
    });
    // La cola debe seguir aunque esta tx falle: ignoramos rejects en la cadena.
    this.txMutex = next.catch(() => undefined);
    return next as Promise<T>;
  }

  // Helpers de seeding para los tests
  seedStay(s: {
    id: string;
    hostId: string;
    pricePerNight: number | string;
    status?: "ACTIVE" | "INACTIVE" | "DELETED";
  }) {
    this.data.stays.push({
      id: s.id,
      hostId: s.hostId,
      status: s.status ?? "ACTIVE",
      pricePerNight: new Prisma.Decimal(s.pricePerNight.toString()),
    });
  }
}

// Cast helper para tipar el fake como PrismaClient sin importar todo el tipo.
export function asPrisma(client: FakePrismaClient) {
  return client as unknown as import("@prisma/client").PrismaClient;
}
