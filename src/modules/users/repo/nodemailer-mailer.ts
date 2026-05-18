import nodemailer, { type Transporter } from "nodemailer";
import type { MailerPort, SendMailInput } from "@/shared/ports/mailer";

// Adapter SMTP genérico — apunta a MailHog en dev (localhost:1025) o a un
// servidor SMTP real en prod.
export class NodemailerMailer implements MailerPort {
  private transporter: Transporter;
  private from: string;

  constructor(config: {
    host: string;
    port: number;
    user?: string;
    pass?: string;
    from: string;
  }) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: false,
      auth: config.user ? { user: config.user, pass: config.pass } : undefined,
    });
    this.from = config.from;
  }

  async send(input: SendMailInput): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
  }
}
