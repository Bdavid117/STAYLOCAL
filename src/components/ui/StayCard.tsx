import Link from "next/link";

type Stay = {
  id: string;
  title: string;
  locationText: string;
  pricePerNight: number;
  capacity?: number;
  coverImageUrl: string | null;
};

// Pequeño número de serie tipo revista, derivado del id. Da identidad
// editorial a cada card sin tocar el modelo de datos.
function serialFrom(id: string): string {
  const sum = id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return String(sum % 999).padStart(3, "0");
}

export function StayCard({ stay, index }: { stay: Stay; index?: number }) {
  const serial = index !== undefined ? String(index + 1).padStart(2, "0") : serialFrom(stay.id);
  return (
    <Link
      href={`/stays/${stay.id}`}
      className="group block overflow-hidden rounded-xl border border-line-hair bg-paper transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-soft"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-bone-2">
        {stay.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={stay.coverImageUrl}
            alt={stay.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              viewBox="0 0 60 60"
              fill="none"
              stroke="currentColor"
              className="h-10 w-10 text-ink-mute/50"
            >
              <path d="M10 50V25l20-15 20 15v25H10z" strokeWidth="1.2" />
              <path d="M24 50V36h12v14" strokeWidth="1.2" />
            </svg>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-paper/95 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-ink-soft backdrop-blur">
          № {serial}
        </span>
      </div>
      <div className="space-y-2 p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
          {stay.locationText}
        </p>
        <h3 className="font-display text-lg leading-tight text-ink line-clamp-2">
          {stay.title}
        </h3>
        <div className="flex items-baseline justify-between pt-1">
          <p className="num text-base">
            <span className="text-ink">${stay.pricePerNight.toLocaleString("es-CO")}</span>
            <span className="ml-1 text-[10px] uppercase tracking-widest text-ink-mute">
              / noche
            </span>
          </p>
          {stay.capacity !== undefined && (
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
              {stay.capacity} pers
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
