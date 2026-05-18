// Lista de reseñas para mostrar en la ficha del alojamiento.
// CU-25 "Ver Calificación Promedio" se calcula con prisma.review.aggregate
// directamente desde las páginas — aquí solo se exponen las reseñas en sí.

import type {
  ReviewRepository,
  ReviewWithAuthor,
} from "@/modules/reviews/domain/types";

export async function listReviewsForStay(
  stayId: string,
  deps: { reviews: ReviewRepository },
  limit = 12
): Promise<ReviewWithAuthor[]> {
  return deps.reviews.listByStay(stayId, limit);
}
