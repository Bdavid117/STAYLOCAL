import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "StayLocal",
  description: "Plataforma de alojamiento turístico — StayLocal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="border-b">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-bold text-brand">
              StayLocal
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/search" className="hover:underline">Buscar</Link>
              <Link href="/login" className="hover:underline">Ingresar</Link>
              <Link href="/register" className="rounded bg-brand px-3 py-1 text-white hover:bg-brand-dark">
                Registrarme
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mt-16 border-t py-6 text-center text-sm text-gray-500">
          StayLocal · Proyecto académico — UNAL Ingeniería de Software I
        </footer>
      </body>
    </html>
  );
}
