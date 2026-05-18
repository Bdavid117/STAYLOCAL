// CU-23 Calificar + CU-24 Dejar comentario. Comparten formulario y
// quedan en una sola fila Review (UNIQUE bookingId).
//
// Elegibilidad: la reserva pertenece al guest, está CONFIRMED o
// COMPLETED, su checkOut ya pasó y todavía no tiene reseña.
// Al guardarse, la reserva transita a COMPLETED.

import { z } from "zod";
import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { Review, ReviewRepository } from "@/modules/reviews/domain/types";
import {
  BookingNotReviewableError,
  ReviewAlreadyExistsError,
} from "./errors";

export const submitReviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Mínimo 1 estrella").max(5, "Máximo 5 estrellas"),
  comment: z
    .string()
    .trim()
    .min(10, "El comentario debe tener al menos 10 caracteres")
    .max(1000, "El comentario no puede exceder 1000 caracteres"),
});

export type SubmitReviewInput = z.input<typeof submitReviewSchema>;

export type SubmitReviewDeps = {
  db: PrismaClient;
  reviews: ReviewRepository;
  now?: () => Date;
};

export async function submitReview(
  guestId: string,
  bookingId: string,
  input: SubmitReviewInput,
  deps: SubmitReviewDeps
): Promise<Review> {
  const { rating, comment } = submitReviewSchema.parse(input);
  const now = (deps.now ?? (() => new Date()))();

  const booking = await deps.db.booking.findFirst({
    where: { id: bookingId, guestId },
    select: { id: true, stayId: true, status: true, checkOut: true },
  });
  if (!booking) throw new BookingNotReviewableError("Reserva no encontrada.");

  if (booking.status !== "CONFIRMED" && booking.status !== "COMPLETED") {
    throw new BookingNotReviewableError(
      `No se puede calificar una reserva en estado ${booking.status.toLowerCase()}.`
    );
  }
  if (booking.checkOut.getTime() > now.getTime()) {
    throw new BookingNotReviewableError(
      "Puedes calificar después del check-out."
    );
  }

  const existing = await deps.reviews.findByBookingId(bookingId);
  if (existing) throw new ReviewAlreadyExistsError();

  // Tx: crear Review + transitar booking a COMPLETED. Si la creación
  // del Review chocara con un UNIQUE concurrent, también lo
  // traducimos a ReviewAlreadyExistsError.
  try {
    return await deps.db.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          bookingId,
          stayId: booking.stayId,
          userId: guestId,
          rating,
          comment,
        },
      });
      if (booking.status !== "COMPLETED") {
        await tx.booking.update({
          where: { id: bookingId },
          data: { status: "COMPLETED" },
        });
      }
      return review;
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ReviewAlreadyExistsError();
    }
    throw err;
  }
}
