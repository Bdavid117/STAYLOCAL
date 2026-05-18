import { prisma } from "@/shared/db";
import { PrismaReviewRepository } from "@/modules/reviews/repo/review-repository";

export function reviewsDeps() {
  return {
    db: prisma,
    reviews: new PrismaReviewRepository(prisma),
  };
}
