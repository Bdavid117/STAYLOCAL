import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold">Hospedaje local, a un clic.</h1>
        <p className="text-lg text-gray-600">
          Encuentra alojamientos únicos publicados por anfitriones locales.
        </p>
        <div className="flex gap-3 pt-2">
          <Link
            href="/search"
            className="rounded bg-brand px-5 py-2 text-white hover:bg-brand-dark"
          >
            Buscar alojamientos
          </Link>
          <Link
            href="/register"
            className="rounded border px-5 py-2 hover:bg-gray-50"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </section>
  );
}
