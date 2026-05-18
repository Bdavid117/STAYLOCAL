import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/shared/require-auth";
import { staysDeps } from "@/modules/stays/composition";
import { Container, SectionLabel } from "@/components/ui/Container";
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
    <Container size="wide" className="py-14">
      <Link
        href={`/host/stays/${id}/edit`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
      >
        ← Volver al alojamiento
      </Link>

      <header className="mb-10 space-y-3">
        <SectionLabel serial="§E·02">Calendario</SectionLabel>
        <h1 className="font-display text-5xl leading-tight">{stay.title}</h1>
        <p className="text-ink-soft">
          Bloquea o libera rangos de fechas. Las fechas con reserva activa no se
          pueden tocar — primero hay que cancelar la reserva.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <div className="rounded-2xl border border-line bg-paper p-7 shadow-soft">
            <AvailabilityForm stayId={id} />
          </div>
        </section>

        <aside className="space-y-6 lg:col-span-5">
          <DateGroup
            title="Reservadas"
            count={booked.length}
            tone="moss"
            dates={booked.map((a) => a.date)}
          />
          <DateGroup
            title="Bloqueadas por ti"
            count={blocked.length}
            tone="ochre"
            dates={blocked.map((a) => a.date)}
          />
        </aside>
      </div>
    </Container>
  );
}

function DateGroup({
  title,
  count,
  tone,
  dates,
}: {
  title: string;
  count: number;
  tone: "moss" | "ochre";
  dates: Date[];
}) {
  const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });
  const colorRing = tone === "moss" ? "border-moss/30 bg-moss/[0.04]" : "border-ochre/40 bg-ochre/[0.06]";
  const dot = tone === "moss" ? "bg-moss" : "bg-ochre";
  return (
    <div className={`rounded-2xl border p-6 ${colorRing}`}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
          {title}
        </p>
        <span className="num text-xl">{count}</span>
      </div>
      {dates.length === 0 ? (
        <p className="mt-3 text-sm text-ink-mute">Ninguna.</p>
      ) : (
        <ul className="mt-4 space-y-1.5">
          {dates.map((d, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dot}`} />
              <span className="num text-ink">{fmt.format(d)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
