// CU-26 Enviar Notificación. Crea el registro en DB y opcionalmente
// envía un correo con el mismo título/cuerpo.

import type {
  Notification,
  NotificationPayload,
  NotificationRepository,
  NotificationType,
} from "@/modules/notifications/domain/types";
import { renderNotification } from "@/modules/notifications/domain/render";
import type { MailerPort } from "@/shared/ports/mailer";
import type { PrismaClient } from "@prisma/client";

export type SendNotificationInput = {
  userId: string;
  type: NotificationType;
  payload: NotificationPayload;
  email?: boolean; // si true, también envía correo
};

export type SendNotificationDeps = {
  db: PrismaClient;
  notifications: NotificationRepository;
  mailer: MailerPort;
};

export async function sendNotification(
  input: SendNotificationInput,
  deps: SendNotificationDeps
): Promise<Notification> {
  const notif = await deps.notifications.create({
    userId: input.userId,
    type: input.type,
    payload: input.payload,
  });

  if (input.email) {
    const user = await deps.db.user.findUnique({
      where: { id: input.userId },
      select: { email: true, name: true },
    });
    if (user) {
      const rendered = renderNotification(notif);
      await deps.mailer.send({
        to: user.email,
        subject: `StayLocal · ${rendered.title}`,
        html: `<p>Hola ${escapeHtml(user.name)},</p>
               <p><strong>${escapeHtml(rendered.title)}</strong></p>
               <p>${escapeHtml(rendered.body)}</p>`,
        text: `${rendered.title}\n\n${rendered.body}`,
      });
    }
  }

  return notif;
}

// Wrapper "no rompe el flujo" — para usar como side-effect desde
// server actions sin propagar errores de notificación.
export async function notifyQuiet(
  input: SendNotificationInput,
  deps: SendNotificationDeps
): Promise<void> {
  try {
    await sendNotification(input, deps);
  } catch (err) {
    console.error("notifyQuiet falló", input.type, err);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
