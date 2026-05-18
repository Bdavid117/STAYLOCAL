// CU-11 Gestionar Disponibilidad. Permite bloquear/desbloquear rangos.
// Bloquear nunca debe atropellar fechas con BOOKED.

import { z } from "zod";
import type {
  AvailabilityRepository,
  StayRepository,
} from "@/modules/stays/domain/types";
import { enumerateNights, toUtcDate } from "@/modules/stays/domain/dates";
import { dateInput } from "@/modules/stays/domain/zod-helpers";
import {
  DateBookedError,
  NotHostError,
  StayNotFoundError,
} from "./errors";

export const manageAvailabilitySchema = z
  .object({
    action: z.enum(["block", "unblock"]),
    from: dateInput,
    to: dateInput,
  })
  .refine((v) => v.to > v.from, {
    message: "La fecha final debe ser posterior a la inicial.",
    path: ["to"],
  });

export type ManageAvailabilityInput = z.input<typeof manageAvailabilitySchema>;

export async function manageAvailability(
  actorId: string,
  stayId: string,
  input: ManageAvailabilityInput,
  deps: { stays: StayRepository; availability: AvailabilityRepository }
): Promise<{ affected: number }> {
  const { action, from, to } = manageAvailabilitySchema.parse(input);

  const stay = await deps.stays.findById(stayId);
  if (!stay || stay.status === "DELETED") throw new StayNotFoundError();
  if (stay.hostId !== actorId) throw new NotHostError();

  const dates = enumerateNights(toUtcDate(from), toUtcDate(to));

  if (action === "block") {
    const existing = await deps.availability.rangeForStay(
      stayId,
      toUtcDate(from),
      toUtcDate(to)
    );
    const hasBooked = existing.some((a) => a.status === "BOOKED");
    if (hasBooked) throw new DateBookedError();
    await deps.availability.blockDates(stayId, dates);
  } else {
    await deps.availability.unblockDates(stayId, dates);
  }

  return { affected: dates.length };
}
