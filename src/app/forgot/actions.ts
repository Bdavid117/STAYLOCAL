"use server";

import { ZodError } from "zod";
import { usersDeps } from "@/modules/users/composition";
import { requestPasswordReset } from "@/modules/users/services/request-password-reset";

export type ForgotState = { ok?: boolean; error?: string } | null;

export async function forgotAction(
  _prev: ForgotState,
  formData: FormData
): Promise<ForgotState> {
  try {
    const { users, tokens, mailer } = usersDeps();
    await requestPasswordReset(
      { email: String(formData.get("email") ?? "") },
      {
        users,
        tokens,
        mailer,
        appUrl: process.env.AUTH_URL ?? "http://localhost:3000",
      }
    );
    // Devolvemos OK aunque el correo no exista — no revelamos qué emails
    // están registrados.
    return { ok: true };
  } catch (err) {
    if (err instanceof ZodError) {
      return { error: err.issues[0]?.message ?? "Datos inválidos" };
    }
    console.error("forgotAction", err);
    return { error: "No pudimos procesar la solicitud. Inténtalo de nuevo." };
  }
}
