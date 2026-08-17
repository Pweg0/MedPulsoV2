import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

function UsageBar({
  label,
  value,
  max,
  comingSoon,
}: {
  label: string;
  value: number;
  max: number;
  comingSoon?: boolean;
}) {
  const pct = comingSoon ? 0 : max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary">{label}</span>
        {comingSoon ? (
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
            em breve
          </span>
        ) : (
          <span className="font-mono text-text-tertiary">
            {value}/{max}
          </span>
        )}
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-bg-inset">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${comingSoon ? 0 : pct}%` }}
        />
      </div>
    </div>
  );
}

export function PlanCard({
  planLabel,
  planNote,
  totalRespondidas,
  totalDisponiveis,
}: {
  planLabel: string;
  planNote: string;
  totalRespondidas: number;
  totalDisponiveis: number;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-bg-elevated p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Zap size={18} />
        </span>
        <div>
          <p className="font-display text-base text-text-primary">
            {planLabel}
          </p>
          <p className="text-xs text-text-tertiary">{planNote}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <UsageBar
          label="Questões"
          value={totalRespondidas}
          max={Math.max(totalDisponiveis, 1)}
        />
        <UsageBar label="Flashcards" value={0} max={0} comingSoon />
        <UsageBar label="IA" value={0} max={0} comingSoon />
      </div>

      <Button href="/precos" variant="secondary" size="sm" className="shrink-0">
        <Zap size={14} /> Ver planos
      </Button>
    </div>
  );
}
