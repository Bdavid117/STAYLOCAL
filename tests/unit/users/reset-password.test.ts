import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import { requestPasswordReset } from "@/modules/users/services/request-password-reset";
import { resetPassword } from "@/modules/users/services/reset-password";
import { hashResetToken } from "@/modules/users/domain/reset-token";
import { InvalidResetTokenError } from "@/modules/users/services/errors";
import {
  InMemoryMailer,
  InMemoryPasswordResetRepository,
  InMemoryUserRepository,
} from "./fakes";

const APP_URL = "http://localhost:3000";

async function seedUser(users: InMemoryUserRepository) {
  return users.create({
    email: "alice@example.com",
    name: "Alice",
    passwordHash: await bcrypt.hash("originalPass", 12),
  });
}

function extractTokenFromMail(html: string): string {
  const m = html.match(/\/reset\/([a-f0-9]{64})/);
  if (!m) throw new Error("No token in mail");
  return m[1];
}

describe("CU-03 flujo completo de recuperación de contraseña", () => {
  it("guarda token hasheado, envía correo con token crudo y permite restablecer", async () => {
    const users = new InMemoryUserRepository();
    const tokens = new InMemoryPasswordResetRepository();
    const mailer = new InMemoryMailer();
    const user = await seedUser(users);

    const result = await requestPasswordReset(
      { email: user.email },
      { users, tokens, mailer, appUrl: APP_URL }
    );

    expect(result).toEqual({ sent: true });
    expect(mailer.sent).toHaveLength(1);
    const rawToken = extractTokenFromMail(mailer.sent[0].html);

    const stored = tokens.list();
    expect(stored).toHaveLength(1);
    expect(stored[0].tokenHash).toBe(hashResetToken(rawToken));
    expect(stored[0].tokenHash).not.toBe(rawToken); // hash != crudo

    await resetPassword(
      { token: rawToken, newPassword: "nuevaSegura123" },
      { users, tokens }
    );

    const reloaded = await users.findById(user.id);
    expect(await bcrypt.compare("nuevaSegura123", reloaded!.passwordHash)).toBe(true);
    expect(tokens.list()[0].usedAt).not.toBeNull();
  });

  it("para correo desconocido devuelve sent:false sin enviar nada", async () => {
    const users = new InMemoryUserRepository();
    const tokens = new InMemoryPasswordResetRepository();
    const mailer = new InMemoryMailer();

    const result = await requestPasswordReset(
      { email: "nadie@example.com" },
      { users, tokens, mailer, appUrl: APP_URL }
    );

    expect(result).toEqual({ sent: false });
    expect(mailer.sent).toHaveLength(0);
    expect(tokens.list()).toHaveLength(0);
  });

  it("rechaza token expirado", async () => {
    const users = new InMemoryUserRepository();
    const tokens = new InMemoryPasswordResetRepository();
    const mailer = new InMemoryMailer();
    const user = await seedUser(users);

    await requestPasswordReset(
      { email: user.email },
      { users, tokens, mailer, appUrl: APP_URL }
    );
    const rawToken = extractTokenFromMail(mailer.sent[0].html);

    const future = new Date(Date.now() + 60 * 60_000); // 1h adelante

    await expect(
      resetPassword(
        { token: rawToken, newPassword: "nuevaSegura123" },
        { users, tokens, now: () => future }
      )
    ).rejects.toBeInstanceOf(InvalidResetTokenError);
  });

  it("rechaza token ya usado", async () => {
    const users = new InMemoryUserRepository();
    const tokens = new InMemoryPasswordResetRepository();
    const mailer = new InMemoryMailer();
    const user = await seedUser(users);

    await requestPasswordReset(
      { email: user.email },
      { users, tokens, mailer, appUrl: APP_URL }
    );
    const rawToken = extractTokenFromMail(mailer.sent[0].html);

    await resetPassword(
      { token: rawToken, newPassword: "primeraVez1234" },
      { users, tokens }
    );

    await expect(
      resetPassword(
        { token: rawToken, newPassword: "segundaVez1234" },
        { users, tokens }
      )
    ).rejects.toBeInstanceOf(InvalidResetTokenError);
  });

  it("rechaza token inexistente", async () => {
    const users = new InMemoryUserRepository();
    const tokens = new InMemoryPasswordResetRepository();
    await expect(
      resetPassword(
        { token: "a".repeat(64), newPassword: "loQueSea1234" },
        { users, tokens }
      )
    ).rejects.toBeInstanceOf(InvalidResetTokenError);
  });

  it("rechaza contraseña menor a 8 caracteres (validación zod)", async () => {
    const users = new InMemoryUserRepository();
    const tokens = new InMemoryPasswordResetRepository();
    await expect(
      resetPassword(
        { token: "a".repeat(64), newPassword: "corta" },
        { users, tokens }
      )
    ).rejects.toThrow();
  });

  it("emitir un segundo token invalida el primero", async () => {
    const users = new InMemoryUserRepository();
    const tokens = new InMemoryPasswordResetRepository();
    const mailer = new InMemoryMailer();
    const user = await seedUser(users);

    await requestPasswordReset(
      { email: user.email },
      { users, tokens, mailer, appUrl: APP_URL }
    );
    const firstToken = extractTokenFromMail(mailer.sent[0].html);

    await requestPasswordReset(
      { email: user.email },
      { users, tokens, mailer, appUrl: APP_URL }
    );

    await expect(
      resetPassword(
        { token: firstToken, newPassword: "loQueSea1234" },
        { users, tokens }
      )
    ).rejects.toBeInstanceOf(InvalidResetTokenError);
  });
});
