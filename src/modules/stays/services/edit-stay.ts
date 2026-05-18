// CU-09 Editar Alojamiento
import { z } from "zod";
import type { Stay, StayRepository } from "@/modules/stays/domain/types";
import { NotHostError, StayNotFoundError } from "./errors";

export const editStaySchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().min(20).max(2000).optional(),
  pricePerNight: z.coerce.number().positive().max(10_000_000).optional(),
  capacity: z.coerce.number().int().min(1).max(50).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  locationText: z.string().trim().min(3).max(200).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export type EditStayInput = z.infer<typeof editStaySchema>;

export async function editStay(
  actorId: string,
  stayId: string,
  input: EditStayInput,
  deps: { stays: StayRepository }
): Promise<Stay> {
  const data = editStaySchema.parse(input);

  const existing = await deps.stays.findById(stayId);
  if (!existing || existing.status === "DELETED") throw new StayNotFoundError();
  if (existing.hostId !== actorId) throw new NotHostError();

  return deps.stays.update(stayId, data);
}
