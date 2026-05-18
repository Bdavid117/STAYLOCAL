// CU-22 Generar Comprobante. Carga datos enriquecidos del pago, los
// pasa al renderer y envía el HTML por correo. También devuelve el
// HTML para que /bookings/[id]/receipt lo pueda mostrar imprimible.

import type { PrismaClient } from "@prisma/client";
import type {
  PaymentRepository,
  ReceiptInput,
  ReceiptRenderer,
} from "@/modules/payments/domain/types";
import type { MailerPort } from "@/shared/ports/mailer";
import { enumerateNights } from "@/modules/stays/domain/dates";
import { PaymentNotFoundError } from "./errors";

export type GenerateReceiptDeps = {
  db: PrismaClient;
  payments: PaymentRepository;
  receipts: ReceiptRenderer;
  mailer: MailerPort;
};

export type GeneratedReceipt = {
  html: string;
  text: string;
  sentTo: string;
};

export async function generateReceipt(
  paymentId: string,
  deps: GenerateReceiptDeps
): Promise<GeneratedReceipt> {
  const payment = await deps.db.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          stay: { include: { host: { select: { name: true } } } },
          guest: { select: { name: true, email: true } },
        },
      },
    },
  });
  if (!payment) throw new PaymentNotFoundError();

  const nights = enumerateNights(
    payment.booking.checkIn,
    payment.booking.checkOut
  ).length;

  const input: ReceiptInput = {
    payment: {
      id: payment.id,
      bookingId: payment.bookingId,
      amount: payment.amount.toNumber(),
      currency: payment.currency,
      provider: payment.provider,
      providerRef: payment.providerRef,
      status: payment.status as ReceiptInput["payment"]["status"],
      paidAt: payment.paidAt,
    },
    booking: {
      id: payment.booking.id,
      checkIn: payment.booking.checkIn,
      checkOut: payment.booking.checkOut,
      nights,
    },
    stay: {
      title: payment.booking.stay.title,
      locationText: payment.booking.stay.locationText,
      pricePerNight: payment.booking.stay.pricePerNight.toNumber(),
    },
    guest: {
      name: payment.booking.guest.name,
      email: payment.booking.guest.email,
    },
    hostName: payment.booking.stay.host.name,
  };

  const html = deps.receipts.toHtml(input);
  const text = deps.receipts.toText(input);

  await deps.mailer.send({
    to: input.guest.email,
    subject: `Comprobante StayLocal № ${payment.id.slice(-6).toUpperCase()}`,
    html,
    text,
  });

  return { html, text, sentTo: input.guest.email };
}
