"use server";

import { redirect } from "next/navigation";
import { auth } from "@/shared/auth";
import { paymentsDeps } from "@/modules/payments/composition";
import { processPayment } from "@/modules/payments/services/process-payment";
import {
  BookingNotPayableError,
  PaymentAlreadyExistsError,
  PaymentDeclinedError,
} from "@/modules/payments/services/errors";
import {
  bookingContext,
  notifyPaymentReceived,
} from "@/modules/notifications/notify-event";

export type PayState = { error?: string } | null;

export async function payAction(
  bookingId: string,
  _prev: PayState,
  _formData: FormData
): Promise<PayState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  try {
    const deps = paymentsDeps();
    const payment = await processPayment(session.user.id, bookingId, deps);

    // Side-effect: notificar al host del ingreso (correo) + al guest in-app.
    const ctx = await bookingContext(deps.db, bookingId);
    if (ctx) {
      await notifyPaymentReceived({
        bookingId: ctx.bookingId,
        guestId: ctx.guestId,
        hostId: ctx.hostId,
        stayTitle: ctx.stayTitle,
        amount: payment.amount,
      });
    }
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    if (
      err instanceof BookingNotPayableError ||
      err instanceof PaymentAlreadyExistsError ||
      err instanceof PaymentDeclinedError
    ) {
      return { error: err.message };
    }
    console.error("payAction", err);
    return { error: "No pudimos procesar el pago. Inténtalo de nuevo." };
  }
  redirect(`/bookings/${bookingId}?paid=1`);
}
