import Link from "next/link";
import { notFound } from "next/navigation";
import { staysDeps } from "@/modules/stays/composition";
import { reviewsDeps } from "@/modules/reviews/composition";
import { listReviewsForStay } from "@/modules/reviews/services/list-reviews";
import { prisma } from "@/shared/db";
import { auth } from "@/shared/auth";
import { Container, SectionLabel } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { BookingForm } from "./booking-form";

type Props = { params: Promise<{ id: string }> };

export default async function StayDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const { stays } = staysDeps();
  const stay = await stays.findByIdWithImages(id);
  if (!stay || stay.status !== "ACTIVE") notFound();

  const host = await prisma.user.findUnique({
    where: { id: stay.hostId },
    select: { id: true, name: true, photoUrl: true, createdAt: true },
  });

  const avg = await prisma.review.aggregate({
    where: { stayId: id },
    _avg: { rating: true },
    _count: { _all: true },
  });
  const reviews = await listReviewsForStay(id, reviewsDeps());

  const memberSince = host
    ? new Intl.DateTimeFormat("es-CO", { year: "numeric" }).format(host.createdAt)
    : null;

  const serial = String(stay.id).slice(-4).toUpperCase();

  return (
    <Container size="wide" className="py-12">
      <Link
        href="/search"
        className="mb-8 inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
      >
        ← Volver al catálogo
      </Link>

      <header className="mb-10 grid grid-cols-1 items-end gap-6 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-8">
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
            <span className="text-terracotta">№ {serial}</span>
            <span className="mx-2 text-line">/</span>
            {stay.locationText}
          </p>
          <h1 className="font-display text-5xl leading-[0.95] tracking-tight sm:text-7xl">
            {stay.title}
          </h1>
        </div>
        <div className="space-y-2 lg:col-span-4 lg:text-right">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
            Calificación
          </p>
          {avg._count._all > 0 ? (
            <p className="font-display text-4xl">
              <span className="num">{Number(avg._avg.rating).toFixed(1)}</span>
              <span className="ml-1 text-base text-ink-mute">/ 5</span>
              <span className="ml-3 align-middle font-mono text-xs text-ink-mute">
                ({avg._count._all} reseñas)
              </span>
            </p>
          ) : (
            <p className="font-display text-2xl italic text-ink-soft">Sin calificaciones aún</p>
          )}
        </div>
      </header>

      {stay.images.length > 0 ? (
        <Gallery images={stay.images.map((i) => i.url)} title={stay.title} />
      ) : (
        <GalleryPlaceholder />
      )}

      <section className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12">
        <article className="space-y-10 lg:col-span-7">
          <div className="space-y-4">
            <SectionLabel serial="§01">Acerca del lugar</SectionLabel>
            <p className="font-display text-2xl leading-snug text-ink first-letter:float-left first-letter:mr-2 first-letter:text-6xl first-letter:font-medium first-letter:leading-none first-letter:text-terracotta">
              {stay.description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 border-y border-line py-6">
            <Spec label="Capacidad" value={`${stay.capacity}`} unit="personas" />
            <Spec label="Coordenadas" value={`${stay.lat.toFixed(2)}, ${stay.lng.toFixed(2)}`} mono />
            <Spec label="Estado" value="Activo" />
          </div>

          {reviews.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <SectionLabel serial="§02">Reseñas</SectionLabel>
                {avg._count._all > 0 && (
                  <p className="text-sm">
                    <span className="num font-medium">{Number(avg._avg.rating).toFixed(1)}</span>
                    <span className="text-ink-mute"> / 5 · {avg._count._all} reseñas</span>
                  </p>
                )}
              </div>
              <ul className="space-y-4">
                {reviews.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-xl border border-line bg-paper p-5"
                  >
                    <header className="mb-2 flex items-center gap-3">
                      {r.author.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.author.photoUrl}
                          alt={r.author.name}
                          className="h-9 w-9 rounded-full border border-line object-cover"
                        />
                      ) : (
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-bone-2 font-display text-sm text-ink-soft">
                          {r.author.name[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-ink">{r.author.name}</p>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
                          {new Intl.DateTimeFormat("es-CO", {
                            month: "long",
                            year: "numeric",
                          }).format(r.createdAt)}
                        </p>
                      </div>
                      <p className="font-display text-lg">
                        <span className="num">{r.rating}</span>
                        <span className="ml-0.5 text-xs text-ink-mute">/ 5</span>
                      </p>
                    </header>
                    <p className="text-ink-soft">{r.comment}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {host && (
            <div className="space-y-4">
              <SectionLabel serial={reviews.length > 0 ? "§03" : "§02"}>Quien recibe</SectionLabel>
              <Link
                href={`/hosts/${host.id}`}
                className="flex items-center gap-4 rounded-xl border border-line bg-paper p-4 transition-colors hover:border-ink/30"
              >
                {host.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={host.photoUrl}
                    alt={host.name}
                    className="h-14 w-14 rounded-full border border-line object-cover"
                  />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-bone-2 font-display text-xl text-ink-soft">
                    {host.name[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-display text-xl">{host.name}</p>
                  <p className="text-sm text-ink-soft">
                    Recibiendo huéspedes desde <span className="num">{memberSince}</span>
                  </p>
                </div>
                <span className="text-sm text-terracotta">Ver perfil →</span>
              </Link>
            </div>
          )}
        </article>

        <aside className="lg:col-span-5">
          <div className="sticky top-24 space-y-5 rounded-2xl border border-line bg-paper p-7 shadow-soft">
            <div className="flex items-baseline justify-between border-b border-line pb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                  Tarifa por noche
                </p>
                <p className="num font-display text-4xl text-ink">
                  ${stay.pricePerNight.toLocaleString("es-CO")}
                </p>
              </div>
              <Badge tone="moss">Disponible</Badge>
            </div>
            <BookingForm
              stayId={stay.id}
              pricePerNight={stay.pricePerNight}
              isAuthed={!!session?.user?.id}
            />
            <p className="text-xs text-ink-mute">
              La reserva se confirma al instante. Las fechas se bloquean en el
              calendario del anfitrión.
            </p>
          </div>
        </aside>
      </section>
    </Container>
  );
}

function Spec({
  label,
  value,
  unit,
  mono,
}: {
  label: string;
  value: string;
  unit?: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">{label}</p>
      <p className={`${mono ? "num" : "font-display"} text-lg text-ink`}>
        {value}
        {unit && <span className="ml-1 text-xs text-ink-mute">{unit}</span>}
      </p>
    </div>
  );
}

function GalleryPlaceholder() {
  return (
    <div className="relative flex aspect-[21/9] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-bone-2/40">
      <div className="text-center">
        <svg
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto mb-3 h-12 w-12 text-ink-mute/50"
        >
          <path d="M10 52V20l22-12 22 12v32H10z" />
          <path d="M24 52V36h16v16" />
          <circle cx="40" cy="22" r="2" />
        </svg>
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
          Galería en construcción
        </p>
        <p className="mt-1 font-display text-lg italic text-ink-soft">
          El anfitrión aún no ha subido fotos.
        </p>
      </div>
    </div>
  );
}

function Gallery({ images, title }: { images: string[]; title: string }) {
  const [hero, ...rest] = images;
  return (
    <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-xl sm:grid-cols-4 sm:grid-rows-2 sm:[&>*:first-child]:col-span-2 sm:[&>*:first-child]:row-span-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={hero}
        alt={title}
        className="aspect-[4/3] w-full object-cover sm:aspect-auto sm:h-full"
      />
      {rest.slice(0, 4).map((url, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={url}
          alt=""
          className="hidden h-full w-full object-cover sm:block"
        />
      ))}
    </div>
  );
}
