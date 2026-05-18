// CU-07 Publicar Alojamiento
import { z } from "zod";
import type { Stay, StayRepository } from "@/modules/stays/domain/types";

export const createStaySchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(20).max(2000),
  pricePerNight: z.coerce.number().positive().max(10_000_000),
  capacity: z.coerce.number().int().min(1).max(50),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  locationText: z.string().trim().min(3).max(200),
});

export type CreateStayInput = z.infer<typeof createStaySchema>;

export async function createStay(
  hostId: string,
  input: CreateStayInput,
  deps: { stays: StayRepository }
): Promise<Stay> {
  const data = createStaySchema.parse(input);
  return deps.stays.create({ hostId, ...data });
}
