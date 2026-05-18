import { describe, it, expect } from "vitest";
import { createBooking } from "@/modules/bookings/services/create-booking";
import {
  BookingConflictError,
  HostCannotBookOwnStayError,
  StayNotBookableError,
} from "@/modules/bookings/services/errors";
import { FakePrismaClient, asPrisma } from "./fake-prisma";

const HOST = "host-1";
const GUEST_A = "guest-a";
const GUEST_B = "guest-b";
const STAY_ID = "stay-1";

function setup(price = 100): FakePrismaClient {
  const db = new FakePrismaClient();
  db.seedStay({ id: STAY_ID, hostId: HOST, pricePerNight: price });
  return db;
}

describe("CU-17 createBooking", () => {
  it("ruta feliz: crea reserva CONFIRMED y bloquea las noches", async () => {
    const db = setup(50);

    const booking = await createBooking(
      GUEST_A,
      { stayId: STAY_ID, checkIn: "2026-08-01", checkOut: "2026-08-04" },
      { db: asPrisma(db) }
    );

    expect(booking.status).toBe("CONFIRMED");
    expect(booking.totalAmount).toBe(150); // 3 noches × 50
    expect(db.data.availability).toHaveLength(3);
    expect(db.data.availability.every((a) => a.status === "BOOKED")).toBe(true);
    expect(db.data.availability.every((a) => a.bookingId === booking.id)).toBe(true);
  });

  it("rechaza si el alojamiento no existe", async () => {
    const db = new FakePrismaClient();
    await expect(
      createBooking(
        GUEST_A,
        { stayId: "no-existe", checkIn: "2026-08-01", checkOut: "2026-08-02" },
        { db: asPrisma(db) }
      )
    ).rejects.toBeInstanceOf(StayNotBookableError);
  });

  it("rechaza si el alojamiento está INACTIVE", async () => {
    const db = new FakePrismaClient();
    db.seedStay({ id: STAY_ID, hostId: HOST, pricePerNight: 50, status: "INACTIVE" });
    await expect(
      createBooking(
        GUEST_A,
        { stayId: STAY_ID, checkIn: "2026-08-01", checkOut: "2026-08-02" },
        { db: asPrisma(db) }
      )
    ).rejects.toBeInstanceOf(StayNotBookableError);
  });

  it("rechaza si el host intenta reservar su propio alojamiento", async () => {
    const db = setup();
    await expect(
      createBooking(
        HOST,
        { stayId: STAY_ID, checkIn: "2026-08-01", checkOut: "2026-08-02" },
        { db: asPrisma(db) }
      )
    ).rejects.toBeInstanceOf(HostCannotBookOwnStayError);
  });

  it("rechaza si checkOut <= checkIn", async () => {
    const db = setup();
    await expect(
      createBooking(
        GUEST_A,
        { stayId: STAY_ID, checkIn: "2026-08-02", checkOut: "2026-08-02" },
        { db: asPrisma(db) }
      )
    ).rejects.toThrow();
  });

  it("dispara BookingConflictError si una fecha ya está reservada", async () => {
    const db = setup();
    await createBooking(
      GUEST_A,
      { stayId: STAY_ID, checkIn: "2026-08-01", checkOut: "2026-08-04" },
      { db: asPrisma(db) }
    );
    await expect(
      createBooking(
        GUEST_B,
        { stayId: STAY_ID, checkIn: "2026-08-03", checkOut: "2026-08-05" },
        { db: asPrisma(db) }
      )
    ).rejects.toBeInstanceOf(BookingConflictError);

    // El estado quedó consistente: solo la primera reserva
    expect(db.data.bookings).toHaveLength(1);
    expect(db.data.availability).toHaveLength(3);
  });

  it("dos reservas concurrentes sobre las mismas fechas: exactamente una gana", async () => {
    const db = setup();

    const [resultA, resultB] = await Promise.allSettled([
      createBooking(
        GUEST_A,
        { stayId: STAY_ID, checkIn: "2026-08-01", checkOut: "2026-08-04" },
        { db: asPrisma(db) }
      ),
      createBooking(
        GUEST_B,
        { stayId: STAY_ID, checkIn: "2026-08-02", checkOut: "2026-08-05" },
        { db: asPrisma(db) }
      ),
    ]);

    const fulfilled = [resultA, resultB].filter((r) => r.status === "fulfilled");
    const rejected = [resultA, resultB].filter((r) => r.status === "rejected");

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(BookingConflictError);

    // La DB queda con exactamente una reserva confirmada y sus noches BOOKED
    expect(db.data.bookings).toHaveLength(1);
    expect(db.data.bookings[0].status).toBe("CONFIRMED");
    const winnerId = db.data.bookings[0].id;
    expect(db.data.availability.every((a) => a.bookingId === winnerId)).toBe(true);
  });

  it("dos reservas concurrentes sobre fechas disjuntas: ambas exitosas", async () => {
    const db = setup();

    const [resultA, resultB] = await Promise.all([
      createBooking(
        GUEST_A,
        { stayId: STAY_ID, checkIn: "2026-08-01", checkOut: "2026-08-04" },
        { db: asPrisma(db) }
      ),
      createBooking(
        GUEST_B,
        { stayId: STAY_ID, checkIn: "2026-08-10", checkOut: "2026-08-13" },
        { db: asPrisma(db) }
      ),
    ]);

    expect(resultA.status).toBe("CONFIRMED");
    expect(resultB.status).toBe("CONFIRMED");
    expect(db.data.bookings).toHaveLength(2);
    expect(db.data.availability).toHaveLength(6);
  });
});
