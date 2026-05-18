// Helpers de notificación específicos por evento del dominio.
// Se usan como fire-and-forget desde los server actions, así no
// contaminan los services de bookings/payments/reviews con
// efectos secundarios de mensajería.

import type { PrismaClient } from "@prisma/client";
import { notifyQuiet } from "@/modules/notifications/services/send-notification";
import { notificationsDeps } from "@/modules/notifications/composition";

export async function notifyBookingCreated(input: {
  bookingId: string;
  guestId: string;
  hostId: string;
  stayTitle: string;
  checkIn: Date;
  checkOut: Date;
}): Promise<void> {
  const deps = notificationsDeps();
  const checkIn = isoDate(input.checkIn);
  const checkOut = isoDate(input.checkOut);
  const payload = {
    bookingId: input.bookingId,
    stayTitle: input.stayTitle,
    checkIn,
    checkOut,
  };
  await Promise.all([
    notifyQuiet(
      {
        userId: input.guestId,
        type: "BOOKING_CREATED",
        payload: { ...payload, role: "guest" },
      },
      deps
    ),
    notifyQuiet(
      {
        userId: input.hostId,
        type: "BOOKING_CREATED",
        payload: { ...payload, role: "host" },
        email: true,
      },
      deps
    ),
  ]);
}

export async function notifyBookingCancelled(input: {
  bookingId: string;
  guestId: string;
  hostId: string;
  stayTitle: string;
}): Promise<void> {
  const deps = notificationsDeps();
  const payload = { bookingId: input.bookingId, stayTitle: input.stayTitle };
  await Promise.all([
    notifyQuiet({ userId: input.guestId, type: "BOOKING_CANCELLED", payload }, deps),
    notifyQuiet({ userId: input.hostId, type: "BOOKING_CANCELLED", payload }, deps),
  ]);
}

export async function notifyPaymentReceived(input: {
  bookingId: string;
  guestId: string;
  hostId: string;
  stayTitle: string;
  amount: number;
}): Promise<void> {
  const deps = notificationsDeps();
  const payload = {
    bookingId: input.bookingId,
    stayTitle: input.stayTitle,
    amount: input.amount,
  };
  await Promise.all([
    notifyQuiet(
      { userId: input.guestId, type: "PAYMENT_RECEIVED", payload: { ...payload, role: "guest" } },
      deps
    ),
    notifyQuiet(
      {
        userId: input.hostId,
        type: "PAYMENT_RECEIVED",
        payload: { ...payload, role: "host" },
        email: true,
      },
      deps
    ),
  ]);
}

export async function notifyReviewReceived(input: {
  bookingId: string;
  stayId: string;
  hostId: string;
  stayTitle: string;
  guestName: string;
  rating: number;
}): Promise<void> {
  const deps = notificationsDeps();
  await notifyQuiet(
    {
      userId: input.hostId,
      type: "REVIEW_RECEIVED",
      payload: {
        bookingId: input.bookingId,
        stayId: input.stayId,
        stayTitle: input.stayTitle,
        guestName: input.guestName,
        rating: input.rating,
      },
    },
    deps
  );
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Carga adicional: dado un bookingId, recupera contexto suficiente para
// disparar las notificaciones sin que cada action tenga que cargar
// stay + host por separado.
export async function bookingContext(
  db: PrismaClient,
  bookingId: string
): Promise<{
  bookingId: string;
  guestId: string;
  hostId: string;
  stayId: string;
  stayTitle: string;
  checkIn: Date;
  checkOut: Date;
  guestName: string;
} | null> {
  const b = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      stay: { select: { id: true, title: true, hostId: true } },
      guest: { select: { name: true } },
    },
  });
  if (!b) return null;
  return {
    bookingId: b.id,
    guestId: b.guestId,
    hostId: b.stay.hostId,
    stayId: b.stay.id,
    stayTitle: b.stay.title,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    guestName: b.guest.name,
  };
}
