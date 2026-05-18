import { describe, it, expect } from "vitest";
import { cancelBooking } from "@/modules/bookings/services/cancel-booking";
import { createBooking } from "@/modules/bookings/services/create-booking";
import {
  BookingNotFoundError,
  CannotCancelError,
} from "@/modules/bookings/services/errors";
import { PrismaBookingRepository } from "@/modules/bookings/repo/booking-repository";
import { FakePrismaClient, asPrisma } from "./fake-prisma";

const HOST = "host-1";
const GUEST = "guest-a";
const STAY_ID = "stay-1";

async function setupWithFutureBooking() {
  const db = new FakePrismaClient();
  db.seedStay({ id: STAY_ID, hostId: HOST, pricePerNight: 50 });
  const booking = await createBooking(
    GUEST,
    { stayId: STAY_ID, checkIn: "2099-08-01", checkOut: "2099-08-04" },
    { db: asPrisma(db) }
  );
  const bookings = new PrismaBookingRepository(asPrisma(db));
  return { db, bookings, booking };
}

describe("CU-18 cancelBooking", () => {
  it("cancela una reserva futura y libera las fechas", async () => {
    const { db, bookings, booking } = await setupWithFutureBooking();

    const result = await cancelBooking(GUEST, booking.id, { db: asPrisma(db), bookings });

    expect(result.status).toBe("CANCELLED");
    expect(db.data.availability).toHaveLength(0);
    expect(db.data.bookings[0].status).toBe("CANCELLED");
  });

  it("rechaza si la reserva no pertenece al huésped", async () => {
    const { db, bookings, booking } = await setupWithFutureBooking();
    await expect(
      cancelBooking("otro-huesped", booking.id, { db: asPrisma(db), bookings })
    ).rejects.toBeInstanceOf(BookingNotFoundError);
  });

  it("rechaza si la reserva ya está cancelada", async () => {
    const { db, bookings, booking } = await setupWithFutureBooking();
    await cancelBooking(GUEST, booking.id, { db: asPrisma(db), bookings });
    await expect(
      cancelBooking(GUEST, booking.id, { db: asPrisma(db), bookings })
    ).rejects.toBeInstanceOf(CannotCancelError);
  });

  it("rechaza si la reserva ya inició (checkIn <= ahora)", async () => {
    const db = new FakePrismaClient();
    db.seedStay({ id: STAY_ID, hostId: HOST, pricePerNight: 50 });
    const booking = await createBooking(
      GUEST,
      { stayId: STAY_ID, checkIn: "2020-08-01", checkOut: "2020-08-02" },
      { db: asPrisma(db) }
    );
    const bookings = new PrismaBookingRepository(asPrisma(db));
    await expect(
      cancelBooking(GUEST, booking.id, { db: asPrisma(db), bookings })
    ).rejects.toBeInstanceOf(CannotCancelError);
  });
});
