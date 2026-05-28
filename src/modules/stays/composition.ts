import { prisma } from "@/shared/db";
import { getStorage } from "@/shared/storage";
import { PrismaStayRepository } from "@/modules/stays/repo/stay-repository";
import { PrismaStayImageRepository } from "@/modules/stays/repo/stay-image-repository";
import { PrismaAvailabilityRepository } from "@/modules/stays/repo/availability-repository";
import { PrismaFavoriteRepository } from "@/modules/stays/repo/favorite-repository";

export function staysDeps() {
  return {
    stays: new PrismaStayRepository(prisma),
    images: new PrismaStayImageRepository(prisma),
    availability: new PrismaAvailabilityRepository(prisma),
    favorites: new PrismaFavoriteRepository(prisma),
    storage: getStorage(),
    db: prisma,
  };
}
