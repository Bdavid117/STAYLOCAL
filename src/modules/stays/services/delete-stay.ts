// CU-10 Eliminar Alojamiento. Soft-delete: marca status=DELETED para no
// romper integridad de reservas históricas. Bloquea si hay reservas
// PENDING o CONFIRMED — solo se permite borrar lo que no afecta a nadie.

import type { PrismaClient } from "@prisma/client";
import type { StayRepository } from "@/modules/stays/domain/types";
import {
  NotHostError,
  StayHasActiveBookingsError,
  StayNotFoundError,
} from "./errors";

export async function deleteStay(
  actorId: string,
  stayId: string,
  deps: { stays: StayRepository; db: PrismaClient }
): Promise<void> {
  const existing = await deps.stays.findById(stayId);
  if (!existing || existing.status === "DELETED") throw new StayNotFoundError();
  if (existing.hostId !== actorId) throw new NotHostError();

  const activeBookings = await deps.db.booking.count({
    where: {
      stayId,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });
  if (activeBookings > 0) throw new StayHasActiveBookingsError();

  await deps.stays.softDelete(stayId);
}
