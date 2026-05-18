// CU-03 (parte 2) — Aplica la nueva contraseña dado un token válido.

import bcrypt from "bcryptjs";
import { z } from "zod";
import type {
  PasswordResetRepository,
  UserRepository,
} from "@/modules/users/domain/types";
import { hashResetToken } from "@/modules/users/domain/reset-token";
import { InvalidResetTokenError } from "./errors";

export const resetPasswordSchema = z.object({
  token: z.string().min(32),
  newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export async function resetPassword(
  input: ResetPasswordInput,
  deps: {
    users: UserRepository;
    tokens: PasswordResetRepository;
    now?: () => Date;
  }
): Promise<void> {
  const { token, newPassword } = resetPasswordSchema.parse(input);
  const now = (deps.now ?? (() => new Date()))();

  const record = await deps.tokens.findByTokenHash(hashResetToken(token));
  if (!record) throw new InvalidResetTokenError();
  if (record.usedAt) throw new InvalidResetTokenError("Ese enlace ya fue usado.");
  if (record.expiresAt <= now) throw new InvalidResetTokenError();

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await deps.users.updatePasswordHash(record.userId, passwordHash);
  await deps.tokens.markUsed(record.id);
}
