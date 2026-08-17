import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SessionCard({
  respondidas,
  acertos,
}: {
  respondidas: number;
  acertos: number;
}) {
  const pct = respondidas > 0 ? Math.round((acertos / respondidas) * 100) : 0;

  return (
    <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-bg-elevated p-5 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vital-500/10 text-vital">
          <CheckCircle2 size={18} />
        </span>
        <div>
          <p className="font-display text-base text-text-primary">
            {respondidas > 0
              ? `${acertos} de ${respondidas} certas hoje`
              : "Nenhuma questão hoje ainda"}
          </p>
          <p className="text-xs text-text-tertiary">
            {respondidas > 0
              ? `${pct}% de acerto na sessão de hoje`
              : "Que tal resolver algumas agora?"}
          </p>
        </div>
      </div>

      <Button href="/estudar" size="sm">
        Resolver questões <ArrowRight size={15} />
      </Button>
    </div>
  );
}
