import type { MailerPort } from "@/shared/ports/mailer";
import { NodemailerMailer } from "@/modules/users/repo/nodemailer-mailer";

let cached: MailerPort | null = null;

export function getMailer(): MailerPort {
  if (cached) return cached;
  cached = new NodemailerMailer({
    host: process.env.SMTP_HOST ?? "localhost",
    port: Number(process.env.SMTP_PORT ?? 1025),
    user: process.env.SMTP_USER || undefined,
    pass: process.env.SMTP_PASS || undefined,
    from: process.env.MAIL_FROM ?? "StayLocal <no-reply@staylocal.local>",
  });
  return cached;
}
