import type { Metadata } from "next";
import "./globals.css";
import { Header } from "./header";

export const metadata: Metadata = {
  title: "StayLocal - The Informed Local",
  description: "Find stays inspired by the informed local.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col font-body-md text-body-md bg-bone text-ink">
        <Header />
        <main className="flex-grow">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-bone-2 dark:bg-surface-container-low w-full py-stack-lg border-t border-line dark:border-outline-variant">
      <div className="max-w-container-max mx-auto px-gutter grid grid-cols-1 md:grid-cols-2 gap-stack-md items-center">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8">
          <span className="font-headline-md text-headline-md text-ink dark:text-on-surface">StayLocal</span>
          <span className="font-body-sm text-body-sm text-ink-soft dark:text-on-surface-variant text-center md:text-left mt-2 md:mt-1">© 2026 StayLocal. Inspired by the informed local.</span>
        </div>
        <div className="flex flex-wrap justify-center md:justify-end gap-6">
          <a className="font-label-caps text-label-caps text-ink-soft dark:text-on-surface-variant hover:text-terracotta dark:hover:text-primary-fixed-dim underline transition-all" href="#">Privacy</a>
          <a className="font-label-caps text-label-caps text-ink-soft dark:text-on-surface-variant hover:text-terracotta dark:hover:text-primary-fixed-dim underline transition-all" href="#">Terms</a>
          <a className="font-label-caps text-label-caps text-ink-soft dark:text-on-surface-variant hover:text-terracotta dark:hover:text-primary-fixed-dim underline transition-all" href="#">Sitemap</a>
          <a className="font-label-caps text-label-caps text-ink-soft dark:text-on-surface-variant hover:text-terracotta dark:hover:text-primary-fixed-dim underline transition-all" href="#">Company</a>
          <a className="font-label-caps text-label-caps text-ink-soft dark:text-on-surface-variant hover:text-terracotta dark:hover:text-primary-fixed-dim underline transition-all" href="#">Destinations</a>
        </div>
      </div>
    </footer>
  );
}
