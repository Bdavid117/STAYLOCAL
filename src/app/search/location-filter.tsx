"use client";

import { useState } from "react";

export function LocationFilter({
  initialLat,
  initialLng,
  initialRadius,
}: {
  initialLat?: string;
  initialLng?: string;
  initialRadius?: string;
}) {
  const [lat, setLat] = useState(initialLat || "");
  const [lng, setLng] = useState(initialLng || "");
  const [loading, setLoading] = useState(false);

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toString());
        setLng(pos.coords.longitude.toString());
        setLoading(false);
      },
      (err) => {
        console.error(err);
        alert("No se pudo obtener tu ubicación");
        setLoading(false);
      }
    );
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:col-span-4 sm:grid-cols-4">
      <div className="sm:col-span-3">
        <label className="block">
          <div className="flex justify-between">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-ink-soft">
              Cerca de (Lat, Lng)
            </span>
            <button
              type="button"
              onClick={handleNearMe}
              className="text-[10px] font-bold uppercase tracking-widest text-terracotta hover:underline"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Mi ubicación"}
            </button>
          </div>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              name="lat"
              placeholder="Latitud"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="h-10 w-full rounded-md border border-line bg-bone px-3 text-sm text-ink placeholder:text-ink-mute focus:border-ink focus:bg-paper"
            />
            <input
              type="text"
              name="lng"
              placeholder="Longitud"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="h-10 w-full rounded-md border border-line bg-bone px-3 text-sm text-ink placeholder:text-ink-mute focus:border-ink focus:bg-paper"
            />
          </div>
        </label>
      </div>
      <div className="sm:col-span-1">
        <label className="block">
          <span className="block font-mono text-[10px] uppercase tracking-widest text-ink-soft">
            Radio (km)
          </span>
          <input
            type="number"
            name="radiusKm"
            defaultValue={initialRadius || "5"}
            className="mt-1 h-10 w-full rounded-md border border-line bg-bone px-3 text-sm text-ink placeholder:text-ink-mute focus:border-ink focus:bg-paper"
          />
        </label>
      </div>
    </div>
  );
}
