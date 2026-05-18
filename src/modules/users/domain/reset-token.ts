import { randomBytes, createHash } from "node:crypto";

export const RESET_TOKEN_TTL_MINUTES = 30;

// Token aleatorio de 32 bytes (256 bits) en hex. El crudo se envía por
// correo; en DB solo persiste su hash SHA-256.
export function generateResetToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("hex");
  return { raw, hash: hashResetToken(raw) };
}

export function hashResetToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function resetTokenExpiry(now: Date = new Date()): Date {
  return new Date(now.getTime() + RESET_TOKEN_TTL_MINUTES * 60_000);
}
