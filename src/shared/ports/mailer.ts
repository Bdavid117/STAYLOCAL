// Puerto de correo (EIF-02). Adaptadores: nodemailer (SMTP/MailHog) y console (tests).

export type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export interface MailerPort {
  send(input: SendMailInput): Promise<void>;
}
