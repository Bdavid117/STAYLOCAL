import { describe, it, expect } from "vitest";
import { submitReview } from "@/modules/reviews/services/submit-review";
import {
  BookingNotReviewableError,
  ReviewAlreadyExistsError,
} from "@/modules/reviews/services/errors";
import { PrismaReviewRepository } from "@/modules/reviews/repo/review-repository";
import { FakePrismaClient, asPrisma } from "../bookings/fake-prisma";

const GUEST = "guest-a";
const OTHER = "guest-b";
const HOST = "host-1";
const STAY_ID = "stay-1";
const BOOKING_ID = "booking-1";

function dateAgo(days: number): Date {
  return new Date(Date.now() - days * 86_400_000);
}

function setup(opts: {
  checkOut?: Date;
  status?: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "PENDING";
} = {}): {
  db: FakePrismaClient;
  deps: Parameters<typeof submitReview>[3];
} {
  const db = new FakePrismaClient();
  db.seedUser({ id: HOST, name: "Anfitrión", email: "host@demo" });
  db.seedUser({ id: GUEST, name: "Alice", email: "alice@demo" });
  db.seedStay({ id: STAY_ID, hostId: HOST, pricePerNight: 100 });
  db.seedBooking({
    id: BOOKING_ID,
    guestId: GUEST,
    stayId: STAY_ID,
    checkIn: dateAgo(5),
    checkOut: opts.checkOut ?? dateAgo(2),
    status: opts.status ?? "CONFIRMED",
  });

  const deps = {
    db: asPrisma(db),
    reviews: new PrismaReviewRepository(asPrisma(db)),
  };
  return { db, deps };
}

describe("CU-23 + CU-24 submitReview", () => {
  it("ruta feliz: crea Review y transita booking a COMPLETED", async () => {
    const { db, deps } = setup();

    const review = await submitReview(
      GUEST,
      BOOKING_ID,
      { rating: 5, comment: "Lugar increíble, repetimos." },
      deps
    );

    expect(review.rating).toBe(5);
    expect(review.comment).toBe("Lugar increíble, repetimos.");
    expect(review.stayId).toBe(STAY_ID);
    expect(db.data.reviews).toHaveLength(1);
    expect(db.data.bookings[0].status).toBe("COMPLETED");
  });

  it("acepta también si la booking ya está COMPLETED", async () => {
    const { db, deps } = setup({ status: "COMPLETED" });
    const review = await submitReview(
      GUEST,
      BOOKING_ID,
      { rating: 4, comment: "Muy buena experiencia overall." },
      deps
    );
    expect(review.rating).toBe(4);
    expect(db.data.bookings[0].status).toBe("COMPLETED");
  });

  it("rechaza rating fuera de 1..5", async () => {
    const { deps } = setup();
    await expect(
      submitReview(GUEST, BOOKING_ID, { rating: 0, comment: "demasiado corto" }, deps)
    ).rejects.toThrow();
    await expect(
      submitReview(GUEST, BOOKING_ID, { rating: 6, comment: "rating invalido" }, deps)
    ).rejects.toThrow();
  });

  it("rechaza comentario menor a 10 caracteres", async () => {
    const { deps } = setup();
    await expect(
      submitReview(GUEST, BOOKING_ID, { rating: 4, comment: "corto" }, deps)
    ).rejects.toThrow();
  });

  it("rechaza si la booking no pertenece al guest", async () => {
    const { deps } = setup();
    await expect(
      submitReview(OTHER, BOOKING_ID, { rating: 5, comment: "no soy el dueno aqui" }, deps)
    ).rejects.toBeInstanceOf(BookingNotReviewableError);
  });

  it("rechaza si la booking está cancelada", async () => {
    const { deps } = setup({ status: "CANCELLED" });
    await expect(
      submitReview(GUEST, BOOKING_ID, { rating: 5, comment: "no deberia poder" }, deps)
    ).rejects.toBeInstanceOf(BookingNotReviewableError);
  });

  it("rechaza si el checkOut aún no llegó (futuro)", async () => {
    const future = new Date(Date.now() + 5 * 86_400_000);
    const { deps } = setup({ checkOut: future });
    await expect(
      submitReview(GUEST, BOOKING_ID, { rating: 5, comment: "todavia no termino" }, deps)
    ).rejects.toBeInstanceOf(BookingNotReviewableError);
  });

  it("rechaza una segunda reseña sobre la misma reserva", async () => {
    const { deps } = setup();
    await submitReview(GUEST, BOOKING_ID, { rating: 5, comment: "primera resena ok" }, deps);
    await expect(
      submitReview(GUEST, BOOKING_ID, { rating: 3, comment: "segunda resena nope" }, deps)
    ).rejects.toBeInstanceOf(ReviewAlreadyExistsError);
  });
});
