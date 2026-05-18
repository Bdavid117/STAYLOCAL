"use server";

import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { usersDeps } from "@/modules/users/composition";
import { resetPassword } from "@/modules/users/services/reset-password";
import { InvalidResetTokenError } from "@/modules/users/services/errors";

export type ResetState = { error?: string } | null;

export async function resetAction(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  try {
    const { users, tokens } = usersDeps();
    await resetPassword(
      {
        token: String(formData.get("token") ?? ""),
        newPassword: String(formData.get("newPassword") ?? ""),
      },
      { users, tokens }
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return { error: err.issues[0]?.message ?? "Datos inválidos" };
    }
    if (err instanceof InvalidResetTokenError) {
      return { error: err.message };
    }
    console.error("resetAction", err);
    return { error: "No pudimos restablecer la contraseña. Inténtalo de nuevo." };
  }
  redirect("/login?registered=1");
}
