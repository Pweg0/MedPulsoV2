"use client";

import { useState, type ChangeEvent } from "react";
import { Loader2, ImagePlus, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormattedText } from "@/components/practice/formatted-text";
import { cn } from "@/lib/utils";
import type { SimuladoQuestao } from "@/lib/supabase/simulados";

export function ImagensManager({ questoes }: { questoes: SimuladoQuestao[] }) {
  const [itens, setItens] = useState(questoes);
  const [carregandoId, setCarregandoId] = useState<string | null>(null);
  const [erroId, setErroId] = useState<Record<string, string>>({});

  async function enviar(questaoId: string, file: File) {
    setCarregandoId(questaoId);
    setErroId((prev) => ({ ...prev, [questaoId]: "" }));

    try {
      const form = new FormData();
      form.append("imagem", file);
      const res = await fetch(`/api/simulados/questoes/${questaoId}/imagem`, {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || "Falha ao enviar imagem.");

      setItens((prev) =>
        prev.map((q) =>
          q.id === questaoId ? { ...q, imagem_url: json.imagemUrl, tem_figura: true } : q
        )
      );
    } catch (e) {
      setErroId((prev) => ({
        ...prev,
        [questaoId]: e instanceof Error ? e.message : "Falha ao enviar imagem.",
      }));
    } finally {
      setCarregandoId(null);
    }
  }

  async function remover(questaoId: string) {
    setCarregandoId(questaoId);
    try {
      const res = await fetch(`/api/simulados/questoes/${questaoId}/imagem`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Falha ao remover imagem.");
      setItens((prev) =>
        prev.map((q) => (q.id === questaoId ? { ...q, imagem_url: null } : q))
      );
    } catch (e) {
      setErroId((prev) => ({
        ...prev,
        [questaoId]: e instanceof Error ? e.message : "Falha ao remover imagem.",
      }));
    } finally {
      setCarregandoId(null);
    }
  }

  function onFileChange(questaoId: string, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) enviar(questaoId, file);
  }

  const ordenadas = [...itens].sort((a, b) => {
    if (a.tem_figura !== b.tem_figura) return a.tem_figura ? -1 : 1;
    return a.numero - b.numero;
  });

  return (
    <div className="mt-8 flex flex-col gap-4">
      {ordenadas.map((q) => (
        <div
          key={q.id}
          className={cn(
            "rounded-2xl border p-4",
            q.tem_figura && !q.imagem_url
              ? "border-amber-500/40 bg-amber-500/5"
              : "border-border bg-bg-elevated"
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-xs text-text-tertiary">
              Questão {q.numero}
            </span>
            {q.tem_figura && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-500">
                <TriangleAlert size={11} /> Figura
              </span>
            )}
          </div>

          <FormattedText
            text={q.enunciado}
            className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-secondary"
          />

          {q.imagem_url && (
            <div className="relative mt-3 h-48 w-full overflow-hidden rounded-xl border border-border-strong bg-bg-inset">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={q.imagem_url}
                alt={`Figura da questão ${q.numero}`}
                className="h-full w-full object-contain"
              />
            </div>
          )}

          {erroId[q.id] && (
            <p className="mt-2 text-xs text-coral-500">{erroId[q.id]}</p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                disabled={carregandoId === q.id}
                onChange={(e) => onFileChange(q.id, e)}
              />
              <span
                className={cn(
                  "inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-border-strong bg-bg-inset px-4 text-sm text-text-primary transition-colors hover:border-accent hover:text-accent",
                  carregandoId === q.id && "pointer-events-none opacity-50"
                )}
              >
                {carregandoId === q.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ImagePlus size={14} />
                )}
                {q.imagem_url ? "Substituir imagem" : "Adicionar imagem"}
              </span>
            </label>

            {q.imagem_url && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={carregandoId === q.id}
                onClick={() => remover(q.id)}
              >
                <Trash2 size={14} /> Remover
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
