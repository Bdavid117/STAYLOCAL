"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { auth } from "@/shared/auth";
import { usersDeps } from "@/modules/users/composition";
import { updateProfile } from "@/modules/users/services/update-profile";
import { UserNotFoundError } from "@/modules/users/services/errors";

export type ProfileState = { ok?: boolean; error?: string } | null;

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sesión expirada." };

  try {
    const { users } = usersDeps();
    await updateProfile(
      session.user.id,
      {
        name: String(formData.get("name") ?? ""),
        phone: (formData.get("phone") as string | null) ?? null,
        photoUrl: (formData.get("photoUrl") as string | null) ?? null,
      },
      { users }
    );
    revalidatePath("/profile");
    return { ok: true };
  } catch (err) {
    if (err instanceof ZodError) {
      return { error: err.issues[0]?.message ?? "Datos inválidos" };
    }
    if (err instanceof UserNotFoundError) {
      return { error: err.message };
    }
    console.error("updateProfileAction", err);
    return { error: "No pudimos guardar los cambios." };
  }
}
