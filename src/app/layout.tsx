import type { Metadata } from "next";
import { Fraunces, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "./header";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "700"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "StayLocal — Quédate donde la gente vive",
  description:
    "Plataforma colombiana de alojamiento turístico local. Encuentra cuartos, casas y cabañas publicadas por anfitriones del barrio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${dmSans.variable} ${mono.variable}`}
    >
      <body className="min-h-screen">
        <Header />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-bone">
      <Container size="wide" className="py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-prose text-sm text-ink-soft">
              Editorial de alojamiento turístico local. Publicado en Bogotá,
              Colombia, como proyecto académico de Ingeniería de Software I.
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
              Explorar
            </p>
            <ul className="space-y-1.5">
              <li><a href="/search" className="text-ink-soft hover:text-ink">Buscar alojamientos</a></li>
              <li><a href="/host/stays/new" className="text-ink-soft hover:text-ink">Publicar el tuyo</a></li>
              <li><a href="/login" className="text-ink-soft hover:text-ink">Iniciar sesión</a></li>
            </ul>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
              Colofón
            </p>
            <p className="text-ink-soft">
              Universidad Nacional de Colombia · 2026
            </p>
            <p className="text-ink-mute">
              Compuesto con Fraunces, DM Sans e IBM Plex Mono.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
