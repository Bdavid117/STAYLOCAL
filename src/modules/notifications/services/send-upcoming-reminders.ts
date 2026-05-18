// CU-27 Enviar Recordatorio. Proceso programado: busca reservas
// confirmadas cuyo check-in cae en los próximos N días, genera
// notificaciones REMINDER si no existen previamente y las envía
// por correo. Idempotente — correrlo dos veces el mismo día no
// crea duplicados.

import type { PrismaClient } from "@prisma/client";
import { sendNotification } from "./send-notification";
import type { SendNotificationDeps } from "./send-notification";
import { toUtcDate } from "@/modules/stays/domain/dates";

export type SendUpcomingRemindersInput = {
  daysAhead?: number; // ventana — por defecto 2 días
  now?: Date;
};

export type SendUpcomingRemindersResult = {
  considered: number;
  sent: number;
  skipped: number;
};

export async function sendUpcomingReminders(
  input: SendUpcomingRemindersInput,
  deps: SendNotificationDeps & { db: PrismaClient }
): Promise<SendUpcomingRemindersResult> {
  const daysAhead = input.daysAhead ?? 2;
  const now = input.now ?? new Date();
  const windowEnd = new Date(now.getTime() + daysAhead * 86_400_000);

  // Reservas confirmadas (pagas o no) cuyo check-in está en el rango
  // [hoy, hoy+N días]. Si la reserva ya pasó (checkIn < hoy), no
  // recordamos.
  // gte = inicio del día UTC para incluir reservas de hoy mismo;
  // lte = windowEnd sin truncar para incluir bookings cuyo checkIn
  // cae justo al borde de la ventana.
  const bookings = await deps.db.booking.findMany({
    where: {
      status: "CONFIRMED",
      checkIn: { gte: toUtcDate(now), lte: windowEnd },
    },
    select: {
      id: true,
      guestId: true,
      checkIn: true,
      stay: { select: { title: true, locationText: true } },
    },
  });

  if (bookings.length === 0) {
    return { considered: 0, sent: 0, skipped: 0 };
  }

  const alreadySent = await deps.notifications.findReminderBookingIds(
    bookings.map((b) => b.id)
  );

  let sent = 0;
  for (const b of bookings) {
    if (alreadySent.has(b.id)) continue;
    const daysUntil = Math.max(
      0,
      Math.round((b.checkIn.getTime() - now.getTime()) / 86_400_000)
    );
    await sendNotification(
      {
        userId: b.guestId,
        type: "REMINDER",
        payload: {
          bookingId: b.id,
          stayTitle: b.stay.title,
          locationText: b.stay.locationText,
          checkIn: b.checkIn.toISOString().slice(0, 10),
          daysUntil,
        },
        email: true,
      },
      deps
    );
    sent++;
  }

  return {
    considered: bookings.length,
    sent,
    skipped: bookings.length - sent,
  };
}
