import { notFound } from "next/navigation";
import { staysDeps } from "@/modules/stays/composition";
import { reviewsDeps } from "@/modules/reviews/composition";
import { listReviewsForStay } from "@/modules/reviews/services/list-reviews";
import { prisma } from "@/shared/db";
import { auth } from "@/shared/auth";
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

  const bookedDates = await prisma.availability.findMany({
    where: {
      stayId: id,
      status: { in: ["BOOKED", "BLOCKED"] },
      date: { gte: new Date() },
    },
    select: { date: true },
  });

  const memberSince = host
    ? new Intl.DateTimeFormat("es-CO", { year: "numeric" }).format(host.createdAt)
    : null;

  return (
    <main className="w-full pb-24">
      {stay.images.length > 0 ? (
        <Gallery images={stay.images.map((i) => i.url)} title={stay.title} />
      ) : (
        <GalleryPlaceholder />
      )}

      <section className="max-w-editorial mx-auto px-gutter grid grid-cols-1 md:grid-cols-12 gap-12 mt-12">
        <div className="md:col-span-8">
          <div className="mb-8 border-b border-line pb-8">
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-ink mb-2">{stay.title}</h1>
              <div className="flex items-center gap-4 text-ink-soft mb-4">
                  <span className="flex items-center gap-1 font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-[16px] text-terracotta fill">star</span>
                      {avg._count._all > 0 ? `${Number(avg._avg.rating).toFixed(1)} (${avg._count._all} reseñas)` : 'Sin calificaciones'}
                  </span>
                  <span className="text-line-soft">•</span>
                  <span className="font-body-sm text-body-sm underline cursor-pointer hover:text-terracotta transition-colors">{stay.locationText}</span>
              </div>
              <div className="flex gap-4 font-body-sm text-body-sm text-ink-mute">
                  <span>{stay.capacity} personas</span>
              </div>
          </div>

          {host && (
            <div className="flex items-center gap-4 mb-8 border-b border-line pb-8">
              {host.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={host.photoUrl} alt={host.name} className="w-14 h-14 rounded-full object-cover shadow-soft border border-line-hair" />
              ) : (
                  <div className="grid w-14 h-14 place-items-center rounded-full bg-bone-2 font-display text-xl text-ink-soft">
                    {host.name[0]?.toUpperCase()}
                  </div>
              )}
              <div>
                  <h3 className="font-headline-md text-headline-md text-ink text-[18px]">Anfitrión: {host.name}</h3>
                  <p className="font-body-sm text-body-sm text-ink-mute">Miembro desde {memberSince}</p>
              </div>
            </div>
          )}

          <div className="mb-10 max-w-container-prose">
              <p className="font-body-lg text-body-lg text-ink-soft mb-4 whitespace-pre-wrap">
                  {stay.description}
              </p>
          </div>

          {reviews.length > 0 && (
              <div className="mb-12 border-t border-line pt-8">
                  <h2 className="font-headline-md text-headline-md text-ink mb-6">Reseñas</h2>
                  <ul className="space-y-4">
                    {reviews.map((r) => (
                        <li key={r.id} className="rounded-xl border border-line bg-paper p-5">
                            <header className="mb-2 flex items-center gap-3">
                                {r.author.photoUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={r.author.photoUrl} alt={r.author.name} className="h-9 w-9 rounded-full border border-line object-cover" />
                                ) : (
                                    <div className="grid h-9 w-9 place-items-center rounded-full bg-bone-2 font-display text-sm text-ink-soft">
                                        {r.author.name[0]?.toUpperCase() ?? "?"}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="font-medium text-ink">{r.author.name}</p>
                                    <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
                                        {new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" }).format(r.createdAt)}
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
        </div>

        <div className="md:col-span-4 relative">
            <div className="sticky top-28 bg-paper rounded-xl shadow-warm border border-line p-6">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <span className="font-mono-price text-mono-price text-[24px] font-bold text-ink">${stay.pricePerNight}</span>
                        <span className="font-body-sm text-body-sm text-ink-mute"> / noche</span>
                    </div>
                    {avg._count._all > 0 && (
                        <div className="flex items-center gap-1 font-body-sm text-body-sm text-ink-soft">
                            <span className="material-symbols-outlined text-[14px] text-terracotta fill">star</span>
                            {Number(avg._avg.rating).toFixed(1)}
                        </div>
                    )}
                </div>
                <BookingForm 
                  stayId={stay.id} 
                  pricePerNight={stay.pricePerNight} 
                  isAuthed={!!session?.user?.id} 
                  bookedDates={bookedDates.map(d => d.date)}
                />
                <p className="text-center font-body-sm text-body-sm text-ink-mute mt-6">La reserva se confirma al instante.</p>
            </div>
        </div>
      </section>
    </main>
  );
}

function GalleryPlaceholder() {
  return (
    <section className="max-w-container-max mx-auto px-gutter mt-8 mb-12">
        <div className="flex aspect-[21/9] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-bone-2/40">
            <div className="text-center">
                <span className="material-symbols-outlined mx-auto mb-3 h-12 w-12 text-ink-mute/50 text-[48px]">image</span>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
                    Galería en construcción
                </p>
                <p className="mt-1 font-display text-lg italic text-ink-soft">
                    El anfitrión aún no ha subido fotos.
                </p>
            </div>
        </div>
    </section>
  );
}

function Gallery({ images, title }: { images: string[]; title: string }) {
  const [hero, ...rest] = images;
  return (
    <section className="max-w-container-max mx-auto px-gutter mt-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[400px] md:h-[600px] rounded-xl overflow-hidden">
            <div className="md:col-span-2 md:row-span-2 relative group cursor-pointer bg-surface-dim">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={hero} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
            {rest.slice(0, 4).map((url, i) => (
                <div key={i} className="hidden md:block relative group cursor-pointer bg-surface-dim">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                </div>
            ))}
        </div>
    </section>
  );
}
