// Dominio del módulo notifications.

export type NotificationType =
  | "BOOKING_CREATED"
  | "BOOKING_CANCELLED"
  | "PAYMENT_RECEIVED"
  | "REVIEW_RECEIVED"
  | "REMINDER";

// El payload es JSON libre — cada tipo define su shape esperado, y
// el renderer en domain/render.ts traduce a UI/correo.
export type NotificationPayload = Record<string, unknown> & {
  bookingId?: string;
};

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  payload: NotificationPayload;
  readAt: Date | null;
  createdAt: Date;
};

export interface NotificationRepository {
  create(input: {
    userId: string;
    type: NotificationType;
    payload: NotificationPayload;
  }): Promise<Notification>;
  listForUser(userId: string, limit?: number): Promise<Notification[]>;
  unreadCount(userId: string): Promise<number>;
  markAllRead(userId: string): Promise<number>;
  /** Lista REMINDER ya creados para una colección de bookingIds — usado
   *  por sendUpcomingReminders para evitar duplicados. */
  findReminderBookingIds(bookingIds: string[]): Promise<Set<string>>;
}
