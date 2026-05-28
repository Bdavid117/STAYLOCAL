import { prisma } from "@/shared/db";
import { auth } from "@/shared/auth";
import { searchStays } from "@/modules/stays/services/search-stays";
import { Container, SectionLabel } from "@/components/ui/Container";
import { Banner } from "@/components/ui/Banner";
import { SearchResults } from "./search-results";
import { Button } from "@/components/ui/Button";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pick(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const session = await auth();
  const filters = {
    q: pick(sp.q),
    minPrice: pick(sp.minPrice),
    maxPrice: pick(sp.maxPrice),
    minCapacity: pick(sp.minCapacity),
    checkIn: pick(sp.checkIn),
    checkOut: pick(sp.checkOut),
  };

  let results: Awaited<ReturnType<typeof searchStays>> = [];
  let error: string | null = null;
  let favoriteIds: Set<string> = new Set();

  try {
    results = await searchStays(filters, { db: prisma });
    
    if (session?.user?.id) {
      const favs = await prisma.favorite.findMany({
        where: { userId: session.user.id },
        select: { stayId: true }
      });
      favoriteIds = new Set(favs.map(f => f.stayId));
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Filtros inválidos";
  }

  const activeFilters = Object.entries(filters).filter(([, v]) => v).length;

  return (
    <Container size="wide" className="py-14">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div className="space-y-2">
          <SectionLabel serial="§B">Catálogo</SectionLabel>
          <h1 className="font-display text-5xl leading-tight tracking-tight sm:text-6xl">
            {filters.q ? (
              <>
                Resultados en <em className="italic text-terracotta">{filters.q}</em>
              </>
            ) : (
              <>
                Toda la <em className="italic text-terracotta">edición</em>.
              </>
            )}
          </h1>
          <p className="text-ink-soft">
            <span className="num">{results.length}</span> alojamiento
            {results.length === 1 ? "" : "s"} encontrado
            {results.length === 1 ? "" : "s"}
            {activeFilters > 0 && (
              <>
                {" · "}
                <span className="num">{activeFilters}</span> filtro
                {activeFilters === 1 ? "" : "s"} activo
                {activeFilters === 1 ? "" : "s"}
              </>
            )}
          </p>
        </div>
      </div>

      <FiltersBar filters={filters} />

      {error && (
        <Banner tone="error" className="mt-6">
          {error}
        </Banner>
      )}

      <SearchResults 
        results={results} 
        favoriteIds={favoriteIds} 
        showFavoriteButton={!!session?.user?.id} 
      />
    </Container>
  );
}

function FiltersBar({
  filters,
}: {
  filters: {
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    minCapacity?: string;
    checkIn?: string;
    checkOut?: string;
  };
}) {
  return (
    <form className="grid grid-cols-1 gap-3 rounded-2xl border border-line bg-paper p-5 shadow-soft sm:grid-cols-12">
      <FilterInput
        name="q"
        label="Lugar o palabra clave"
        defaultValue={filters.q}
        placeholder="Bogotá, cabaña, centro…"
        className="sm:col-span-4"
      />
      <FilterInput
        name="checkIn"
        type="date"
        label="Llegada"
        defaultValue={filters.checkIn}
        className="sm:col-span-2"
      />
      <FilterInput
        name="checkOut"
        type="date"
        label="Salida"
        defaultValue={filters.checkOut}
        className="sm:col-span-2"
      />
      <FilterInput
        name="minCapacity"
        type="number"
        label="Personas mín."
        defaultValue={filters.minCapacity}
        className="sm:col-span-1"
      />
      <FilterInput
        name="minPrice"
        type="number"
        label="Precio mín."
        defaultValue={filters.minPrice}
        className="sm:col-span-1"
      />
      <FilterInput
        name="maxPrice"
        type="number"
        label="Precio máx."
        defaultValue={filters.maxPrice}
        className="sm:col-span-1"
      />
      <div className="flex items-end sm:col-span-1">
        <Button type="submit" size="md" className="w-full">
          Buscar
        </Button>
      </div>
    </form>
  );
}

function FilterInput({
  name,
  label,
  type = "text",
  defaultValue,
  placeholder,
  className = "",
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block font-mono text-[10px] uppercase tracking-widest text-ink-soft">
        {label}
      </span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1 h-10 w-full rounded-md border border-line bg-bone px-3 text-sm text-ink placeholder:text-ink-mute focus:border-ink focus:bg-paper"
      />
    </label>
  );
}
