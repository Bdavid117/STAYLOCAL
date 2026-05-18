import Link from "next/link";
import { prisma } from "@/shared/db";
import { searchStays } from "@/modules/stays/services/search-stays";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pick(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
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
  try {
    results = await searchStays(filters, { db: prisma });
  } catch (err) {
    error = err instanceof Error ? err.message : "Filtros inválidos";
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Buscar alojamientos</h1>

      <form className="grid grid-cols-1 gap-3 rounded border p-4 sm:grid-cols-6">
        <input
          name="q"
          placeholder="Ubicación, título o palabra clave"
          defaultValue={filters.q}
          className="rounded border px-3 py-2 sm:col-span-3"
        />
        <input
          name="checkIn"
          type="date"
          defaultValue={filters.checkIn}
          className="rounded border px-3 py-2"
        />
        <input
          name="checkOut"
          type="date"
          defaultValue={filters.checkOut}
          className="rounded border px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-brand px-4 py-2 text-white hover:bg-brand-dark"
        >
          Buscar
        </button>
        <input
          name="minPrice"
          type="number"
          placeholder="Precio mín."
          defaultValue={filters.minPrice}
          className="rounded border px-3 py-2 sm:col-span-2"
        />
        <input
          name="maxPrice"
          type="number"
          placeholder="Precio máx."
          defaultValue={filters.maxPrice}
          className="rounded border px-3 py-2 sm:col-span-2"
        />
        <input
          name="minCapacity"
          type="number"
          placeholder="Capacidad mín."
          defaultValue={filters.minCapacity}
          className="rounded border px-3 py-2 sm:col-span-2"
        />
      </form>

      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {results.length === 0 ? (
        <p className="text-sm text-gray-500">
          No encontramos alojamientos con esos filtros.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((s) => (
            <li key={s.id} className="overflow-hidden rounded border hover:shadow">
              <Link href={`/stays/${s.id}`} className="block">
                {s.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.coverImageUrl} alt={s.title} className="h-44 w-full object-cover" />
                ) : (
                  <div className="grid h-44 w-full place-items-center bg-gray-100 text-sm text-gray-400">
                    Sin imagen
                  </div>
                )}
                <div className="space-y-1 p-3">
                  <h3 className="font-medium">{s.title}</h3>
                  <p className="text-xs text-gray-500">{s.locationText}</p>
                  <p className="text-sm">
                    ${s.pricePerNight.toLocaleString("es-CO")} · {s.capacity} pers
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
