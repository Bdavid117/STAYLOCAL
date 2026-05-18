import Link from "next/link";
import { requireSession } from "@/shared/require-auth";
import { bookingsDeps } from "@/modules/bookings/composition";
import { listMyBookings } from "@/modules/bookings/services/list-my-bookings";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
};

const STATUS_TONE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-200 text-gray-700",
  COMPLETED: "bg-blue-100 text-blue-800",
};

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

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis reservas</h1>
        <nav className="flex gap-1 text-sm">
          <FilterLink current={status} value={undefined} label="Todas" />
          <FilterLink current={status} value="CONFIRMED" label="Confirmadas" />
          <FilterLink current={status} value="CANCELLED" label="Canceladas" />
          <FilterLink current={status} value="COMPLETED" label="Completadas" />
        </nav>
      </header>

      {list.length === 0 ? (
        <p className="text-sm text-gray-500">
          Aún no tienes reservas.{" "}
          <Link href="/search" className="text-brand hover:underline">
            Busca un alojamiento
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-3">
          {list.map((b) => (
            <li key={b.id} className="flex items-center gap-4 rounded border p-3">
              {b.stay.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={b.stay.coverImageUrl}
                  alt={b.stay.title}
                  className="h-20 w-28 rounded object-cover"
                />
              ) : (
                <div className="grid h-20 w-28 place-items-center rounded bg-gray-100 text-xs text-gray-400">
                  Sin imagen
                </div>
              )}
              <div className="min-w-0 flex-1">
                <Link
                  href={`/bookings/${b.id}`}
                  className="block truncate font-medium text-brand hover:underline"
                >
                  {b.stay.title}
                </Link>
                <p className="text-xs text-gray-500">{b.stay.locationText}</p>
                <p className="text-sm">
                  {fmt.format(b.checkIn)} → {fmt.format(b.checkOut)} ·{" "}
                  <strong>${b.totalAmount.toLocaleString("es-CO")}</strong>
                </p>
              </div>
              <span
                className={`rounded px-2 py-1 text-xs font-medium ${STATUS_TONE[b.status]}`}
              >
                {STATUS_LABELS[b.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FilterLink({
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
      className={`rounded px-2 py-1 ${active ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}
    >
      {label}
    </Link>
  );
}
