import Link from "next/link";
import { requireSession } from "@/shared/require-auth";
import { bookingsDeps } from "@/modules/bookings/composition";
import { listMyBookings } from "@/modules/bookings/services/list-my-bookings";
import { Container, SectionLabel } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
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
  searchParams: Promise<{ status?: string }>;
};

export default async function MyBookingsPage({ searchParams }: Props) {
  const session = await requireSession();
  const { status } = await searchParams;

  const { bookings } = bookingsDeps();
  const list = await listMyBookings(
    session.user.id,
    { status: status as never },
    { bookings }
  );

  const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });
  const today = Date.now();

  return (
    <Container size="wide" className="py-14">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-3">
          <SectionLabel serial="§F">Itinerario</SectionLabel>
          <h1 className="font-display text-5xl leading-tight">Mis reservas</h1>
        </div>
        <nav className="flex flex-wrap gap-1 text-sm">
          <Tab current={status} value={undefined} label="Todas" />
          <Tab current={status} value="CONFIRMED" label="Confirmadas" />
          <Tab current={status} value="CANCELLED" label="Canceladas" />
          <Tab current={status} value="COMPLETED" label="Completadas" />
        </nav>
      </header>

      {list.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {list.map((b) => {
            const upcoming = b.checkIn.getTime() > today && b.status === "CONFIRMED";
            return (
              <li
                key={b.id}
                className="group flex items-stretch gap-0 overflow-hidden rounded-xl border border-line bg-paper transition-all hover:border-ink/20 hover:shadow-soft"
              >
                <div className="relative h-auto w-32 shrink-0 overflow-hidden bg-bone-2 sm:w-44">
                  {b.stay.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.stay.coverImageUrl}
                      alt={b.stay.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink-mute/40">
                      <span className="font-mono text-[9px] uppercase tracking-widest">
                        Sin imagen
                      </span>
                    </div>
                  )}
                  {upcoming && (
                    <span className="absolute left-2 top-2 rounded-full bg-terracotta px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-paper">
                      Próxima
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
                  <div className="space-y-1">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
                      {b.stay.locationText}
                    </p>
                    <Link
                      href={`/bookings/${b.id}`}
                      className="block truncate font-display text-xl text-ink hover:text-terracotta"
                    >
                      {b.stay.title}
                    </Link>
                  </div>
                  <div className="mt-3 flex flex-wrap items-baseline gap-4 text-sm">
                    <span className="num text-ink-soft">
                      {fmt.format(b.checkIn)} → {fmt.format(b.checkOut)}
                    </span>
                    <span className="num font-medium text-ink">
                      ${b.totalAmount.toLocaleString("es-CO")}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between gap-3 p-4">
                  <Badge tone={STATUS_TONE[b.status]}>{STATUS_LABELS[b.status]}</Badge>
                  <Link
                    href={`/bookings/${b.id}`}
                    className="text-xs text-terracotta hover:underline"
                  >
                    Ver detalle →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}

function Tab({
  current,
  value,
  label,
}: {
  current: string | undefined;
  value: string | undefined;
  label: string;
}) {
  const active = current === value;
  const href = value ? `/bookings?status=${value}` : "/bookings";
  return (
    <Link
      href={href}
      className={`rounded-full px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
        active
          ? "bg-ink text-paper"
          : "border border-line text-ink-soft hover:border-ink/30 hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-paper p-16 text-center">
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
        Sin reservas
      </p>
      <h2 className="mt-3 font-display text-3xl">
        Aún no has reservado nada por aquí.
      </h2>
      <p className="mx-auto mt-2 max-w-prose text-ink-soft">
        Explora el catálogo y encuentra un lugar para tu próxima escapada.
      </p>
      <div className="mt-6">
        <ButtonLink href="/search" size="md">
          Explorar alojamientos
        </ButtonLink>
      </div>
    </div>
  );
}
