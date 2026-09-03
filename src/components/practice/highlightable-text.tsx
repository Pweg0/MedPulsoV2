"use client";

import { useEffect, useRef, useState } from "react";
import { Undo2 } from "lucide-react";
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

export function HighlightableText({ text, className, storageKey }: { text: string; className?: string; storageKey: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [corAtiva, setCorAtiva] = useState("yellow");
  const key = `mp_reta_final_highlights_${storageKey}`;

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

  function desfazer() {
    const atual = JSON.parse(localStorage.getItem(key) || "[]") as { text: string; color: string }[];
    atual.pop();
    localStorage.setItem(key, JSON.stringify(atual));
    const css = CSS as CSSWithHighlights;
    for (const cor of CORES) css.highlights?.delete(`mp-${cor.id}`);
    const root = rootRef.current;
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (const salvo of atual) {
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
    const novoRange = selecao.getRangeAt(0).cloneRange();
    const texto = selecao.toString().trim();
    if (!texto) return;
    pintar(novoRange, corAtiva);
    salvar(novoRange, corAtiva);
    window.getSelection()?.removeAllRanges();
  }

  return (
    <div ref={rootRef} onMouseUp={capturarSelecao} onKeyUp={capturarSelecao}>
      <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-lg border border-border-strong bg-bg-inset p-2 text-[11px]">
        <span className="mr-1 text-text-tertiary">Marca-texto:</span>
        {CORES.map((cor) => (
          <button
            key={cor.id}
            type="button"
            title={`Selecionar cor ${cor.label}`}
            aria-label={`Selecionar cor ${cor.label}`}
            aria-pressed={corAtiva === cor.id}
            onClick={() => setCorAtiva(cor.id)}
            className={`h-5 w-5 rounded-full border border-black/10 ${cor.className} ${corAtiva === cor.id ? "ring-2 ring-accent ring-offset-1" : ""}`}
          />
        ))}
        <button
          type="button"
          title="Desfazer último destaque"
          aria-label="Desfazer último destaque"
          onClick={desfazer}
          className="ml-1 flex h-6 w-6 items-center justify-center rounded-md text-text-tertiary hover:bg-bg hover:text-accent"
        >
          <Undo2 size={14} />
        </button>
        <span className="ml-1 text-text-tertiary">selecione o texto para marcar</span>
      </div>
      <FormattedText text={text} className={className} formatAssertivas />
    </div>
  );
}
