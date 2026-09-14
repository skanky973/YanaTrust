import { type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-brand-green-dark text-brand-cream hover:bg-brand-green disabled:opacity-50",
  secondary:
    "bg-brand-gold text-brand-ink hover:brightness-95 disabled:opacity-50",
  ghost:
    "bg-transparent text-brand-green-dark hover:bg-brand-green-dark/10 disabled:opacity-50",
};

const BASE_CLASSES =
  "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
