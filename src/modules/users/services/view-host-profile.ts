// CU-05 Ver Perfil Anfitrión.
//
// Como aún no existen los módulos de stays/reviews implementados,
// el agregado se hace aquí directamente contra Prisma. Cuando esos
// módulos existan, esta lógica migra a llamadas entre services
// (siguiendo la regla de no cruzar módulos por repo/).

import type { PrismaClient } from "@prisma/client";
import { UserNotFoundError } from "./errors";

export type HostProfileView = {
  id: string;
  name: string;
  photoUrl: string | null;
  memberSince: Date;
  totalStays: number;
  averageRating: number | null;
  stays: Array<{
    id: string;
    title: string;
    pricePerNight: number;
    locationText: string;
    coverImageUrl: string | null;
  }>;
};

export async function viewHostProfile(
  hostId: string,
  deps: { db: PrismaClient }
): Promise<HostProfileView> {
  const host = await deps.db.user.findUnique({
    where: { id: hostId },
    select: {
      id: true,
      name: true,
      photoUrl: true,
      role: true,
      createdAt: true,
    },
  });
  if (!host) throw new UserNotFoundError();

  const stays = await deps.db.stay.findMany({
    where: { hostId, status: "ACTIVE" },
    select: {
      id: true,
      title: true,
      pricePerNight: true,
      locationText: true,
      images: { orderBy: { orderIdx: "asc" }, take: 1, select: { url: true } },
    },
  });

  const avg = await deps.db.review.aggregate({
    where: { stay: { hostId } },
    _avg: { rating: true },
    _count: { _all: true },
  });

  return {
    id: host.id,
    name: host.name,
    photoUrl: host.photoUrl,
    memberSince: host.createdAt,
    totalStays: stays.length,
    averageRating: avg._count._all > 0 ? Number(avg._avg.rating) : null,
    stays: stays.map((s) => ({
      id: s.id,
      title: s.title,
      pricePerNight: Number(s.pricePerNight),
      locationText: s.locationText,
      coverImageUrl: s.images[0]?.url ?? null,
    })),
  };
}
