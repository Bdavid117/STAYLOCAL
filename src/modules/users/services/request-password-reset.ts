// CU-03 (parte 1) — Recuperar Contraseña: emite token y envía correo.
//
// Política deliberada: si el correo no existe en la base, devolvemos
// igual una respuesta exitosa (sin enviar nada). Esto evita revelar
// qué correos están registrados — un detalle pequeño pero estándar.

import { z } from "zod";
import type {
  PasswordResetRepository,
  UserRepository,
} from "@/modules/users/domain/types";
import type { MailerPort } from "@/shared/ports/mailer";
import { generateResetToken, resetTokenExpiry } from "@/modules/users/domain/reset-token";

export const requestPasswordResetSchema = z.object({
  email: z.string().email("Correo inválido"),
});

export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

export async function requestPasswordReset(
  input: RequestPasswordResetInput,
  deps: {
    users: UserRepository;
    tokens: PasswordResetRepository;
    mailer: MailerPort;
    appUrl: string;
  }
): Promise<{ sent: boolean }> {
  const { email } = requestPasswordResetSchema.parse(input);

  const user = await deps.users.findByEmail(email);
  if (!user) return { sent: false };

  // Un solo token activo por usuario.
  await deps.tokens.deleteAllForUser(user.id);

  const { raw, hash } = generateResetToken();
  await deps.tokens.create({
    userId: user.id,
    tokenHash: hash,
    expiresAt: resetTokenExpiry(),
  });

  const link = `${deps.appUrl.replace(/\/$/, "")}/reset/${raw}`;
  await deps.mailer.send({
    to: user.email,
    subject: "Recupera tu contraseña en StayLocal",
    html: `
      <p>Hola ${user.name},</p>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p><a href="${link}">Restablecer contraseña</a></p>
      <p>Si no fuiste tú, ignora este correo. El enlace expira en 30 minutos.</p>
    `,
    text: `Restablece tu contraseña abriendo: ${link}\nExpira en 30 minutos.`,
  });

  return { sent: true };
}
