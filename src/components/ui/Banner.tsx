import type { ReactNode } from "react";

type Tone = "info" | "success" | "warning" | "error";

const tones: Record<Tone, string> = {
  info: "border-line bg-paper text-ink-soft",
  success: "border-moss/30 bg-moss/[0.06] text-moss",
  warning: "border-ochre/40 bg-ochre/10 text-ink",
  error: "border-terracotta/40 bg-terracotta/10 text-terracotta-deep",
};

export function Banner({
  tone = "info",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={`rounded-lg border px-3.5 py-2.5 text-sm ${tones[tone]} ${className}`}
    >
      {children}
    </div>
  );
}
