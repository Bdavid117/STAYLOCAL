import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "ink";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-px";

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm rounded-md",
  md: "h-10 px-4 text-sm rounded-lg",
  lg: "h-12 px-6 text-base rounded-lg",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-terracotta text-paper hover:bg-terracotta-deep shadow-warm hover:shadow-[0_28px_70px_-28px_rgba(184,83,66,0.45)]",
  secondary:
    "bg-paper text-ink border border-line hover:border-ink/40 hover:bg-bone",
  ghost:
    "text-ink-soft hover:text-ink hover:bg-bone-2/60",
  danger:
    "bg-paper text-terracotta-deep border border-terracotta/40 hover:bg-terracotta/10",
  ink:
    "bg-ink text-paper hover:bg-ink-soft",
};

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonProps = Common & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

type ButtonLinkProps = Common & {
  href: string;
  external?: boolean;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  href,
  external,
  children,
}: ButtonLinkProps) {
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
