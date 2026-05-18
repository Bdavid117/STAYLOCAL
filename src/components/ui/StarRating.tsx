"use client";

import { useState } from "react";

// Radio group accesible con hover dinámico. Cinco estrellas SVG.
export function StarRating({ name = "rating" }: { name?: string }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const active = hovered ?? selected ?? 0;

  return (
    <fieldset className="flex items-center gap-1.5" onMouseLeave={() => setHovered(null)}>
      <legend className="sr-only">Calificación</legend>
      {[1, 2, 3, 4, 5].map((n) => (
        <label key={n} className="relative cursor-pointer">
          <input
            type="radio"
            name={name}
            value={n}
            checked={selected === n}
            onChange={() => setSelected(n)}
            className="sr-only"
          />
          <Star
            filled={n <= active}
            onMouseEnter={() => setHovered(n)}
            label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
          />
        </label>
      ))}
      <span className="ml-3 font-mono text-xs uppercase tracking-widest text-ink-soft">
        {selected ? `${selected} / 5` : "Toca para calificar"}
      </span>
    </fieldset>
  );
}

function Star({
  filled,
  onMouseEnter,
  label,
}: {
  filled: boolean;
  onMouseEnter: () => void;
  label: string;
}) {
  return (
    <svg
      onMouseEnter={onMouseEnter}
      role="img"
      aria-label={label}
      viewBox="0 0 24 24"
      className={`h-8 w-8 transition-all duration-200 ${
        filled
          ? "scale-105 text-terracotta drop-shadow-[0_2px_6px_rgba(184,83,66,0.35)]"
          : "text-ink-mute/40 hover:text-terracotta/60"
      }`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <path d="M12 3.5l2.6 5.4 5.9.6-4.4 4.1 1.2 5.9L12 16.7 6.7 19.5l1.2-5.9L3.5 9.5l5.9-.6L12 3.5z" />
    </svg>
  );
}
