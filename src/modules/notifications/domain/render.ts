// Traduce un Notification a algo presentable en UI y en correo.
// Mantenerlo en domain/ porque es lógica pura, sin framework.

import type { Notification } from "./types";

export type RenderedNotification = {
  title: string;
  body: string;
  href: string | null;
  tone: "moss" | "terracotta" | "ochre" | "neutral";
};

function money(n: unknown): string {
  if (typeof n !== "number") return "—";
  return `$${n.toLocaleString("es-CO")}`;
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

export function renderNotification(n: Notification): RenderedNotification {
  const p = n.payload ?? {};
  const bookingId = typeof p.bookingId === "string" ? p.bookingId : null;
  const stay = str(p.stayTitle, "tu alojamiento");
  const href = bookingId ? `/bookings/${bookingId}` : null;

  switch (n.type) {
    case "BOOKING_CREATED": {
      const role = str(p.role);
      return {
        title:
          role === "host"
            ? `Nueva reserva en ${stay}`
            : `Tu reserva en ${stay} está confirmada`,
        body:
          role === "host"
            ? `Recibiste una reserva del ${str(p.checkIn)} al ${str(p.checkOut)}.`
            : `Del ${str(p.checkIn)} al ${str(p.checkOut)}. Pasa a pagar para asegurar las fechas.`,
        href,
        tone: "moss",
      };
    }
    case "BOOKING_CANCELLED":
      return {
        title: `Reserva cancelada en ${stay}`,
        body: "Las fechas asociadas quedaron libres en el calendario.",
        href,
        tone: "neutral",
      };
    case "PAYMENT_RECEIVED": {
      const role = str(p.role);
      return {
        title:
          role === "host"
            ? `Recibiste un pago de ${money(p.amount)}`
            : `Tu pago de ${money(p.amount)} fue confirmado`,
        body:
          role === "host"
            ? `Por la reserva en ${stay}. Tu calendario ya está bloqueado.`
            : `Conserva el comprobante que llegó a tu correo.`,
        href,
        tone: "moss",
      };
    }
    case "REVIEW_RECEIVED":
      return {
        title: `${str(p.guestName, "Un huésped")} calificó ${stay}`,
        body: `Le dio ${typeof p.rating === "number" ? p.rating : "—"} de 5 estrellas.`,
        href: typeof p.stayId === "string" ? `/stays/${p.stayId}` : href,
        tone: "ochre",
      };
    case "REMINDER":
      return {
        title: `Faltan ${typeof p.daysUntil === "number" ? p.daysUntil : "?"} días para tu llegada`,
        body: `Te esperamos en ${stay} el ${str(p.checkIn)}.`,
        href,
        tone: "terracotta",
      };
  }
}
