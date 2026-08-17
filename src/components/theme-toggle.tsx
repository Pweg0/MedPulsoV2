"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMounted } from "@/lib/use-mounted";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Alternar tema claro/escuro"
      className={cn(
        "group relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border border-border-strong bg-bg-inset px-1 transition-colors cursor-pointer",
        className
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full bg-accent text-on-accent shadow-sm transition-transform duration-300 ease-out",
          isDark ? "translate-x-7" : "translate-x-0"
        )}
      >
        {isDark ? <Moon size={14} strokeWidth={2.5} /> : <Sun size={14} strokeWidth={2.5} />}
      </span>
      <span className="sr-only">Alternar tema</span>
    </button>
  );
}
