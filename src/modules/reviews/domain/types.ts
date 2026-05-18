// Dominio del módulo reviews. Services dependen de estas interfaces.

export type Review = {
  id: string;
  bookingId: string;
  stayId: string;
  userId: string;
  rating: number; // 1..5 validado en application
  comment: string;
  createdAt: Date;
};

export type ReviewWithAuthor = Review & {
  author: { name: string; photoUrl: string | null };
};

export interface ReviewRepository {
  findByBookingId(bookingId: string): Promise<Review | null>;
  create(input: {
    bookingId: string;
    stayId: string;
    userId: string;
    rating: number;
    comment: string;
  }): Promise<Review>;
  listByStay(stayId: string, limit?: number): Promise<ReviewWithAuthor[]>;
}
