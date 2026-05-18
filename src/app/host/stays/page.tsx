import Link from "next/link";
import { requireSession } from "@/shared/require-auth";
import { staysDeps } from "@/modules/stays/composition";
import { Container, SectionLabel } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const STATUS_TONE = {
  ACTIVE: "moss",
  INACTIVE: "neutral",
  DELETED: "neutral",
} as const;

export default async function HostStaysPage() {
  const session = await requireSession();
  const { stays } = staysDeps();
  const list = await stays.listByHost(session.user.id);

  return (
    <Container size="wide" className="py-14">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-3">
          <SectionLabel serial="§D">Anfitrionía</SectionLabel>
          <h1 className="font-display text-5xl leading-tight">Mis alojamientos</h1>
          <p className="text-ink-soft">
            <span className="num">{list.length}</span> publicado{list.length === 1 ? "" : "s"}.
          </p>
        </div>
        <ButtonLink href="/host/stays/new" size="lg">
          + Publicar nuevo
        </ButtonLink>
      </header>

      {list.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {list.map((s, i) => (
            <li
              key={s.id}
              className="group overflow-hidden rounded-xl border border-line bg-paper transition-all hover:border-ink/20 hover:shadow-soft"
            >
              <div className="flex gap-4 p-4">
                <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-md bg-bone-2">
                  {s.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.coverImageUrl}
                      alt={s.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink-mute/40">
                      <span className="font-mono text-[10px] uppercase tracking-widest">
                        Sin imagen
                      </span>
                    </div>
                  )}
                  <span className="absolute left-2 top-2 rounded-full bg-paper/90 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-ink-soft">
                    №{String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
                    {s.locationText}
                  </p>
                  <h3 className="truncate font-display text-xl">{s.title}</h3>
                  <p className="text-sm">
                    <span className="num">${s.pricePerNight.toLocaleString("es-CO")}</span>
                    <span className="text-ink-mute"> · {s.capacity} pers</span>
                  </p>
                  <Badge tone={STATUS_TONE[s.status]}>{s.status.toLowerCase()}</Badge>
                </div>
              </div>
              <div className="flex divide-x divide-line border-t border-line text-sm">
                <Link
                  href={`/host/stays/${s.id}/edit`}
                  className="flex-1 py-2.5 text-center text-ink-soft hover:bg-bone hover:text-ink"
                >
                  Editar
                </Link>
                <Link
                  href={`/host/stays/${s.id}/availability`}
                  className="flex-1 py-2.5 text-center text-ink-soft hover:bg-bone hover:text-ink"
                >
                  Calendario
                </Link>
                <Link
                  href={`/stays/${s.id}`}
                  className="flex-1 py-2.5 text-center text-ink-soft hover:bg-bone hover:text-ink"
                >
                  Ver público
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-paper p-16 text-center">
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
        Catálogo vacío
      </p>
      <h2 className="mt-3 font-display text-3xl">Aún no has publicado nada.</h2>
      <p className="mx-auto mt-2 max-w-prose text-ink-soft">
        Publicar toma cinco minutos. Subes fotos, defines precio y calendario, y aparece en el catálogo al instante.
      </p>
      <div className="mt-6">
        <ButtonLink href="/host/stays/new" size="md">
          Publicar el primero
        </ButtonLink>
      </div>
    </div>
  );
}
