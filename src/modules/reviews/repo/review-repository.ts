import type { PrismaClient } from "@prisma/client";
import type {
  Review,
  ReviewRepository,
  ReviewWithAuthor,
} from "@/modules/reviews/domain/types";

export class PrismaReviewRepository implements ReviewRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByBookingId(bookingId: string): Promise<Review | null> {
    return this.db.review.findUnique({ where: { bookingId } });
  }

  async create(input: {
    bookingId: string;
    stayId: string;
    userId: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    return this.db.review.create({ data: input });
  }

  async listByStay(stayId: string, limit = 20): Promise<ReviewWithAuthor[]> {
    const rows = await this.db.review.findMany({
      where: { stayId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { name: true, photoUrl: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      bookingId: r.bookingId,
      stayId: r.stayId,
      userId: r.userId,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      author: { name: r.user.name, photoUrl: r.user.photoUrl },
    }));
  }
}
