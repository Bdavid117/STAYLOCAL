import Link from "next/link";
import { notFound } from "next/navigation";
import { staysDeps } from "@/modules/stays/composition";
import { prisma } from "@/shared/db";

type Props = { params: Promise<{ id: string }> };

export default async function StayDetailPage({ params }: Props) {
  const { id } = await params;
  const { stays } = staysDeps();
  const stay = await stays.findByIdWithImages(id);
  if (!stay || stay.status !== "ACTIVE") notFound();

  const host = await prisma.user.findUnique({
    where: { id: stay.hostId },
    select: { id: true, name: true, photoUrl: true },
  });

  const avg = await prisma.review.aggregate({
    where: { stayId: id },
    _avg: { rating: true },
    _count: { _all: true },
  });

  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{stay.title}</h1>
        <p className="text-sm text-gray-600">{stay.locationText}</p>
        <p className="text-sm">
          {avg._count._all > 0 ? (
            <>
              <strong>{Number(avg._avg.rating).toFixed(1)}</strong> / 5 ·{" "}
              {avg._count._all} reseña(s)
            </>
          ) : (
            <span className="text-gray-500">Sin calificaciones aún</span>
          )}
        </p>
      </header>

      {stay.images.length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {stay.images.map((img) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.id}
              src={img.url}
              alt=""
              className="h-56 w-full rounded object-cover"
            />
          ))}
        </div>
      )}

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="sm:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Sobre este lugar</h2>
          <p className="whitespace-pre-line text-gray-800">{stay.description}</p>
          <p className="text-sm text-gray-600">
            Capacidad: <strong>{stay.capacity}</strong> personas
          </p>
        </div>
        <aside className="space-y-3 rounded border p-4">
          <p className="text-2xl font-bold">
            ${stay.pricePerNight.toLocaleString("es-CO")}{" "}
            <span className="text-sm font-normal text-gray-500">/ noche</span>
          </p>
          {/* CTA de reserva (CU-17) llega cuando se cablea el módulo bookings */}
          <button
            type="button"
            disabled
            className="w-full rounded bg-gray-200 px-4 py-2 text-gray-500"
          >
            Reservar (próximamente)
          </button>
          {host && (
            <p className="pt-2 text-sm">
              Anfitrión:{" "}
              <Link
                href={`/hosts/${host.id}`}
                className="text-brand hover:underline"
              >
                {host.name}
              </Link>
            </p>
          )}
        </aside>
      </section>
    </article>
  );
}
