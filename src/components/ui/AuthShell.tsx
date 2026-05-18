import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

export function AuthShell({
  serial,
  kicker,
  title,
  subtitle,
  children,
  aside,
}: {
  serial: string;
  kicker: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <Container size="wide" className="py-16 sm:py-24">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="max-w-md space-y-8">
            <div className="space-y-2">
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                <span className="text-terracotta">{serial}</span>
                <span className="mx-2 text-line">/</span>
                {kicker}
              </p>
              <h1 className="font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl">
                {title}
              </h1>
              {subtitle && (
                <p className="pt-2 text-base text-ink-soft">{subtitle}</p>
              )}
            </div>

            <div className="rounded-2xl border border-line bg-paper p-7 shadow-soft">
              {children}
            </div>
          </div>
        </div>

        {aside && <aside className="lg:col-span-5">{aside}</aside>}
      </div>
    </Container>
  );
}
