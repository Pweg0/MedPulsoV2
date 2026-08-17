import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none cursor-pointer whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-on-accent hover:brightness-110 active:brightness-95 shadow-[0_8px_24px_-8px_var(--color-accent)]",
  secondary:
    "bg-bg-inset text-text-primary border border-border-strong hover:border-accent hover:text-accent",
  ghost: "text-text-secondary hover:text-text-primary hover:bg-bg-inset",
  outline:
    "border border-border-strong text-text-primary hover:border-accent hover:text-accent bg-transparent",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[15px]",
  lg: "h-14 px-8 text-base",
};

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: Variant;
  size?: Size;
  href?: string;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  href,
  ...props
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {props.children as React.ReactNode}
      </Link>
    );
  }

  return <button className={classes} {...props} />;
}
