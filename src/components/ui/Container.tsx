import type { ReactNode } from "react";

type Size = "narrow" | "default" | "wide" | "full";

const widths: Record<Size, string> = {
  narrow: "max-w-3xl",
  default: "max-w-5xl",
  wide: "max-w-editorial",
  full: "max-w-[96rem]",
};

export function Container({
  size = "default",
  className = "",
  children,
}: {
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`mx-auto w-full px-5 sm:px-8 ${widths[size]} ${className}`}>
      {children}
    </div>
  );
}

export function SectionLabel({
  serial,
  children,
}: {
  serial?: string;
  children: ReactNode;
}) {
  return (
    <div className="rule-stamp">
      {serial && <span className="text-terracotta">{serial}</span>}
      <span>{children}</span>
    </div>
  );
}
