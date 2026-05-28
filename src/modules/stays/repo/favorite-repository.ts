import type { PrismaClient } from "@prisma/client";
import type { FavoriteRepository, StayWithCover, StayStatus } from "@/modules/stays/domain/types";

export class PrismaFavoriteRepository implements FavoriteRepository {
  constructor(private readonly db: PrismaClient) {}

  async toggle(userId: string, stayId: string): Promise<boolean> {
    const existing = await this.db.favorite.findUnique({
      where: { userId_stayId: { userId, stayId } },
    });

    if (existing) {
      await this.db.favorite.delete({
        where: { id: existing.id },
      });
      return false;
    } else {
      await this.db.favorite.create({
        data: { userId, stayId },
      });
      return true;
    }
  }

  async isFavorite(userId: string, stayId: string): Promise<boolean> {
    const count = await this.db.favorite.count({
      where: { userId, stayId },
    });
    return count > 0;
  }

  async listByUser(userId: string): Promise<StayWithCover[]> {
    const rows = await this.db.favorite.findMany({
      where: { userId },
      include: {
        stay: {
          include: {
            images: { orderBy: { orderIdx: "asc" }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((r) => ({
      ...r.stay,
      pricePerNight: Number(r.stay.pricePerNight),
      status: r.stay.status as StayStatus,
      coverImageUrl: r.stay.images[0]?.url ?? null,
    }));
  }
}
