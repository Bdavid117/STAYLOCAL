import type { Metadata } from "next";
import "./globals.css";
import { Header } from "./header";

export const metadata: Metadata = {
  title: "StayLocal",
  description: "Plataforma de alojamiento turístico — StayLocal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mt-16 border-t py-6 text-center text-sm text-gray-500">
          StayLocal · Proyecto académico — UNAL Ingeniería de Software I
        </footer>
      </body>
    </html>
  );
}
