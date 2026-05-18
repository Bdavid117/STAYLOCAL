import type { ReactNode } from "react";

type Tone = "neutral" | "moss" | "terracotta" | "ochre" | "ink";

const tones: Record<Tone, string> = {
  neutral: "bg-bone-2 text-ink-soft",
  moss: "bg-moss/15 text-moss",
  terracotta: "bg-terracotta/15 text-terracotta-deep",
  ochre: "bg-ochre/20 text-ink",
  ink: "bg-ink text-paper",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
