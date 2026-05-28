"use client";

import { toggleFavoriteAction } from "./actions";
import { useState, useTransition } from "react";

export function FavoriteButton({
  stayId,
  initialIsFavorite,
  className = "",
}: {
  stayId: string;
  initialIsFavorite: boolean;
  className?: string;
}) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic update
    setIsFavorite(!isFavorite);

    startTransition(async () => {
      const result = await toggleFavoriteAction(stayId);
      if (result.error) {
        // Rollback on error
        setIsFavorite(isFavorite);
        alert(result.error);
      } else if (result.isFavorite !== undefined) {
        setIsFavorite(result.isFavorite);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`flex items-center justify-center rounded-full bg-paper/90 p-2 shadow-soft backdrop-blur-sm transition-all hover:scale-110 active:scale-95 ${className}`}
      aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      <span
        className={`material-symbols-outlined text-[20px] transition-colors ${
          isFavorite ? "fill text-terracotta" : "text-ink"
        }`}
      >
        favorite
      </span>
    </button>
  );
}
