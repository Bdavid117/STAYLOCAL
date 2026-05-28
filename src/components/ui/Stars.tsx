import type { ReactNode } from "react";

export function Stars({ 
  rating, 
  size = "sm",
  showNumber = false,
  count,
}: { 
  rating: number; 
  size?: "xs" | "sm" | "md" | "lg";
  showNumber?: boolean;
  count?: number;
}) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  const sizes = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5 text-terracotta">
        {[1, 2, 3, 4, 5].map((n) => (
          <StarIcon 
            key={n} 
            className={sizes[size]} 
            filled={n <= fullStars} 
            half={n === fullStars + 1 && hasHalfStar}
          />
        ))}
      </div>
      {showNumber && (
        <span className="ml-1 font-mono text-xs font-bold text-ink">
          {rating.toFixed(1)}
          {count !== undefined && (
            <span className="ml-1 text-[10px] font-normal text-ink-soft">
              ({count})
            </span>
          )}
        </span>
      )}
    </div>
  );
}

function StarIcon({ className, filled, half }: { className: string; filled: boolean; half: boolean }) {
  if (filled) {
    return (
      <span className={`material-symbols-outlined ${className} fill`}>
        star
      </span>
    );
  }
  if (half) {
    return (
      <span className={`material-symbols-outlined ${className} fill`}>
        star_half
      </span>
    );
  }
  return (
    <span className={`material-symbols-outlined ${className} text-ink-mute/30`}>
      star
    </span>
  );
}
