import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/db";
import { viewHostProfile } from "@/modules/users/services/view-host-profile";
import { UserNotFoundError } from "@/modules/users/services/errors";

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
    <article className="space-y-8">
      <header className="flex items-center gap-4">
        {profile.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photoUrl}
            alt={profile.name}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-full bg-gray-200 text-2xl font-bold text-gray-500">
            {profile.name[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-sm text-gray-600">Miembro desde {memberSinceLabel}</p>
          <p className="mt-1 text-sm">
            <strong>{profile.totalStays}</strong> alojamiento(s) ·{" "}
            {profile.averageRating !== null ? (
              <>
                <strong>{profile.averageRating.toFixed(1)}</strong> / 5
              </>
            ) : (
              <span className="text-gray-500">Sin calificaciones aún</span>
            )}
          </p>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Sus alojamientos</h2>
        {profile.stays.length === 0 ? (
          <p className="text-sm text-gray-500">
            Este anfitrión aún no tiene alojamientos publicados.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.stays.map((s) => (
              <li key={s.id} className="overflow-hidden rounded border">
                <Link href={`/stays/${s.id}`} className="block">
                  {s.coverImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.coverImageUrl}
                      alt={s.title}
                      className="h-40 w-full object-cover"
                    />
                  )}
                  <div className="p-3">
                    <h3 className="font-medium">{s.title}</h3>
                    <p className="text-sm text-gray-600">{s.locationText}</p>
                    <p className="mt-1 text-sm font-semibold">
                      ${s.pricePerNight.toLocaleString("es-CO")} / noche
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
