// GET /bookings/[id]/receipt
//
// Devuelve el HTML del comprobante como documento completo (text/html).
// Esto evita usar iframe — el navegador renderiza la página entera,
// el contenido scrollea naturalmente y al presionar ⌘P se imprime
// el comprobante limpio sin header/footer de la app.

import { NextResponse } from "next/server";
import { auth } from "@/shared/auth";
import { prisma } from "@/shared/db";
import { paymentsDeps } from "@/modules/payments/composition";
import { enumerateNights } from "@/modules/stays/domain/dates";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", _req.url));
  }
  const { id: bookingId } = await ctx.params;

  const payment = await prisma.payment.findUnique({
    where: { bookingId },
    include: {
      booking: {
        include: {
          stay: { include: { host: { select: { name: true } } } },
          guest: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
  if (!payment || payment.booking.guestId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { receipts } = paymentsDeps();
  const nights = enumerateNights(
    payment.booking.checkIn,
    payment.booking.checkOut
  ).length;
  const html = receipts.toHtml({
    payment: {
      id: payment.id,
      bookingId: payment.bookingId,
      amount: payment.amount.toNumber(),
      currency: payment.currency,
      provider: payment.provider,
      providerRef: payment.providerRef,
      status: payment.status as "PENDING" | "PAID" | "FAILED" | "REFUNDED",
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
  });

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
