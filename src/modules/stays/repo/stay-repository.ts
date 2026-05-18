import type { PrismaClient } from "@prisma/client";
import type {
  Stay,
  StayImage,
  StayRepository,
  StayStatus,
  StayWithCover,
} from "@/modules/stays/domain/types";

function toStay(row: {
  id: string;
  hostId: string;
  title: string;
  description: string;
  pricePerNight: { toNumber(): number } | number;
  capacity: number;
  lat: number;
  lng: number;
  locationText: string;
  status: string;
  createdAt: Date;
}): Stay {
  return {
    ...row,
    pricePerNight:
      typeof row.pricePerNight === "number"
        ? row.pricePerNight
        : row.pricePerNight.toNumber(),
    status: row.status as StayStatus,
  };
}

export class PrismaStayRepository implements StayRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<Stay | null> {
    const row = await this.db.stay.findUnique({ where: { id } });
    return row ? toStay(row) : null;
  }

  async findByIdWithImages(
    id: string
  ): Promise<(Stay & { images: StayImage[] }) | null> {
    const row = await this.db.stay.findUnique({
      where: { id },
      include: { images: { orderBy: { orderIdx: "asc" } } },
    });
    if (!row) return null;
    return { ...toStay(row), images: row.images };
  }

  async listByHost(hostId: string): Promise<StayWithCover[]> {
    const rows = await this.db.stay.findMany({
      where: { hostId, status: { not: "DELETED" } },
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: { orderIdx: "asc" }, take: 1 } },
    });
    return rows.map((r) => ({
      ...toStay(r),
      coverImageUrl: r.images[0]?.url ?? null,
    }));
  }

  async create(input: {
    hostId: string;
    title: string;
    description: string;
    pricePerNight: number;
    capacity: number;
    lat: number;
    lng: number;
    locationText: string;
  }): Promise<Stay> {
    const row = await this.db.stay.create({ data: input });
    return toStay(row);
  }

  async update(
    id: string,
    patch: Partial<{
      title: string;
      description: string;
      pricePerNight: number;
      capacity: number;
      lat: number;
      lng: number;
      locationText: string;
      status: StayStatus;
    }>
  ): Promise<Stay> {
    const row = await this.db.stay.update({ where: { id }, data: patch });
    return toStay(row);
  }

  async softDelete(id: string): Promise<void> {
    await this.db.stay.update({
      where: { id },
      data: { status: "DELETED" },
    });
  }
}
