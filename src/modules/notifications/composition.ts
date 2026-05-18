import { prisma } from "@/shared/db";
import { getMailer } from "@/shared/mailer";
import { PrismaNotificationRepository } from "@/modules/notifications/repo/notification-repository";

export function notificationsDeps() {
  return {
    db: prisma,
    notifications: new PrismaNotificationRepository(prisma),
    mailer: getMailer(),
  };
}
