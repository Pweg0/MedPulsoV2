"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EspecialidadeNode } from "@/lib/supabase/especialidade-tree";

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function filtrarArvore(
  nodes: EspecialidadeNode[],
  termo: string
): EspecialidadeNode[] {
  const termoNorm = normalizar(termo);
  const resultado: EspecialidadeNode[] = [];

  for (const node of nodes) {
    const filhosFiltrados = filtrarArvore(node.filhos, termo);
    const bate = normalizar(node.nome).includes(termoNorm);
    if (bate || filhosFiltrados.length > 0) {
      resultado.push({ ...node, filhos: filhosFiltrados });
    }
  }

  return resultado;
}

function TreeItem({
  node,
  depth,
  selecionados,
  onToggle,
  expandidos,
  onToggleExpand,
  forcarExpandido,
}: {
  node: EspecialidadeNode;
  depth: number;
  selecionados: Set<string>;
  onToggle: (caminho: string) => void;
  expandidos: Set<string>;
  onToggleExpand: (caminho: string) => void;
  forcarExpandido: boolean;
}) {
  const temFilhos = node.filhos.length > 0;
  const selecionado = selecionados.has(node.caminho);
  const expandido = forcarExpandido || expandidos.has(node.caminho);

  return (
    <div>
      <div
        className="flex items-center gap-2 rounded-lg py-1.5 pr-2 hover:bg-bg-inset"
        style={{ paddingLeft: depth * 18 }}
      >
        {temFilhos ? (
          <button
            type="button"
            onClick={() => onToggleExpand(node.caminho)}
            className="flex h-5 w-5 shrink-0 items-center justify-center text-text-tertiary"
          >
            <ChevronRight
              size={13}
              className={cn("transition-transform", expandido && "rotate-90")}
            />
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
        <label className="flex flex-1 min-w-0 cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={selecionado}
            onChange={() => onToggle(node.caminho)}
            className="h-3.5 w-3.5 shrink-0 accent-accent"
          />
          <span className="truncate text-sm text-text-secondary">
            {node.nome}
          </span>
        </label>
        <span className="shrink-0 rounded-full bg-bg-inset px-2 py-0.5 font-mono text-[10px] text-text-tertiary">
          {node.total}
        </span>
      </div>

      {expandido &&
        node.filhos.map((filho) => (
          <TreeItem
            key={filho.caminho}
            node={filho}
            depth={depth + 1}
            selecionados={selecionados}
            onToggle={onToggle}
            expandidos={expandidos}
            onToggleExpand={onToggleExpand}
            forcarExpandido={forcarExpandido}
          />
        ))}
    </div>
  );
}

export function EspecialidadePicker({
  arvore,
  selecionados,
  onToggle,
}: {
  arvore: EspecialidadeNode[];
  selecionados: Set<string>;
  onToggle: (caminho: string) => void;
}) {
  const [busca, setBusca] = useState("");
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

  function toggleExpand(caminho: string) {
    setExpandidos((prev) => {
      const novo = new Set(prev);
      if (novo.has(caminho)) novo.delete(caminho);
      else novo.add(caminho);
      return novo;
    });
  }

  const arvoreExibida = useMemo(
    () => (busca.trim() ? filtrarArvore(arvore, busca.trim()) : arvore),
    [arvore, busca]
  );

  return (
    <div className="rounded-2xl border border-border-strong bg-bg-inset/50 p-4">
      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
        />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar especialidades, temas, subtemas..."
          className="w-full rounded-xl border border-border-strong bg-bg-elevated py-2 pl-9 pr-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent"
        />
      </div>

      <div className="mt-2 max-h-80 overflow-y-auto pr-1">
        {arvoreExibida.length === 0 ? (
          <p className="py-4 text-center text-xs text-text-tertiary">
            Nada encontrado.
          </p>
        ) : (
          arvoreExibida.map((node) => (
            <TreeItem
              key={node.caminho}
              node={node}
              depth={0}
              selecionados={selecionados}
              onToggle={onToggle}
              expandidos={expandidos}
              onToggleExpand={toggleExpand}
              forcarExpandido={!!busca.trim()}
            />
          ))
        )}
      </div>
    </div>
  );
}
