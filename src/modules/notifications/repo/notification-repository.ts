import type { PrismaClient } from "@prisma/client";
import type {
  Notification,
  NotificationPayload,
  NotificationRepository,
  NotificationType,
} from "@/modules/notifications/domain/types";

function toNotification(row: {
  id: string;
  userId: string;
  type: string;
  payload: unknown;
  readAt: Date | null;
  createdAt: Date;
}): Notification {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type as NotificationType,
    payload: (row.payload ?? {}) as NotificationPayload,
    readAt: row.readAt,
    createdAt: row.createdAt,
  };
}

export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(input: {
    userId: string;
    type: NotificationType;
    payload: NotificationPayload;
  }): Promise<Notification> {
    const row = await this.db.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        payload: input.payload as object,
      },
    });
    return toNotification(row);
  }

  async listForUser(userId: string, limit = 50): Promise<Notification[]> {
    const rows = await this.db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map(toNotification);
  }

  async unreadCount(userId: string): Promise<number> {
    return this.db.notification.count({
      where: { userId, readAt: null },
    });
  }

  async markAllRead(userId: string): Promise<number> {
    const res = await this.db.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return res.count;
  }

  async findReminderBookingIds(bookingIds: string[]): Promise<Set<string>> {
    if (bookingIds.length === 0) return new Set();
    const rows = await this.db.notification.findMany({
      where: {
        type: "REMINDER",
        // payload->>'bookingId' in (...) — Prisma JSON filter
        OR: bookingIds.map((id) => ({
          payload: { path: ["bookingId"], equals: id },
        })),
      },
      select: { payload: true },
    });
    const seen = new Set<string>();
    for (const r of rows) {
      const p = r.payload as { bookingId?: string } | null;
      if (p?.bookingId) seen.add(p.bookingId);
    }
    return seen;
  }
}
