// CU-12 Listar / CU-13 Buscar por ubicación / CU-14 Filtrar por precio
// CU-15 Filtrar por capacidad / CU-16 Filtrar por fechas.
//
// Una sola operación de búsqueda que combina todos los filtros. La
// búsqueda geográfica usa la fórmula de Haversine en SQL crudo cuando
// se provee centro+radio; las demás dimensiones van por el ORM.

import { z } from "zod";
import type { PrismaClient } from "@prisma/client";
import type { StayWithCover } from "@/modules/stays/domain/types";
import { toUtcDate } from "@/modules/stays/domain/dates";
import { dateInput } from "@/modules/stays/domain/zod-helpers";

const numInput = z.union([z.number(), z.string().min(1)]).pipe(z.coerce.number());

export const searchStaysSchema = z
  .object({
    q: z.string().trim().min(1).optional(),
    lat: numInput.pipe(z.number().min(-90).max(90)).optional(),
    lng: numInput.pipe(z.number().min(-180).max(180)).optional(),
    radiusKm: numInput.pipe(z.number().positive().max(500)).optional(),
    minPrice: numInput.pipe(z.number().nonnegative()).optional(),
    maxPrice: numInput.pipe(z.number().positive()).optional(),
    minCapacity: numInput.pipe(z.number().int().min(1)).optional(),
    checkIn: dateInput.optional(),
    checkOut: dateInput.optional(),
    limit: numInput.pipe(z.number().int().min(1).max(100)).optional().default(20),
  })
  .refine(
    (v) =>
      (v.lat === undefined && v.lng === undefined && v.radiusKm === undefined) ||
      (v.lat !== undefined && v.lng !== undefined && v.radiusKm !== undefined),
    { message: "Para buscar por ubicación se requieren lat, lng y radiusKm." }
  )
  .refine(
    (v) =>
      (v.checkIn === undefined && v.checkOut === undefined) ||
      (v.checkIn !== undefined && v.checkOut !== undefined && v.checkOut > v.checkIn),
    { message: "checkOut debe ser posterior a checkIn." }
  )
  .refine(
    (v) => v.minPrice === undefined || v.maxPrice === undefined || v.maxPrice >= v.minPrice,
    { message: "maxPrice debe ser ≥ minPrice." }
  );

export type SearchStaysInput = z.input<typeof searchStaysSchema>;
export type SearchStaysFilters = z.output<typeof searchStaysSchema>;

export async function searchStays(
  input: SearchStaysInput,
  deps: { db: PrismaClient }
): Promise<StayWithCover[]> {
  const f = searchStaysSchema.parse(input);

  // Pre-filtra IDs por geo (Haversine) cuando aplica.
  let geoIds: string[] | null = null;
  if (f.lat !== undefined && f.lng !== undefined && f.radiusKm !== undefined) {
    // Detectamos si es SQLite (no tiene funciones trigonométricas por defecto)
    const isSqlite = (deps.db as any)._activeProvider === "sqlite";

    if (isSqlite) {
      // En SQLite filtramos en memoria para desarrollo
      const allStays = await deps.db.stay.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, lat: true, lng: true },
      });

      const toRad = (v: number) => (v * Math.PI) / 180;
      geoIds = allStays
        .filter((s) => {
          const dLat = toRad(s.lat - f.lat!);
          const dLng = toRad(s.lng - f.lng!);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(f.lat!)) *
              Math.cos(toRad(s.lat)) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = 6371 * c;
          return distance <= f.radiusKm!;
        })
        .map((s) => s.id);
    } else {
      const rows = await deps.db.$queryRawUnsafe<{ id: string }[]>(
        `
        SELECT id FROM "Stay"
        WHERE status = 'ACTIVE'
          AND (6371 * acos(
                cos(radians($1)) * cos(radians(lat)) *
                cos(radians(lng) - radians($2)) +
                sin(radians($1)) * sin(radians(lat))
              )) <= $3
        `,
        f.lat,
        f.lng,
        f.radiusKm
      );
      geoIds = rows.map((r) => r.id);
    }

    if (geoIds.length === 0) return [];
  }

  // Pre-filtra IDs sin disponibilidad bloqueada/reservada en el rango.
  let unavailableIds: Set<string> | null = null;
  if (f.checkIn && f.checkOut) {
    const conflicts = await deps.db.availability.findMany({
      where: {
        status: { in: ["BLOCKED", "BOOKED"] },
        date: { gte: toUtcDate(f.checkIn), lt: toUtcDate(f.checkOut) },
        ...(geoIds ? { stayId: { in: geoIds } } : {}),
      },
      select: { stayId: true },
    });
    unavailableIds = new Set(conflicts.map((c) => c.stayId));
  }

  const rows = await deps.db.stay.findMany({
    where: {
      status: "ACTIVE",
      ...(geoIds ? { id: { in: geoIds } } : {}),
      ...(unavailableIds && unavailableIds.size > 0
        ? { id: { notIn: [...unavailableIds] } }
        : {}),
      ...(f.q
        ? {
            OR: [
              { title: { contains: f.q } },
              { description: { contains: f.q } },
              { locationText: { contains: f.q } },
            ],
          }
        : {}),
      ...(f.minCapacity ? { capacity: { gte: f.minCapacity } } : {}),
      ...(f.minPrice !== undefined || f.maxPrice !== undefined
        ? {
            pricePerNight: {
              ...(f.minPrice !== undefined ? { gte: f.minPrice } : {}),
              ...(f.maxPrice !== undefined ? { lte: f.maxPrice } : {}),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: f.limit,
    include: { images: { orderBy: { orderIdx: "asc" }, take: 1 } },
  });

  return rows.map((r) => ({
    id: r.id,
    hostId: r.hostId,
    title: r.title,
    description: r.description,
    pricePerNight: r.pricePerNight.toNumber(),
    capacity: r.capacity,
    lat: r.lat,
    lng: r.lng,
    locationText: r.locationText,
    status: r.status as "ACTIVE" | "INACTIVE" | "DELETED",
    createdAt: r.createdAt,
    coverImageUrl: r.images[0]?.url ?? null,
  }));
}
