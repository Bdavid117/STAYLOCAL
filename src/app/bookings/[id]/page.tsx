import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/shared/require-auth";
import { prisma } from "@/shared/db";
import { cancelBookingAction } from "@/app/bookings/actions";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
};

type Props = { params: Promise<{ id: string }> };

export default async function BookingDetailPage({ params }: Props) {
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

  const cancelAction = cancelBookingAction.bind(null, booking.id);

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Reserva</p>
          <h1 className="text-2xl font-bold">{booking.stay.title}</h1>
          <p className="text-sm text-gray-600">{booking.stay.locationText}</p>
        </div>
        <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium">
          {STATUS_LABELS[booking.status]}
        </span>
      </header>

      {booking.stay.images[0] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={booking.stay.images[0].url}
          alt=""
          className="h-56 w-full rounded object-cover"
        />
      )}

      <section className="grid grid-cols-2 gap-4 rounded border p-4 text-sm">
        <div>
          <p className="text-gray-500">Check-in</p>
          <p className="font-medium">{fmt.format(booking.checkIn)}</p>
        </div>
        <div>
          <p className="text-gray-500">Check-out</p>
          <p className="font-medium">{fmt.format(booking.checkOut)}</p>
        </div>
        <div>
          <p className="text-gray-500">Noches</p>
          <p className="font-medium">{nights}</p>
        </div>
        <div>
          <p className="text-gray-500">Total</p>
          <p className="font-medium">
            ${booking.totalAmount.toNumber().toLocaleString("es-CO")}
          </p>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <Link
          href={`/stays/${booking.stay.id}`}
          className="text-sm text-brand hover:underline"
        >
          Ver alojamiento →
        </Link>
        {canCancel && (
          <form action={cancelAction}>
            <button
              type="submit"
              className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
            >
              Cancelar reserva
            </button>
          </form>
        )}
      </div>
    </article>
  );
}
