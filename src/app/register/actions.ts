"use server";

import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { usersDeps } from "@/modules/users/composition";
import { registerUser } from "@/modules/users/services/register-user";
import { EmailAlreadyRegisteredError } from "@/modules/users/services/errors";

export type RegisterState = { error?: string } | null;

export async function registerAction(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  try {
    const { users } = usersDeps();
    await registerUser(
      {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      },
      { users }
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return { error: err.issues[0]?.message ?? "Datos inválidos" };
    }
    if (err instanceof EmailAlreadyRegisteredError) {
      return { error: err.message };
    }
    console.error("registerAction", err);
    return { error: "No pudimos crear tu cuenta. Inténtalo de nuevo." };
  }
  redirect("/login?registered=1");
}
