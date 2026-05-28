"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useEffect } from "react";

// Fix Leaflet marker icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type Stay = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  pricePerNight: number;
  locationText: string;
  coverImageUrl: string | null;
};

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({ stays }: { stays: Stay[] }) {
  // Default center (e.g., Bogotá if no stays, or center of stays)
  const defaultCenter: [number, number] = stays.length > 0 
    ? [stays[0].lat, stays[0].lng] 
    : [4.6097, -74.0817];

  return (
    <div className="h-[calc(100vh-250px)] w-full overflow-hidden rounded-2xl border border-line shadow-soft">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <ChangeView center={defaultCenter} zoom={12} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {stays.map((stay) => (
          <Marker key={stay.id} position={[stay.lat, stay.lng]}>
            <Popup className="stay-popup">
              <div className="w-48 overflow-hidden rounded-lg">
                {stay.coverImageUrl && (
                  <img
                    src={stay.coverImageUrl}
                    alt={stay.title}
                    className="h-24 w-full object-cover"
                  />
                )}
                <div className="p-2">
                  <h4 className="font-display text-sm font-bold text-ink truncate">
                    {stay.title}
                  </h4>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
                    {stay.locationText}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="num text-xs font-bold text-terracotta">
                      ${stay.pricePerNight.toLocaleString("es-CO")}
                    </span>
                    <Link
                      href={`/stays/${stay.id}`}
                      className="text-[10px] font-bold uppercase tracking-tighter text-ink hover:underline"
                    >
                      Ver más
                    </Link>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
