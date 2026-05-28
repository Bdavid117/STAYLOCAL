"use client";

import { useState } from "react";
import { StayCard } from "@/components/ui/StayCard";
import { MapView } from "@/components/ui/MapView";

type Stay = {
  id: string;
  title: string;
  locationText: string;
  pricePerNight: number;
  capacity: number;
  lat: number;
  lng: number;
  coverImageUrl: string | null;
};

export function SearchResults({
  results,
  favoriteIds,
  showFavoriteButton,
}: {
  results: Stay[];
  favoriteIds: Set<string>;
  showFavoriteButton: boolean;
}) {
  const [view, setView] = useState<"grid" | "map">("grid");

  return (
    <div className="mt-10">
      <div className="mb-6 flex justify-center">
        <div className="inline-flex rounded-full border border-line bg-paper p-1 shadow-sm">
          <button
            onClick={() => setView("grid")}
            className={`flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium transition-all ${
              view === "grid"
                ? "bg-ink text-paper"
                : "text-ink-soft hover:bg-bone-2 hover:text-ink"
            }`}
          >
            <span className="material-symbols-outlined text-sm">grid_view</span>
            Parrilla
          </button>
          <button
            onClick={() => setView("map")}
            className={`flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium transition-all ${
              view === "map"
                ? "bg-ink text-paper"
                : "text-ink-soft hover:bg-bone-2 hover:text-ink"
            }`}
          >
            <span className="material-symbols-outlined text-sm">map</span>
            Mapa
          </button>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-paper p-16 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
            Sin coincidencias
          </p>
          <p className="mt-3 font-display text-3xl">No encontramos nada con esos filtros.</p>
          <p className="mt-2 text-sm text-ink-soft">
            Intenta ampliar el rango de fechas, bajar la capacidad mínima o quitar el precio máximo.
          </p>
        </div>
      ) : view === "grid" ? (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((s, i) => (
            <li key={s.id}>
              <StayCard
                stay={s}
                index={i}
                isFavorite={favoriteIds.has(s.id)}
                showFavoriteButton={showFavoriteButton}
              />
            </li>
          ))}
        </ul>
      ) : (
        <MapView stays={results} />
      )}
    </div>
  );
}
