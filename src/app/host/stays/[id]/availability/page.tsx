import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/shared/require-auth";
import { staysDeps } from "@/modules/stays/composition";
import { AvailabilityForm } from "./availability-form";

type Props = { params: Promise<{ id: string }> };

export default async function AvailabilityPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();

  const { stays, availability } = staysDeps();
  const stay = await stays.findById(id);
  if (!stay || stay.status === "DELETED") notFound();
  if (stay.hostId !== session.user.id) redirect("/host/stays");

  const today = new Date();
  const horizon = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000);
  const range = await availability.rangeForStay(id, today, horizon);

  const blocked = range.filter((a) => a.status === "BLOCKED");
  const booked = range.filter((a) => a.status === "BOOKED");

  return (
    <section className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Disponibilidad</h1>
        <Link href={`/host/stays/${id}/edit`} className="text-sm text-brand hover:underline">
          ← Volver al alojamiento
        </Link>
      </header>

      <AvailabilityForm stayId={id} />

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-2 font-semibold">Fechas bloqueadas ({blocked.length})</h2>
          <DateList dates={blocked.map((a) => a.date)} />
        </div>
        <div>
          <h2 className="mb-2 font-semibold">Fechas reservadas ({booked.length})</h2>
          <DateList dates={booked.map((a) => a.date)} />
        </div>
      </section>
    </section>
  );
}

function DateList({ dates }: { dates: Date[] }) {
  if (dates.length === 0) return <p className="text-sm text-gray-500">Ninguna.</p>;
  const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });
  return (
    <ul className="space-y-1 text-sm">
      {dates.map((d, i) => (
        <li key={i} className="rounded bg-gray-50 px-2 py-1">{fmt.format(d)}</li>
      ))}
    </ul>
  );
}
