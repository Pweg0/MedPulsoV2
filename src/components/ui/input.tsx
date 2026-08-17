import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

export function Input({
  className,
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-xl border border-border-strong bg-bg-inset px-4 text-sm text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent",
        className
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: ComponentPropsWithoutRef<"label">) {
  return (
    <label
      className={cn(
        "mb-2 block text-xs font-medium text-text-secondary",
        className
      )}
      {...props}
    />
  );
}
