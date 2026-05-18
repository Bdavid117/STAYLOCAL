// CU-20 Validar Disponibilidad. Consulta de solo lectura para UI:
// dado un rango, dice si hay alguna fecha bloqueada o reservada.
//
// El "validar de verdad" (que evita doble reserva) sucede dentro de
// createBooking via la UNIQUE constraint — esto es solo un indicador
// adelantado para el formulario de reserva.

import { z } from "zod";
import { dateInput } from "@/modules/stays/domain/zod-helpers";
import { enumerateNights, toUtcDate } from "@/modules/stays/domain/dates";
import type { AvailabilityRepository } from "@/modules/stays/domain/types";

export const checkAvailabilitySchema = z
  .object({
    stayId: z.string().min(1),
    checkIn: dateInput,
    checkOut: dateInput,
  })
  .refine((v) => v.checkOut > v.checkIn, {
    message: "checkOut debe ser posterior a checkIn",
    path: ["checkOut"],
  });

export type CheckAvailabilityInput = z.input<typeof checkAvailabilitySchema>;

export type AvailabilityCheckResult = {
  available: boolean;
  unavailableDates: Date[];
};

export async function checkAvailability(
  input: CheckAvailabilityInput,
  deps: { availability: AvailabilityRepository }
): Promise<AvailabilityCheckResult> {
  const { stayId, checkIn, checkOut } = checkAvailabilitySchema.parse(input);
  const checkInUtc = toUtcDate(checkIn);
  const checkOutUtc = toUtcDate(checkOut);

  const range = await deps.availability.rangeForStay(stayId, checkInUtc, checkOutUtc);
  const conflicts = range.filter(
    (a) => a.status === "BOOKED" || a.status === "BLOCKED"
  );

  // Sanity: si alguna noche del rango no está en `range`, ya está libre.
  const nightsRequested = enumerateNights(checkInUtc, checkOutUtc);
  void nightsRequested; // lo dejamos como autodocumentación

  return {
    available: conflicts.length === 0,
    unavailableDates: conflicts.map((c) => c.date),
  };
}
