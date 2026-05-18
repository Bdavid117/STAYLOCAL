import type { NotificationRepository } from "@/modules/notifications/domain/types";

export async function markAllRead(
  userId: string,
  deps: { notifications: NotificationRepository }
): Promise<number> {
  return deps.notifications.markAllRead(userId);
}
