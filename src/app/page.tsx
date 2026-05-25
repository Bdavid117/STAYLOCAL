import Link from "next/link";
import { searchStays } from "@/modules/stays/services/search-stays";
import { prisma } from "@/shared/db";

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof searchStays>> = [];
  try {
    featured = await searchStays({ limit: 6 }, { db: prisma });
  } catch {
    /* DB no disponible en build estático: dejar vacío y mostrar empty state */
  }

  return (
    <>
      <Hero />
      <FeaturedEdition stays={featured} />
    </>
  );
}

function Hero() {
  return (
    <section className="relative w-full max-w-container-max mx-auto px-gutter py-16 md:py-24 lg:py-32 flex flex-col items-center justify-center text-center">
      <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-ink mb-6 max-w-3xl">
        Encuentra alojamientos inspirados por locales informados.
      </h1>
      <p className="font-body-lg text-body-lg text-ink-soft mb-12 max-w-2xl">
        Descubre espacios únicos, ofrecidos por personas que conocen su barrio mejor que nadie. Evita las trampas turísticas y quédate como si vivieras ahí.
      </p>
      
      {/* Search Bar */}
      <form action="/search" className="w-full max-w-4xl bg-paper rounded-full shadow-warm border border-line p-2 flex flex-col md:flex-row gap-2 md:gap-0 items-center">
        <div className="flex-1 w-full md:w-auto px-6 py-3 hover:bg-bone-2 rounded-full cursor-text transition-colors group text-left">
          <label className="block font-label-caps text-label-caps text-ink-mute mb-1">Dónde</label>
          <input name="q" className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-body-md text-ink placeholder:text-ink-soft/50 outline-none" placeholder="Destinos" type="text" />
        </div>
        <div className="hidden md:block w-px h-10 bg-line-hair mx-2"></div>
        <div className="flex-1 w-full md:w-auto px-6 py-3 hover:bg-bone-2 rounded-full cursor-text transition-colors group text-left flex gap-2">
            <div className="flex-1">
                <label className="block font-label-caps text-label-caps text-ink-mute mb-1">Llegada</label>
                <input name="checkIn" className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-body-md text-ink placeholder:text-ink-soft/50 outline-none" placeholder="Fechas" type="date" />
            </div>
            <div className="flex-1">
                <label className="block font-label-caps text-label-caps text-ink-mute mb-1">Salida</label>
                <input name="checkOut" className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-body-md text-ink placeholder:text-ink-soft/50 outline-none" placeholder="Fechas" type="date" />
            </div>
        </div>
        <div className="hidden md:block w-px h-10 bg-line-hair mx-2"></div>
        <div className="flex-1 w-full md:w-auto px-6 py-3 hover:bg-bone-2 rounded-full cursor-pointer transition-colors group flex justify-between items-center text-left">
          <div>
            <label className="block font-label-caps text-label-caps text-ink-mute mb-1">Quiénes</label>
            <input name="minCapacity" type="number" min="1" defaultValue="2" className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-body-md text-ink placeholder:text-ink-soft/50 outline-none" placeholder="Huéspedes" />
          </div>
          <button type="submit" className="bg-terracotta hover:bg-terracotta-deep text-paper p-3 rounded-full flex items-center justify-center transition-colors shadow-soft">
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>
      </form>
    </section>
  );
}

function FeaturedEdition({
  stays,
}: {
  stays: { id: string; title: string; locationText: string; pricePerNight: number; capacity: number; coverImageUrl: string | null }[];
}) {
  return (
    <section className="w-full max-w-editorial mx-auto px-gutter py-16">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline-md text-headline-md text-ink mb-2">Escapes Seleccionados</h2>
          <p className="font-body-md text-body-md text-ink-soft">Casas elegidas a mano para el viajero exigente.</p>
        </div>
        <Link href="/search" className="font-label-caps text-label-caps text-terracotta hover:text-terracotta-deep transition-colors uppercase tracking-wider flex items-center gap-1">
          Ver Todo <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>

      {stays.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-paper p-12 text-center">
            <p className="font-label-caps text-label-caps text-ink-mute uppercase tracking-widest">Catálogo vacío</p>
            <p className="mt-2 font-headline-md text-headline-md text-ink">Aún no hay alojamientos publicados.</p>
            <Link href="/host/stays/new" className="mt-6 inline-block bg-terracotta hover:bg-terracotta-deep text-paper font-bold py-2 px-6 rounded-lg transition-colors shadow-soft">Publicar el primero</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stays.map((s) => (
            <Link href={`/stays/${s.id}`} key={s.id} className="block">
                <div className="bg-bone-2 rounded-xl shadow-soft overflow-hidden group cursor-pointer transition-transform hover:-translate-y-1 duration-300 flex flex-col h-full">
                    <div className="aspect-[4/3] w-full bg-surface-dim relative overflow-hidden">
                        {s.coverImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.coverImageUrl} alt={s.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-line">
                                <span className="material-symbols-outlined text-ink-mute text-4xl">image</span>
                            </div>
                        )}
                        <div className="absolute top-4 right-4 bg-paper/90 backdrop-blur-sm p-2 rounded-full shadow-soft flex items-center justify-center text-ink hover:text-terracotta transition-colors">
                            <span className="material-symbols-outlined">favorite</span>
                        </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-headline-md text-headline-md text-ink truncate pr-4">{s.title}</h3>
                            <div className="flex items-center gap-1 text-ink-soft">
                                <span className="material-symbols-outlined text-ochre text-sm fill">star</span>
                                <span className="font-body-sm text-body-sm">4.9</span>
                            </div>
                        </div>
                        <p className="font-body-sm text-body-sm text-ink-soft mb-4">{s.locationText}</p>
                        
                        <div className="flex justify-between items-end mt-auto pt-4 border-t border-line-hair">
                            <div>
                                <span className="font-mono-price text-mono-price text-ink">${s.pricePerNight}</span>
                                <span className="font-body-sm text-body-sm text-ink-soft"> / noche</span>
                            </div>
                            <span className="font-label-caps text-label-caps px-2 py-1 bg-moss/10 text-moss rounded">Disponible</span>
                        </div>
                    </div>
                </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
