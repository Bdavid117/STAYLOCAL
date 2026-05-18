import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/shared/require-auth";
import { prisma } from "@/shared/db";
import { Container, SectionLabel } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { PayForm } from "./pay-form";

type Props = { params: Promise<{ id: string }> };

export default async function PayPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();

  const booking = await prisma.booking.findFirst({
    where: { id, guestId: session.user.id },
    include: {
      stay: {
        select: {
          id: true,
          title: true,
          locationText: true,
          pricePerNight: true,
          images: { orderBy: { orderIdx: "asc" }, take: 1, select: { url: true } },
        },
      },
      payment: true,
    },
  });
  if (!booking) notFound();

  // Si ya está pagada, regresa al detalle.
  if (booking.payment?.status === "PAID") {
    redirect(`/bookings/${booking.id}`);
  }
  // Si la reserva no está CONFIRMED, no hay nada que pagar.
  if (booking.status !== "CONFIRMED") {
    redirect(`/bookings/${booking.id}`);
  }

  const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "long" });
  const nights = Math.round(
    (booking.checkOut.getTime() - booking.checkIn.getTime()) / 86_400_000
  );
  const total = booking.totalAmount.toNumber();
  const pricePerNight = booking.stay.pricePerNight.toNumber();
  const previousFailed = booking.payment?.status === "FAILED";

  return (
    <Container size="default" className="py-14">
      <Link
        href={`/bookings/${booking.id}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
      >
        ← Volver a la reserva
      </Link>

      <header className="mb-10 space-y-3">
        <SectionLabel serial={`§G·${booking.id.slice(-4).toUpperCase()}`}>Pago</SectionLabel>
        <h1 className="font-display text-5xl leading-tight">
          Confirma tu <em className="italic text-terracotta">pago</em>.
        </h1>
        <p className="text-ink-soft">
          Revisa el resumen y confirma. El comprobante llegará al correo en cuanto
          la pasarela apruebe el cobro.
        </p>
      </header>

      {previousFailed && (
        <div className="mb-6 rounded-lg border border-terracotta/40 bg-terracotta/[0.06] p-4 text-sm text-terracotta-deep">
          El intento anterior fue rechazado. Puedes reintentar el pago en este momento.
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <article className="space-y-6 lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-soft">
            <div className="flex gap-4 p-5">
              {booking.stay.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={booking.stay.images[0].url}
                  alt=""
                  className="h-24 w-32 rounded-md object-cover"
                />
              ) : (
                <div className="grid h-24 w-32 place-items-center rounded-md bg-bone-2 font-mono text-[10px] uppercase tracking-widest text-ink-mute">
                  Sin imagen
                </div>
              )}
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
                  {booking.stay.locationText}
                </p>
                <h2 className="truncate font-display text-2xl">{booking.stay.title}</h2>
              </div>
            </div>
            <dl className="divide-y divide-line border-t border-line">
              <Row label="Check-in" value={fmt.format(booking.checkIn)} />
              <Row label="Check-out" value={fmt.format(booking.checkOut)} />
              <Row
                label={`${nights} noche${nights === 1 ? "" : "s"}`}
                value={`$${pricePerNight.toLocaleString("es-CO")} × ${nights}`}
              />
              <Row
                label="Total a pagar"
                value={`$${total.toLocaleString("es-CO")} COP`}
                emphasis
              />
            </dl>
          </div>
        </article>

        <aside className="lg:col-span-5">
          <div className="sticky top-24 space-y-5 rounded-2xl border border-line bg-paper p-7 shadow-soft">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <SectionLabel>Pasarela</SectionLabel>
              <Badge tone="moss">Demo</Badge>
            </div>
            <p className="font-display text-2xl">
              Pago seguro <em className="text-terracotta">— en un clic</em>.
            </p>
            <PayForm bookingId={booking.id} amount={total} currency="COP" />
          </div>
        </aside>
      </div>
    </Container>
  );
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between px-5 py-3">
      <dt
        className={
          emphasis
            ? "font-display text-lg text-ink"
            : "font-mono text-[10px] uppercase tracking-widest text-ink-soft"
        }
      >
        {label}
      </dt>
      <dd
        className={
          emphasis ? "num font-display text-2xl text-ink" : "num text-sm text-ink"
        }
      >
        {value}
      </dd>
    </div>
  );
}
