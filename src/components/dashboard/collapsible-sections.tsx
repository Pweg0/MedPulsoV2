"use client";

import { useState } from "react";
import { ChevronDown, Compass, LineChart, History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardData } from "@/lib/supabase/dashboard-data";

function Section({
  title,
  icon: Icon,
  defaultOpen,
  children,
}: {
  title: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-4 text-left cursor-pointer"
      >
        <span className="flex items-center gap-2.5 font-display text-base text-text-primary">
          <Icon size={17} className="text-accent" />
          {title}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "text-text-tertiary transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="border-t border-border p-4">{children}</div>}
    </div>
  );
}

const maisFerramentas = [
  "Simulados",
  "Ranking",
  "Conquistas",
  "DNA da Prova",
];

export function CollapsibleSections({ data }: { data: DashboardData }) {
  return (
    <div className="flex flex-col gap-3">
      <Section title="Mais ferramentas" icon={Compass}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {maisFerramentas.map((label) => (
            <div
              key={label}
              className="flex items-center justify-center rounded-xl border border-dashed border-border-strong p-4 text-center text-xs text-text-tertiary"
            >
              {label}
              <span className="ml-1.5 font-mono text-[9px] uppercase">
                (em breve)
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Seu progresso" icon={LineChart}>
        {data.tableReady && data.totalRespondidas > 0 ? (
          <p className="text-sm text-text-secondary">
            Você já respondeu{" "}
            <span className="font-semibold text-text-primary">
              {data.totalRespondidas}
            </span>{" "}
            questões distintas de{" "}
            <span className="font-semibold text-text-primary">
              {data.totalDisponiveis}
            </span>{" "}
            no banco. O gráfico detalhado por área ainda está em construção.
          </p>
        ) : (
          <p className="text-sm text-text-tertiary">
            Responda algumas questões para começar a ver seu progresso aqui.
          </p>
        )}
      </Section>

      <Section title="Histórico de sessões" icon={History}>
        {data.historico.length > 0 ? (
          <div className="flex flex-col divide-y divide-border">
            {data.historico.map((h) => {
              const pct =
                h.respondidas > 0
                  ? Math.round((h.acertos / h.respondidas) * 100)
                  : 0;
              return (
                <div
                  key={h.data}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="text-text-secondary">
                    {new Date(h.data + "T00:00:00").toLocaleDateString(
                      "pt-BR",
                      { day: "2-digit", month: "2-digit", year: "numeric" }
                    )}
                  </span>
                  <span className="text-text-tertiary">
                    {h.respondidas} questões · {pct}% de acerto
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-text-tertiary">
            Nenhuma sessão registrada ainda.
          </p>
        )}
      </Section>
    </div>
  );
}
