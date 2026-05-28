import type { FavoriteRepository } from "@/modules/stays/domain/types";

export async function listFavorites(
  userId: string,
  deps: { favorites: FavoriteRepository }
) {
  return await deps.favorites.listByUser(userId);
}
