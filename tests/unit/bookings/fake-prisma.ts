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
  title?: string;
  locationText?: string;
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

type UserRow = {
  id: string;
  name: string;
  email: string;
};

type PaymentRow = {
  id: string;
  bookingId: string;
  amount: Prisma.Decimal;
  currency: string;
  provider: string;
  providerRef: string | null;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paidAt: Date | null;
};

type ReviewRow = {
  id: string;
  bookingId: string;
  stayId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
};

type Snapshot = {
  stays: StayRow[];
  bookings: BookingRow[];
  availability: AvailabilityRow[];
  users: UserRow[];
  payments: PaymentRow[];
  reviews: ReviewRow[];
};

function cloneSnapshot(s: Snapshot): Snapshot {
  return {
    stays: s.stays.map((r) => ({ ...r })),
    bookings: s.bookings.map((r) => ({ ...r })),
    availability: s.availability.map((r) => ({ ...r })),
    users: s.users.map((r) => ({ ...r })),
    payments: s.payments.map((r) => ({ ...r })),
    reviews: s.reviews.map((r) => ({ ...r })),
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

  review = {
    create: async ({
      data,
    }: {
      data: Omit<ReviewRow, "id" | "createdAt">;
    }) => {
      const exists = this.data.reviews.some((r) => r.bookingId === data.bookingId);
      if (exists) {
        throw new Prisma.PrismaClientKnownRequestError(
          "Unique constraint failed on the fields: (`bookingId`)",
          { code: "P2002", clientVersion: "fake", meta: { target: ["bookingId"] } }
        );
      }
      const row: ReviewRow = {
        id: randomUUID(),
        createdAt: new Date(),
        ...data,
      };
      this.data.reviews.push(row);
      return { ...row };
    },
  };
}

export class FakePrismaClient {
  constructor(
    public data: Snapshot = {
      stays: [],
      bookings: [],
      availability: [],
      users: [],
      payments: [],
      reviews: [],
    }
  ) {}

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
      include,
      select: _select,
    }: {
      where: { id: string; guestId?: string };
      include?: { stay?: unknown; guest?: unknown };
      select?: Record<string, boolean>;
    }) => {
      const b = this.data.bookings.find(
        (b) => b.id === where.id && (where.guestId === undefined || b.guestId === where.guestId)
      );
      if (!b) return null;
      if (!include) return { ...b };
      const stay = include.stay ? this.data.stays.find((s) => s.id === b.stayId) : undefined;
      const host = stay
        ? this.data.users.find((u) => u.id === (stay as StayRow).hostId)
        : undefined;
      const guest = include.guest
        ? this.data.users.find((u) => u.id === b.guestId)
        : undefined;
      return {
        ...b,
        ...(stay
          ? {
              stay: {
                title: (stay as StayRow & { title?: string }).title ?? "(sin título)",
                locationText:
                  (stay as StayRow & { locationText?: string }).locationText ?? "(sin ubicación)",
                pricePerNight: (stay as StayRow).pricePerNight,
                host: host ? { name: host.name } : { name: "Anfitrión" },
              },
            }
          : {}),
        ...(guest ? { guest: { name: guest.name, email: guest.email } } : {}),
      };
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<BookingRow> }) => {
      const b = this.data.bookings.find((r) => r.id === where.id);
      if (!b) throw new Error("not found");
      Object.assign(b, data);
      return { ...b };
    },
  };

  payment = {
    findUnique: async ({
      where,
      include,
    }: {
      where: { id?: string; bookingId?: string };
      include?: { booking?: { include?: { stay?: unknown; guest?: unknown } } };
    }) => {
      const p = this.data.payments.find(
        (r) =>
          (where.id !== undefined && r.id === where.id) ||
          (where.bookingId !== undefined && r.bookingId === where.bookingId)
      );
      if (!p) return null;
      if (!include?.booking) return { ...p };
      const b = this.data.bookings.find((b) => b.id === p.bookingId);
      if (!b) return { ...p };
      const stay = this.data.stays.find((s) => s.id === b.stayId);
      const host = stay ? this.data.users.find((u) => u.id === (stay as StayRow).hostId) : undefined;
      const guest = this.data.users.find((u) => u.id === b.guestId);
      return {
        ...p,
        booking: {
          ...b,
          stay: stay
            ? {
                ...stay,
                title: (stay as StayRow & { title?: string }).title ?? "(sin título)",
                locationText:
                  (stay as StayRow & { locationText?: string }).locationText ?? "(sin ubicación)",
                pricePerNight: (stay as StayRow).pricePerNight,
                host: host ? { name: host.name } : { name: "Anfitrión" },
              }
            : undefined,
          guest: guest ? { name: guest.name, email: guest.email } : undefined,
        },
      };
    },
    create: async ({ data }: { data: Omit<PaymentRow, "id" | "providerRef" | "paidAt" | "status"> & { status?: PaymentRow["status"] } }) => {
      const row: PaymentRow = {
        id: randomUUID(),
        bookingId: data.bookingId,
        amount: new Prisma.Decimal(data.amount.toString()),
        currency: data.currency,
        provider: data.provider,
        providerRef: null,
        status: data.status ?? "PENDING",
        paidAt: null,
      };
      const exists = this.data.payments.find((p) => p.bookingId === row.bookingId);
      if (exists) {
        throw new Prisma.PrismaClientKnownRequestError(
          "Unique constraint failed on the fields: (`bookingId`)",
          { code: "P2002", clientVersion: "fake", meta: { target: ["bookingId"] } }
        );
      }
      this.data.payments.push(row);
      return { ...row };
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<PaymentRow>;
    }) => {
      const p = this.data.payments.find((r) => r.id === where.id);
      if (!p) throw new Error("payment not found");
      Object.assign(p, data);
      return { ...p };
    },
  };

  review = {
    findUnique: async ({ where }: { where: { bookingId: string } }) =>
      this.data.reviews.find((r) => r.bookingId === where.bookingId) ?? null,
    findMany: async ({
      where,
      orderBy: _orderBy,
      take,
      include: _include,
    }: {
      where: { stayId: string };
      orderBy?: unknown;
      take?: number;
      include?: unknown;
    }) => {
      const list = this.data.reviews
        .filter((r) => r.stayId === where.stayId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const sliced = take ? list.slice(0, take) : list;
      return sliced.map((r) => ({
        ...r,
        user: this.data.users.find((u) => u.id === r.userId) ?? {
          name: "Usuario",
          photoUrl: null,
        },
      }));
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
    title?: string;
    locationText?: string;
  }) {
    this.data.stays.push({
      id: s.id,
      hostId: s.hostId,
      status: s.status ?? "ACTIVE",
      pricePerNight: new Prisma.Decimal(s.pricePerNight.toString()),
      ...(s.title ? { title: s.title } : {}),
      ...(s.locationText ? { locationText: s.locationText } : {}),
    } as StayRow);
  }

  seedUser(u: { id: string; name: string; email: string }) {
    this.data.users.push({ id: u.id, name: u.name, email: u.email });
  }

  seedBooking(b: {
    id: string;
    guestId: string;
    stayId: string;
    checkIn: Date;
    checkOut: Date;
    totalAmount?: number;
    status?: BookingRow["status"];
  }) {
    this.data.bookings.push({
      id: b.id,
      guestId: b.guestId,
      stayId: b.stayId,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      totalAmount: new Prisma.Decimal((b.totalAmount ?? 100).toString()),
      status: b.status ?? "CONFIRMED",
      createdAt: new Date(),
    });
  }
}

// Cast helper para tipar el fake como PrismaClient sin importar todo el tipo.
export function asPrisma(client: FakePrismaClient) {
  return client as unknown as import("@prisma/client").PrismaClient;
}
