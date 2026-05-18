import Link from "next/link";
import { requireSession } from "@/shared/require-auth";
import { staysDeps } from "@/modules/stays/composition";

export default async function HostStaysPage() {
  const session = await requireSession();
  const { stays } = staysDeps();
  const list = await stays.listByHost(session.user.id);

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis alojamientos</h1>
        <Link
          href="/host/stays/new"
          className="rounded bg-brand px-4 py-2 text-white hover:bg-brand-dark"
        >
          Publicar nuevo
        </Link>
      </header>

      {list.length === 0 ? (
        <p className="text-sm text-gray-500">
          Aún no has publicado alojamientos.{" "}
          <Link href="/host/stays/new" className="text-brand hover:underline">
            Publica el primero
          </Link>
          .
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <li key={s.id} className="overflow-hidden rounded border">
              {s.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.coverImageUrl} alt={s.title} className="h-40 w-full object-cover" />
              )}
              <div className="space-y-2 p-3">
                <h3 className="font-medium">{s.title}</h3>
                <p className="text-xs text-gray-500">{s.locationText}</p>
                <p className="text-sm">
                  ${s.pricePerNight.toLocaleString("es-CO")} · {s.capacity} pers
                </p>
                <p className="text-xs">
                  Estado:{" "}
                  <span className="font-semibold">{s.status.toLowerCase()}</span>
                </p>
                <div className="flex gap-2 pt-1 text-sm">
                  <Link
                    href={`/host/stays/${s.id}/edit`}
                    className="rounded border px-2 py-1 hover:bg-gray-50"
                  >
                    Editar
                  </Link>
                  <Link
                    href={`/host/stays/${s.id}/availability`}
                    className="rounded border px-2 py-1 hover:bg-gray-50"
                  >
                    Disponibilidad
                  </Link>
                  <Link
                    href={`/stays/${s.id}`}
                    className="rounded border px-2 py-1 hover:bg-gray-50"
                  >
                    Ver público
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
