import Link from "next/link";

// Firma de marca: "Stay" en sans + "local" en serif italic Fraunces.
// El contraste sans/serif crea una identidad reconocible al instante.
export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls =
    size === "lg"
      ? "text-3xl"
      : size === "sm"
        ? "text-base"
        : "text-xl";
  return (
    <Link
      href="/"
      className={`${cls} group inline-flex items-baseline font-medium tracking-tight text-ink`}
      aria-label="StayLocal — inicio"
    >
      <span>Stay</span>
      <span className="font-display italic text-terracotta transition-transform group-hover:-translate-y-px">
        local
      </span>
      <span aria-hidden className="ml-1 mt-1 inline-block h-1 w-1 rounded-full bg-terracotta" />
    </Link>
  );
}
