"use client";

import { useEffect, useRef, useState } from "react";
import { FormattedText } from "@/components/practice/formatted-text";

const CORES = [
  { id: "yellow", label: "Amarelo", className: "bg-yellow-300" },
  { id: "green", label: "Verde", className: "bg-green-300" },
  { id: "blue", label: "Azul", className: "bg-blue-300" },
  { id: "pink", label: "Rosa", className: "bg-pink-300" },
];

type CSSWithHighlights = typeof CSS & { highlights?: Map<string, unknown> };
type WindowWithHighlight = Window & {
  Highlight?: new (...ranges: Range[]) => unknown;
};

export function HighlightableText({ text, className }: { text: string; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState<Range | null>(null);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const key = `mp_reta_final_highlights_${text.slice(0, 32)}`;

  function pintar(novoRange: Range, cor: string) {
    const css = CSS as CSSWithHighlights;
    const HighlightConstructor = (window as WindowWithHighlight).Highlight;
    if (!css.highlights || !HighlightConstructor) return;
    const nome = `mp-${cor}`;
    const atual = css.highlights.get(nome) as { add?: (r: Range) => void } | undefined;
    if (atual?.add) atual.add(novoRange);
    else css.highlights.set(nome, new HighlightConstructor(novoRange));
  }

  function salvar(novoRange: Range, cor: string) {
    const atual = JSON.parse(localStorage.getItem(key) || "[]") as { text: string; color: string }[];
    atual.push({ text: novoRange.toString(), color: cor });
    localStorage.setItem(key, JSON.stringify(atual.slice(-30)));
  }

  useEffect(() => {
    const styleId = "mp-highlight-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `::highlight(mp-yellow){background-color:#fde68a;color:#17202a}::highlight(mp-green){background-color:#bbf7d0;color:#17202a}::highlight(mp-blue){background-color:#bfdbfe;color:#17202a}::highlight(mp-pink){background-color:#fbcfe8;color:#17202a}`;
      document.head.appendChild(style);
    }
    const css = CSS as CSSWithHighlights;
    if (!css.highlights) return;
    for (const cor of CORES) css.highlights.delete(`mp-${cor.id}`);
    const root = rootRef.current;
    if (!root) return;
    const salvos = JSON.parse(localStorage.getItem(key) || "[]") as { text: string; color: string }[];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (const salvo of salvos) {
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const indice = node.textContent?.indexOf(salvo.text) ?? -1;
        if (indice < 0) continue;
        const novoRange = document.createRange();
        novoRange.setStart(node, indice);
        novoRange.setEnd(node, indice + salvo.text.length);
        pintar(novoRange, salvo.color);
        break;
      }
    }
    return () => {
      for (const cor of CORES) css.highlights?.delete(`mp-${cor.id}`);
    };
  }, [key]);

  function capturarSelecao() {
    const selecao = window.getSelection();
    if (!selecao || selecao.isCollapsed || !rootRef.current || !selecao.anchorNode) return;
    if (!rootRef.current.contains(selecao.anchorNode)) return;
    setRange(selecao.getRangeAt(0).cloneRange());
    setSelecionado(selecao.toString().trim());
  }

  function escolherCor(cor: string) {
    if (!range || !selecionado) return;
    pintar(range, cor);
    salvar(range, cor);
    setRange(null);
    setSelecionado(null);
    window.getSelection()?.removeAllRanges();
  }

  return (
    <div ref={rootRef} onMouseUp={capturarSelecao} onKeyUp={capturarSelecao}>
      {selecionado && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-lg border border-border-strong bg-bg-inset p-2 text-[11px]">
          <span className="mr-1 text-text-tertiary">Marcar:</span>
          {CORES.map((cor) => (
            <button
              key={cor.id}
              type="button"
              title={cor.label}
              aria-label={`Marcar de ${cor.label}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => escolherCor(cor.id)}
              className={`h-5 w-5 rounded-full border border-black/10 ${cor.className}`}
            />
          ))}
        </div>
      )}
      <FormattedText text={text} className={className} />
    </div>
  );
}
