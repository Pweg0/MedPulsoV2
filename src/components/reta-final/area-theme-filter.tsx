"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

type Tema = {
  id: string;
  nome: string;
  area_grande: string;
  prevalencia: number;
};

export function AreaThemeFilter({ areas, temas }: { areas: string[]; temas: Tema[] }) {
  const [areasSelecionadas, setAreasSelecionadas] = useState<string[]>([]);
  const [temasSelecionados, setTemasSelecionados] = useState<string[]>([]);

  function alternarArea(area: string, marcada: boolean) {
    const idsDaArea = temas.filter((tema) => tema.area_grande === area).map((tema) => tema.id);
    setAreasSelecionadas((atuais) => marcada ? [...atuais, area] : atuais.filter((atual) => atual !== area));
    setTemasSelecionados((atuais) => marcada
      ? [...new Set([...atuais, ...idsDaArea])]
      : atuais.filter((id) => !idsDaArea.includes(id))
    );
  }

  return (
    <details className="relative w-full sm:w-auto">
      <summary className="flex cursor-pointer list-none items-center justify-center gap-1.5 rounded-lg border border-border-strong bg-bg-elevated px-3 py-2 text-text-secondary sm:justify-start">
        <Menu size={14} /> áreas e temas
      </summary>
      <div className="absolute left-0 z-10 mt-2 max-h-[60vh] w-[min(92vw,420px)] overflow-y-auto rounded-2xl border border-border bg-bg-elevated p-3 shadow-xl sm:left-auto sm:right-0">
        <p className="mb-3 text-[11px] text-text-tertiary">Marcar uma área seleciona automaticamente todos os seus subtemas. Sem seleção, todas as áreas entram.</p>
        {areas.map((area) => {
          const areaMarcada = areasSelecionadas.includes(area);
          return (
            <div key={area} className="flex items-start gap-2 border-b border-border py-2 last:border-0">
              <input
                className="mt-1"
                type="checkbox"
                name="area"
                value={area}
                checked={areaMarcada}
                onChange={(event) => alternarArea(area, event.target.checked)}
              />
              <details className="min-w-0 flex-1">
                <summary className="cursor-pointer text-sm font-medium text-text-primary">
                  {area}
                </summary>
                <div className="mt-2 grid gap-1 pl-2">
                  {temas.filter((tema) => tema.area_grande === area).map((tema) => (
                    <label key={tema.id} className="flex items-start gap-2 text-xs text-text-secondary">
                      <input
                        type="checkbox"
                        name="tema"
                        value={tema.id}
                        checked={temasSelecionados.includes(tema.id)}
                        disabled={areaMarcada}
                        onChange={(event) => setTemasSelecionados((atuais) => event.target.checked
                          ? [...atuais, tema.id]
                          : atuais.filter((id) => id !== tema.id)
                        )}
                      />
                      <span>{tema.nome} <span className="font-mono text-[10px] text-accent">{Math.round(Number(tema.prevalencia))}%</span></span>
                    </label>
                  ))}
                </div>
              </details>
            </div>
          );
        })}
      </div>
    </details>
  );
}
