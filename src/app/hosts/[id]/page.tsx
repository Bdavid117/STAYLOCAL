import { notFound } from "next/navigation";
import { prisma } from "@/shared/db";
import { viewHostProfile } from "@/modules/users/services/view-host-profile";
import { UserNotFoundError } from "@/modules/users/services/errors";
import { Container, SectionLabel } from "@/components/ui/Container";
import { StayCard } from "@/components/ui/StayCard";

type Props = { params: Promise<{ id: string }> };

export default async function HostProfilePage({ params }: Props) {
  const { id } = await params;
  let profile;
  try {
    profile = await viewHostProfile(id, { db: prisma });
  } catch (err) {
    if (err instanceof UserNotFoundError) notFound();
    throw err;
  }

  const memberSinceLabel = new Intl.DateTimeFormat("es-CO", {
    month: "long",
    year: "numeric",
  }).format(profile.memberSince);

  return (
    <Container size="wide" className="py-14">
      <header className="mb-14 grid grid-cols-1 items-center gap-8 sm:grid-cols-12">
        <div className="sm:col-span-3">
          {profile.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.photoUrl}
              alt={profile.name}
              className="h-44 w-44 rounded-full border-2 border-line object-cover"
            />
          ) : (
            <div className="grid h-44 w-44 place-items-center rounded-full bg-bone-2 font-display text-7xl text-ink-soft">
              {profile.name[0]?.toUpperCase() ?? "?"}
            </div>
          )}
        </div>
        <div className="space-y-3 sm:col-span-9">
          <p className="font-mono text-[11px] uppercase tracking-widest text-terracotta">
            Anfitrión · Miembro desde {memberSinceLabel}
          </p>
          <h1 className="font-display text-6xl leading-[0.95] tracking-tight">
            {profile.name}
          </h1>
          <div className="flex flex-wrap gap-6 pt-3 text-sm">
            <Stat label="Alojamientos" value={String(profile.totalStays)} />
            <Stat
              label="Calificación"
              value={
                profile.averageRating !== null
                  ? `${profile.averageRating.toFixed(1)} / 5`
                  : "—"
              }
            />
          </div>
        </div>
      </header>

      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <SectionLabel serial="§01">Catálogo</SectionLabel>
            <h2 className="mt-2 font-display text-3xl">Sus alojamientos publicados</h2>
          </div>
        </div>
        {profile.stays.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-paper p-12 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
              Sin publicaciones
            </p>
            <p className="mt-2 font-display text-2xl">
              Este anfitrión aún no tiene alojamientos.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {profile.stays.map((s, i) => (
              <li key={s.id}>
                <StayCard
                  stay={{
                    id: s.id,
                    title: s.title,
                    locationText: s.locationText,
                    pricePerNight: s.pricePerNight,
                    coverImageUrl: s.coverImageUrl,
                  }}
                  index={i}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">{label}</p>
      <p className="num text-2xl">{value}</p>
    </div>
  );
}
