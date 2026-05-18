// CU-18 Cancelar Reserva. Cambia estado a CANCELLED y libera las fechas
// (elimina filas BOOKED de availability vinculadas a esta reserva).

import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { Booking, BookingRepository } from "@/modules/bookings/domain/types";
import { BookingNotFoundError, CannotCancelError } from "./errors";

export async function cancelBooking(
  guestId: string,
  bookingId: string,
  deps: { db: PrismaClient; bookings: BookingRepository }
): Promise<Booking> {
  const existing = await deps.bookings.findByIdForGuest(bookingId, guestId);
  if (!existing) throw new BookingNotFoundError();

  if (existing.status === "CANCELLED") {
    throw new CannotCancelError("La reserva ya está cancelada.");
  }
  if (existing.status === "COMPLETED") {
    throw new CannotCancelError("No se pueden cancelar reservas completadas.");
  }
  if (existing.checkIn.getTime() <= Date.now()) {
    throw new CannotCancelError("Ya inició el periodo de la reserva.");
  }

  await deps.db.$transaction(
    async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
      });
      await tx.availability.deleteMany({
        where: { bookingId },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );

  return { ...existing, status: "CANCELLED" };
}
