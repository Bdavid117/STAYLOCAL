import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/shared/require-auth";
import { prisma } from "@/shared/db";
import { Container, SectionLabel } from "@/components/ui/Container";
import { ReviewForm } from "./review-form";

type Props = { params: Promise<{ id: string }> };

export default async function ReviewPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();

  const booking = await prisma.booking.findFirst({
    where: { id, guestId: session.user.id },
    include: {
      stay: { select: { id: true, title: true, locationText: true } },
      review: { select: { id: true } },
    },
  });
  if (!booking) notFound();

  // Si ya hay reseña, regresa al detalle.
  if (booking.review) redirect(`/bookings/${booking.id}`);

  // Si el checkOut aún no llegó o el estado no permite reseña, también.
  const now = Date.now();
  if (
    booking.checkOut.getTime() > now ||
    (booking.status !== "CONFIRMED" && booking.status !== "COMPLETED")
  ) {
    redirect(`/bookings/${booking.id}`);
  }

  return (
    <Container size="default" className="py-14">
      <Link
        href={`/bookings/${booking.id}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
      >
        ← Volver a la reserva
      </Link>

      <header className="mb-10 space-y-3">
        <SectionLabel serial={`№ ${booking.id.slice(-6).toUpperCase()}`}>
          Reseña
        </SectionLabel>
        <h1 className="font-display text-5xl leading-tight">
          ¿Cómo fue tu <em className="italic text-terracotta">estadía</em>?
        </h1>
        <p className="text-ink-soft">
          Tu reseña ayuda a futuros huéspedes a decidir. Sé honesto — bueno o malo.
        </p>
        <p className="rounded-lg border border-line bg-paper px-3 py-2 text-sm">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
            Alojamiento
          </span>
          <br />
          <Link
            href={`/stays/${booking.stay.id}`}
            className="font-display text-xl hover:text-terracotta"
          >
            {booking.stay.title}
          </Link>
          <span className="ml-2 text-ink-soft">· {booking.stay.locationText}</span>
        </p>
      </header>

      <div className="rounded-2xl border border-line bg-paper p-7 shadow-soft">
        <ReviewForm bookingId={booking.id} />
      </div>
    </Container>
  );
}
