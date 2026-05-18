import { notFound } from "next/navigation";
import { requireSession } from "@/shared/require-auth";
import { paymentsDeps } from "@/modules/payments/composition";
import { prisma } from "@/shared/db";
import { enumerateNights } from "@/modules/stays/domain/dates";

type Props = { params: Promise<{ id: string }> };

// Página standalone (sin Header/Footer del layout global) que sirve
// como vista previa imprimible del comprobante. El HTML viene del
// mismo renderer que se manda por correo.
//
// Truco: layout.tsx ya envuelve children con header/footer. Para que
// se sienta como un documento, esta página renderiza una hoja
// centrada con instrucciones de impresión arriba.
export default async function ReceiptPage({ params }: Props) {
  const { id: bookingId } = await params;
  const session = await requireSession();

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
  if (!payment || payment.booking.guestId !== session.user.id) notFound();

  const { receipts } = paymentsDeps();
  const nights = enumerateNights(payment.booking.checkIn, payment.booking.checkOut).length;
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

  return (
    <div>
      <div className="border-b border-line bg-bone print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 text-sm">
          <p className="text-ink-soft">
            Vista previa del comprobante. Usa{" "}
            <kbd className="num rounded border border-line bg-paper px-1.5 py-0.5 text-xs">⌘P</kbd>{" "}
            para imprimir o guardar como PDF.
          </p>
          <a
            href={`/bookings/${bookingId}`}
            className="text-terracotta hover:underline"
          >
            ← Volver a la reserva
          </a>
        </div>
      </div>
      {/* iframe + srcDoc para que el HTML del renderer (que es un
          documento completo) viva en su propio scope sin chocar con
          el <html>/<body> de Next. */}
      <iframe
        title="Comprobante de pago"
        srcDoc={html}
        className="block h-[calc(100vh-3.25rem)] w-full border-0"
      />
    </div>
  );
}
