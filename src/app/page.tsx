import Link from "next/link";
import { Container, SectionLabel } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { StayCard } from "@/components/ui/StayCard";
import { searchStays } from "@/modules/stays/services/search-stays";
import { prisma } from "@/shared/db";

export default async function HomePage() {
  // Edición destacada — toma los últimos 6 alojamientos activos.
  let featured: Awaited<ReturnType<typeof searchStays>> = [];
  try {
    featured = await searchStays({ limit: 6 }, { db: prisma });
  } catch {
    /* DB no disponible en build estático: dejar vacío y mostrar empty state */
  }

  return (
    <>
      <Hero />
      <Manifesto />
      <FeaturedEdition stays={featured} />
      <HostInvite />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Adornos de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-24 h-[36rem] w-[36rem] rounded-full bg-terracotta/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-24 h-[28rem] w-[28rem] rounded-full bg-moss/10 blur-3xl"
      />

      <Container size="wide" className="relative pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-7">
            <p className="rise rise-1 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
              <span className="text-terracotta">Edición №01</span>
              <span className="mx-2 text-line">/</span>
              Bogotá · 2026
            </p>

            <h1 className="rise rise-2 font-display text-[15vw] leading-[0.92] tracking-tight sm:text-[8.5rem]">
              <span className="block">Quédate</span>
              <span className="block italic text-terracotta">donde</span>
              <span className="block">la gente vive.</span>
            </h1>

            <p className="rise rise-3 max-w-prose text-base text-ink-soft sm:text-lg">
              StayLocal es un directorio de cuartos, casas y cabañas
              publicados por anfitriones del barrio. Sin agentes, sin
              marketing global —{" "}
              <span className="italic text-ink">solo lugares con dueño y dirección.</span>
            </p>

            <div className="rise rise-4 flex flex-wrap items-center gap-3 pt-2">
              <ButtonLink href="/search" size="lg">
                Explorar alojamientos
              </ButtonLink>
              <ButtonLink href="/host/stays/new" size="lg" variant="secondary">
                Publicar el tuyo
              </ButtonLink>
            </div>
          </div>

          <aside className="rise rise-5 lg:col-span-5">
            <SearchPanel />
          </aside>
        </div>
      </Container>
    </section>
  );
}

function SearchPanel() {
  return (
    <form
      action="/search"
      className="space-y-4 rounded-2xl border border-line bg-paper p-6 shadow-soft"
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
          Buscador
        </p>
        <span className="font-mono text-[10px] uppercase tracking-widest text-terracotta">
          en vivo
        </span>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
            ¿A dónde?
          </span>
          <input
            name="q"
            placeholder="Bogotá, Salento, San Andrés…"
            className="mt-1 h-11 w-full rounded-lg border border-line bg-bone px-3 text-sm text-ink placeholder:text-ink-mute focus:border-ink focus:bg-paper"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
              Llegada
            </span>
            <input
              type="date"
              name="checkIn"
              className="mt-1 h-11 w-full rounded-lg border border-line bg-bone px-3 text-sm text-ink"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
              Salida
            </span>
            <input
              type="date"
              name="checkOut"
              className="mt-1 h-11 w-full rounded-lg border border-line bg-bone px-3 text-sm text-ink"
            />
          </label>
        </div>

        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
            Personas
          </span>
          <input
            type="number"
            name="minCapacity"
            min={1}
            defaultValue={2}
            className="mt-1 h-11 w-full rounded-lg border border-line bg-bone px-3 text-sm"
          />
        </label>
      </div>

      <button
        type="submit"
        className="h-11 w-full rounded-lg bg-ink text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
      >
        Buscar →
      </button>
    </form>
  );
}

function Manifesto() {
  const items = [
    {
      num: "01",
      title: "Anfitriones reales",
      body: "Cada alojamiento lo publica una persona, no una agencia. Su perfil cuenta quién es y desde cuándo recibe huéspedes.",
    },
    {
      num: "02",
      title: "Disponibilidad honesta",
      body: "El calendario se actualiza al instante. Si una fecha aparece libre, está libre — sin sobre-reservas ni sorpresas.",
    },
    {
      num: "03",
      title: "Pago acompañado",
      body: "Procesamos el cobro y enviamos comprobante por correo en cuestión de segundos. Si cancelas a tiempo, las fechas se liberan.",
    },
  ];
  return (
    <section className="border-y border-line bg-paper">
      <Container size="wide" className="py-20">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <h2 className="max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            Tres reglas que <em className="text-terracotta">no</em> negociamos.
          </h2>
          <SectionLabel serial="§01">Manifiesto</SectionLabel>
        </div>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {items.map((it) => (
            <article key={it.num} className="space-y-3 border-t border-line pt-6">
              <p className="font-mono text-xs text-terracotta">{it.num}</p>
              <h3 className="font-display text-2xl leading-tight">{it.title}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{it.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FeaturedEdition({
  stays,
}: {
  stays: { id: string; title: string; locationText: string; pricePerNight: number; capacity: number; coverImageUrl: string | null }[];
}) {
  return (
    <section>
      <Container size="wide" className="py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <SectionLabel serial="§02">Edición destacada</SectionLabel>
            <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
              Lo nuevo, recién <em>publicado</em>.
            </h2>
          </div>
          <Link
            href="/search"
            className="hidden text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline sm:inline-block"
          >
            Ver todos →
          </Link>
        </div>

        {stays.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-paper p-12 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
              Catálogo vacío
            </p>
            <p className="mt-2 font-display text-2xl text-ink">
              Aún no hay alojamientos publicados.
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              ¿Eres anfitrión? Sé el primero en aparecer aquí.
            </p>
            <div className="mt-5">
              <ButtonLink href="/host/stays/new" size="md">
                Publicar el primero
              </ButtonLink>
            </div>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stays.map((s, i) => (
              <li key={s.id}>
                <StayCard stay={s} index={i} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}

function HostInvite() {
  return (
    <section className="bg-ink text-paper">
      <Container size="wide" className="grid grid-cols-1 items-center gap-10 py-20 lg:grid-cols-2">
        <div className="space-y-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-paper/60">
            Para anfitriones
          </p>
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">
            Tu casa también es <em className="text-ochre">un lugar</em>.
          </h2>
          <p className="max-w-prose text-paper/75">
            Si tienes una habitación, un apartamento o una cabaña que quieras
            compartir, publicarla toma cinco minutos. Decides precio, calendario y
            condiciones. Nosotros gestionamos las reservas, el pago y el correo.
          </p>
          <ButtonLink href="/host/stays/new" size="lg" variant="primary">
            Publicar mi alojamiento
          </ButtonLink>
        </div>
        <ul className="space-y-4 text-sm">
          <Stat label="Comisión" value="0%" caption="Proyecto académico — sin fee mientras dure." />
          <Stat label="Setup" value="≈5 min" caption="Subes fotos, defines precio y publicas." />
          <Stat label="Cancelación" value="Hasta el check-in" caption="Las fechas se liberan al instante." />
        </ul>
      </Container>
    </section>
  );
}

function Stat({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <li className="flex items-baseline justify-between gap-6 border-b border-paper/15 pb-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-paper/60">{label}</p>
        <p className="mt-1 text-paper/80">{caption}</p>
      </div>
      <p className="font-display text-3xl text-ochre">{value}</p>
    </li>
  );
}
