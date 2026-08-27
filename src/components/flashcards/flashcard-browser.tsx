"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export type Flashcard = {
  id: string;
  questao_id: string;
  area_grande: string;
  frente: string;
  verso: string;
  revisado_em: string | null;
  created_at: string;
};

export function FlashcardBrowser({ flashcards }: { flashcards: Flashcard[] }) {
  const [items, setItems] = useState(flashcards);
  const [filtro, setFiltro] = useState<"pendentes" | "todos">("pendentes");
  const [areaAtiva, setAreaAtiva] = useState<string | null>(null);
  const [viradas, setViradas] = useState<Record<string, boolean>>({});

  const visiveis = items.filter((f) => filtro === "todos" || !f.revisado_em);
  const areas = Array.from(new Set(visiveis.map((f) => f.area_grande)));
  const areaSelecionada =
    areaAtiva && areas.includes(areaAtiva) ? areaAtiva : (areas[0] ?? null);
  const doGrupo = visiveis.filter((f) => f.area_grande === areaSelecionada);

  async function marcarRevisado(id: string) {
    const agora = new Date().toISOString();
    setItems((prev) =>
      prev.map((f) => (f.id === id ? { ...f, revisado_em: agora } : f))
    );
    const supabase = createClient();
    await supabase.from("flashcards").update({ revisado_em: agora }).eq("id", id);
  }

  function toggleVirada(id: string) {
    setViradas((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {(["pendentes", "todos"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            className={cn(
              "rounded-full border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer",
              filtro === f
                ? "border-accent bg-accent/10 text-accent"
                : "border-border-strong text-text-tertiary hover:border-accent hover:text-accent"
            )}
          >
            {f === "pendentes" ? "Pendentes" : "Todos"}
          </button>
        ))}
      </div>

      {visiveis.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border-strong p-8 text-center text-sm text-text-tertiary">
          Nenhum flashcard pendente — revisou tudo!
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            {areas.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAreaAtiva(a)}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-mono text-xs transition-colors cursor-pointer",
                  a === areaSelecionada
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border-strong text-text-tertiary hover:border-accent hover:text-accent"
                )}
              >
                {a} · {visiveis.filter((f) => f.area_grande === a).length}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {doGrupo.map((f) => {
              const virada = !!viradas[f.id];
              return (
                <div
                  key={f.id}
                  className="rounded-2xl border border-border bg-bg-elevated p-5"
                >
                  <button
                    type="button"
                    onClick={() => toggleVirada(f.id)}
                    className="w-full cursor-pointer text-left"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                      {virada ? "Resposta" : "Pergunta"}
                    </span>
                    <p className="mt-2 text-sm leading-relaxed text-text-primary">
                      {virada ? f.verso : f.frente}
                    </p>
                  </button>
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleVirada(f.id)}
                      className="flex items-center gap-1.5 text-xs text-text-tertiary transition-colors hover:text-accent cursor-pointer"
                    >
                      <RotateCcw size={13} /> Virar
                    </button>
                    {!f.revisado_em && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => marcarRevisado(f.id)}
                      >
                        <Check size={13} /> Revisei
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
