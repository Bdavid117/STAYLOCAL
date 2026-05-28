"use server";

import { auth } from "@/shared/auth";
import { staysDeps } from "@/modules/stays/composition";
import { toggleFavorite } from "@/modules/stays/services/toggle-favorite";
import { revalidatePath } from "next/cache";

export async function toggleFavoriteAction(stayId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Debes iniciar sesión para guardar favoritos" };
  }

  try {
    const isFavorite = await toggleFavorite(session.user.id, stayId, staysDeps());
    revalidatePath("/favorites");
    revalidatePath(`/stays/${stayId}`);
    revalidatePath("/");
    revalidatePath("/search");
    return { isFavorite };
  } catch (err) {
    return { error: "No se pudo actualizar favoritos" };
  }
}
