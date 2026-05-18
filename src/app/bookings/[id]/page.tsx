import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/shared/require-auth";
import { prisma } from "@/shared/db";
import { cancelBookingAction } from "@/app/bookings/actions";
import { Container, SectionLabel } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { ButtonLink } from "@/components/ui/Button";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
};

const STATUS_TONE = {
  PENDING: "ochre",
  CONFIRMED: "moss",
  CANCELLED: "neutral",
  COMPLETED: "terracotta",
} as const;

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string }>;
};

export default async function BookingDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { paid } = await searchParams;
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

  const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "long" });
  const nights = Math.round(
    (booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );
  const canCancel =
    booking.status !== "CANCELLED" &&
    booking.status !== "COMPLETED" &&
    booking.checkIn.getTime() > Date.now();
  const isPaid = booking.payment?.status === "PAID";
  const needsPayment = !isPaid && booking.status === "CONFIRMED";
  const wasRefunded = booking.payment?.status === "REFUNDED";
  const paymentFailed = booking.payment?.status === "FAILED";

  const cancelAction = cancelBookingAction.bind(null, booking.id);
  const serial = booking.id.slice(-6).toUpperCase();

  return (
    <Container size="default" className="py-14">
      <Link
        href="/bookings"
        className="mb-6 inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
      >
        ← Volver a mis reservas
      </Link>

      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-3">
          <SectionLabel serial={`№ ${serial}`}>Reserva</SectionLabel>
          <h1 className="font-display text-5xl leading-tight">{booking.stay.title}</h1>
          <p className="text-ink-soft">{booking.stay.locationText}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge tone={STATUS_TONE[booking.status]}>{STATUS_LABELS[booking.status]}</Badge>
          {isPaid && <Badge tone="moss">Pagada</Badge>}
          {needsPayment && <Badge tone="ochre">Pago pendiente</Badge>}
          {wasRefunded && <Badge tone="neutral">Reembolsada</Badge>}
          {paymentFailed && <Badge tone="terracotta">Pago rechazado</Badge>}
        </div>
      </header>

      {paid && isPaid && (
        <Banner tone="success" className="mb-6">
          Pago confirmado. El comprobante salió al correo y queda disponible en esta página.
        </Banner>
      )}

      {needsPayment && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ochre/40 bg-ochre/[0.08] p-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
              Pago pendiente
            </p>
            <p className="mt-1 font-display text-2xl text-ink">
              Confirma tu pago para recibir el comprobante.
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Total: <span className="num font-medium">${booking.totalAmount.toNumber().toLocaleString("es-CO")} COP</span>
            </p>
          </div>
          <ButtonLink href={`/bookings/${booking.id}/pay`} size="lg">
            {paymentFailed ? "Reintentar pago" : "Pagar ahora"}
          </ButtonLink>
        </div>
      )}

      {booking.stay.images[0] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={booking.stay.images[0].url}
          alt=""
          className="mb-10 aspect-[21/9] w-full rounded-xl object-cover"
        />
      )}

      <section className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <article className="space-y-8 lg:col-span-7">
          <div className="grid grid-cols-2 gap-6 rounded-2xl border border-line bg-paper p-6">
            <Datum label="Check-in" value={fmt.format(booking.checkIn)} />
            <Datum label="Check-out" value={fmt.format(booking.checkOut)} />
            <Datum label="Noches" value={String(nights)} mono />
            <Datum
              label="Total"
              value={`$${booking.totalAmount.toNumber().toLocaleString("es-CO")}`}
              mono
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-line bg-paper p-6">
            <SectionLabel serial="§01">Próximos pasos</SectionLabel>
            <ul className="space-y-2 text-sm text-ink-soft">
              <li>· {isPaid ? "Tu pago está confirmado." : "Confirma el pago para asegurar tu reserva."}</li>
              <li>· El anfitrión puede contactarte para coordinar el ingreso.</li>
              <li>· Si cancelas antes del check-in, las fechas se liberan al instante.</li>
            </ul>
          </div>
        </article>

        <aside className="space-y-5 lg:col-span-5">
          <div className="rounded-2xl border border-line bg-paper p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
              Alojamiento
            </p>
            <Link
              href={`/stays/${booking.stay.id}`}
              className="mt-2 block font-display text-2xl hover:text-terracotta"
            >
              {booking.stay.title} →
            </Link>
            <p className="mt-1 text-sm text-ink-soft">
              <span className="num">${booking.stay.pricePerNight.toNumber().toLocaleString("es-CO")}</span>{" "}
              / noche
            </p>
          </div>

          {isPaid && (
            <div className="space-y-3 rounded-2xl border border-moss/30 bg-moss/[0.05] p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-moss">
                Comprobante
              </p>
              <p className="text-sm text-ink-soft">
                Tu pago quedó registrado. Imprime o guarda el comprobante en PDF.
              </p>
              <Link
                href={`/bookings/${booking.id}/receipt`}
                className="inline-flex h-10 items-center justify-center rounded-md bg-moss px-4 text-sm font-medium text-paper hover:bg-moss/90"
                target="_blank"
              >
                Ver comprobante →
              </Link>
            </div>
          )}

          {canCancel && (
            <form
              action={cancelAction}
              className="space-y-3 rounded-2xl border border-terracotta/30 bg-terracotta/[0.04] p-6"
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-terracotta">
                Cancelación
              </p>
              <p className="text-sm text-ink-soft">
                Aún puedes cancelar. Las fechas reservadas se liberarán automáticamente.
              </p>
              <button
                type="submit"
                className="inline-flex h-10 w-full items-center justify-center rounded-md border border-terracotta/40 bg-paper text-sm text-terracotta-deep hover:bg-terracotta/10"
              >
                Cancelar esta reserva
              </button>
            </form>
          )}
        </aside>
      </section>
    </Container>
  );
}

function Datum({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">{label}</p>
      <p className={`${mono ? "num" : "font-display"} text-lg text-ink`}>{value}</p>
    </div>
  );
}
