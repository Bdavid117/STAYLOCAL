// CU-17 Realizar Reserva. Punto crítico de concurrencia del sistema.
//
// Garantía: la transacción inserta tantas filas en Availability como
// noches haya en el rango. La constraint UNIQUE(stayId, date) hace que
// si OTRA reserva ya ocupó cualquiera de esas fechas, Prisma falle con
// P2002 — capturamos eso y devolvemos BookingConflictError. Esto evita
// doble reserva sin necesidad de un lock distribuido externo.
//
// Importante: NO atrapamos errores que no sean P2002 — todo lo demás
// debe propagar para que la transacción haga rollback total.

import { z } from "zod";
import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { enumerateNights, toUtcDate } from "@/modules/stays/domain/dates";
import { dateInput } from "@/modules/stays/domain/zod-helpers";
import type { Booking } from "@/modules/bookings/domain/types";
import {
  BookingConflictError,
  HostCannotBookOwnStayError,
  StayNotBookableError,
} from "./errors";

export const createBookingSchema = z
  .object({
    stayId: z.string().min(1),
    checkIn: dateInput,
    checkOut: dateInput,
  })
  .refine((v) => v.checkOut > v.checkIn, {
    message: "checkOut debe ser posterior a checkIn",
    path: ["checkOut"],
  });

export type CreateBookingInput = z.input<typeof createBookingSchema>;

export async function createBooking(
  guestId: string,
  input: CreateBookingInput,
  deps: { db: PrismaClient }
): Promise<Booking> {
  const { stayId, checkIn, checkOut } = createBookingSchema.parse(input);
  const checkInUtc = toUtcDate(checkIn);
  const checkOutUtc = toUtcDate(checkOut);
  const nights = enumerateNights(checkInUtc, checkOutUtc);

  if (nights.length === 0) throw new StayNotBookableError("Rango de fechas inválido.");

  try {
    return await deps.db.$transaction(
      async (tx) => {
        const stay = await tx.stay.findUnique({
          where: { id: stayId },
          select: {
            id: true,
            hostId: true,
            status: true,
            pricePerNight: true,
          },
        });
        if (!stay || stay.status !== "ACTIVE") {
          throw new StayNotBookableError("Alojamiento no disponible.");
        }
        if (stay.hostId === guestId) {
          throw new HostCannotBookOwnStayError();
        }

        const booking = await tx.booking.create({
          data: {
            guestId,
            stayId: stay.id,
            checkIn: checkInUtc,
            checkOut: checkOutUtc,
            status: "CONFIRMED",
            totalAmount: new Prisma.Decimal(
              stay.pricePerNight.toString()
            ).mul(nights.length),
          },
        });

        // El createMany con UNIQUE(stayId, date) es el lock: si otra
        // transacción concurrente ya tomó alguna fecha, esto falla con
        // P2002 y toda la tx hace rollback.
        await tx.availability.createMany({
          data: nights.map((date) => ({
            stayId: stay.id,
            date,
            status: "BOOKED" as const,
            bookingId: booking.id,
          })),
        });

        return {
          id: booking.id,
          guestId: booking.guestId,
          stayId: booking.stayId,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          totalAmount: booking.totalAmount.toNumber(),
          status: "CONFIRMED" as const,
          createdAt: booking.createdAt,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new BookingConflictError();
    }
    throw err;
  }
}
