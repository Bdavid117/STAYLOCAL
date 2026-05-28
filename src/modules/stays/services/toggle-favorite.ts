import type { FavoriteRepository } from "@/modules/stays/domain/types";

export async function toggleFavorite(
  userId: string,
  stayId: string,
  deps: { favorites: FavoriteRepository }
) {
  return await deps.favorites.toggle(userId, stayId);
}
