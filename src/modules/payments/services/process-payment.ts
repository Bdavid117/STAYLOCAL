// CU-21 Realizar Pago. Procesa el cobro de una reserva ya confirmada
// y, en caso de éxito, dispara la generación del comprobante (CU-22).
//
// Reglas:
// - Solo el huésped dueño de la reserva puede pagarla.
// - La reserva debe estar CONFIRMED (no cancelada ni completada).
// - Solo un pago PAID por reserva — los intentos FAILED se pueden
//   reintentar reciclando el mismo registro.

import type { PrismaClient } from "@prisma/client";
import type {
  Payment,
  PaymentRepository,
  ReceiptRenderer,
} from "@/modules/payments/domain/types";
import type { PaymentGatewayPort } from "@/shared/ports/payment-gateway";
import type { MailerPort } from "@/shared/ports/mailer";
import {
  BookingNotPayableError,
  PaymentAlreadyExistsError,
  PaymentDeclinedError,
} from "./errors";
import { generateReceipt } from "./generate-receipt";

export type ProcessPaymentDeps = {
  db: PrismaClient;
  payments: PaymentRepository;
  gateway: PaymentGatewayPort;
  receipts: ReceiptRenderer;
  mailer: MailerPort;
};

export async function processPayment(
  guestId: string,
  bookingId: string,
  deps: ProcessPaymentDeps
): Promise<Payment> {
  const booking = await deps.db.booking.findFirst({
    where: { id: bookingId, guestId },
    include: {
      stay: { select: { title: true, locationText: true, pricePerNight: true, host: { select: { name: true } } } },
      guest: { select: { name: true, email: true } },
    },
  });
  if (!booking) throw new BookingNotPayableError("Reserva no encontrada.");
  if (booking.status !== "CONFIRMED") {
    throw new BookingNotPayableError(
      `No se puede pagar una reserva en estado ${booking.status.toLowerCase()}.`
    );
  }

  const existing = await deps.payments.findByBookingId(bookingId);
  if (existing && existing.status === "PAID") {
    throw new PaymentAlreadyExistsError();
  }

  // Crea (o reusa) el registro PENDING. Mantenemos un Payment por
  // booking (UNIQUE en DB), así que si hubo un FAILED previo lo
  // reciclamos transitando su estado.
  const payment =
    existing ??
    (await deps.payments.create({
      bookingId,
      amount: booking.totalAmount.toNumber(),
      currency: "COP",
      provider: process.env.PAYMENT_PROVIDER ?? "fake",
    }));

  // Cobro real (o simulado).
  let result;
  try {
    result = await deps.gateway.charge({
      bookingId,
      amount: payment.amount,
      currency: payment.currency,
      customerEmail: booking.guest.email,
      description: `Reserva ${bookingId} — ${booking.stay.title}`,
    });
  } catch (err) {
    await deps.payments.markFailed(payment.id, null);
    throw new PaymentDeclinedError(
      err instanceof Error ? err.message : "Error en la pasarela."
    );
  }

  if (result.status !== "PAID") {
    await deps.payments.markFailed(payment.id, result.providerRef);
    throw new PaymentDeclinedError();
  }

  const paid = await deps.payments.markPaid(payment.id, {
    providerRef: result.providerRef,
    paidAt: new Date(),
  });

  // CU-22 — comprobante por correo. Si el envío de correo falla, no
  // queremos revertir el pago: ya quedó cobrado. Loggeamos y seguimos.
  try {
    await generateReceipt(paid.id, {
      db: deps.db,
      payments: deps.payments,
      receipts: deps.receipts,
      mailer: deps.mailer,
    });
  } catch (err) {
    console.error("generateReceipt fallido tras pago", paid.id, err);
  }

  return paid;
}
