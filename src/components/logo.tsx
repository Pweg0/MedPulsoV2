import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-on-accent">
        <Activity size={18} strokeWidth={2.75} />
      </span>
      <span className="font-display text-xl tracking-tight text-text-primary">
        MedPulso
        <span className="text-accent">.ia</span>
      </span>
    </span>
  );
}
