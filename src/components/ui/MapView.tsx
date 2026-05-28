"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

type Stay = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  pricePerNight: number;
  locationText: string;
  coverImageUrl: string | null;
};

export function MapView({ stays }: { stays: Stay[] }) {
  const Map = useMemo(
    () =>
      dynamic(() => import("./MapComponent"), {
        loading: () => (
          <div className="flex h-[calc(100vh-250px)] w-full items-center justify-center rounded-2xl border border-line bg-bone-2 text-ink-soft">
            <div className="text-center">
              <span className="material-symbols-outlined animate-spin mb-2">progress_activity</span>
              <p className="font-mono text-[10px] uppercase tracking-widest">Cargando mapa editorial...</p>
            </div>
          </div>
        ),
        ssr: false,
      }),
    []
  );

  return <Map stays={stays} />;
}
