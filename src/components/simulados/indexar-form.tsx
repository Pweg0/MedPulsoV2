"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2, CircleCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type Resultado = { simuladoId: string; totalQuestoes: number; semGabarito: number };

export function IndexarForm() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setResultado(null);
    setEnviando(true);

    try {
      const form = new FormData(e.currentTarget);
      const res = await fetch("/api/simulados/indexar", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || "Falha ao indexar a prova.");
      setResultado(json);
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha ao indexar a prova.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <Label htmlFor="nome">Nome do simulado</Label>
        <Input
          id="nome"
          name="nome"
          type="text"
          placeholder="ex: Revalida 2024/1"
          required
          disabled={enviando}
        />
      </div>

      <div>
        <Label htmlFor="prova">PDF da prova (caderno de questões)</Label>
        <Input
          id="prova"
          name="prova"
          type="file"
          accept="application/pdf"
          required
          disabled={enviando}
          className="h-auto py-2.5 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-accent"
        />
      </div>

      <div>
        <Label htmlFor="gabarito">PDF do gabarito definitivo</Label>
        <Input
          id="gabarito"
          name="gabarito"
          type="file"
          accept="application/pdf"
          required
          disabled={enviando}
          className="h-auto py-2.5 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-accent"
        />
      </div>

      {erro && (
        <p className="flex items-start gap-2 rounded-xl border border-coral-500/30 bg-coral-500/10 p-3 text-sm text-text-secondary">
          <TriangleAlert size={15} className="mt-0.5 shrink-0 text-accent" />
          {erro}
        </p>
      )}

      {resultado && (
        <p className="flex items-start gap-2 rounded-xl border border-vital-500/30 bg-vital-500/10 p-3 text-sm text-text-secondary">
          <CircleCheck size={15} className="mt-0.5 shrink-0 text-vital" />
          {resultado.totalQuestoes} questões indexadas.
          {resultado.semGabarito > 0
            ? ` ${resultado.semGabarito} ficaram sem gabarito reconhecido — confira antes de liberar.`
            : ""}
        </p>
      )}

      <Button type="submit" disabled={enviando} size="lg">
        {enviando ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Indexando com IA
            (pode levar um minuto)...
          </>
        ) : (
          <>
            <UploadCloud size={18} /> Indexar prova
          </>
        )}
      </Button>
    </form>
  );
}
