import type { PrismaClient } from "@prisma/client";
import type { StayImage, StayImageRepository } from "@/modules/stays/domain/types";

export class PrismaStayImageRepository implements StayImageRepository {
  constructor(private readonly db: PrismaClient) {}

  async listByStay(stayId: string): Promise<StayImage[]> {
    return this.db.stayImage.findMany({
      where: { stayId },
      orderBy: { orderIdx: "asc" },
    });
  }

  async append(stayId: string, url: string): Promise<StayImage> {
    const count = await this.db.stayImage.count({ where: { stayId } });
    return this.db.stayImage.create({
      data: { stayId, url, orderIdx: count },
    });
  }

  async delete(id: string): Promise<StayImage | null> {
    try {
      return await this.db.stayImage.delete({ where: { id } });
    } catch {
      return null;
    }
  }
}
