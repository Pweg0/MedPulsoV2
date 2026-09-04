"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  TriangleAlert,
  Flag,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { useMounted } from "@/lib/use-mounted";
import { FormattedText, decodeEntities } from "@/components/practice/formatted-text";
import type { Simulado, SimuladoQuestao } from "@/lib/supabase/simulados";
import type { ExplicacaoIA } from "@/lib/gemini";

function formatarTempo(segundos: number) {
  const m = Math.floor(segundos / 60)
    .toString()
    .padStart(2, "0");
  const s = (segundos % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function SimuladoSession({
  simulado,
  questoes,
  respostasSalvas,
  jaFinalizado,
}: {
  simulado: Simulado;
  questoes: SimuladoQuestao[];
  respostasSalvas: Record<string, string>;
  jaFinalizado: boolean;
}) {
  const { user } = useAuth();
  const mounted = useMounted();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(respostasSalvas);
  const [finalizado, setFinalizado] = useState(jaFinalizado);
  const [confirmando, setConfirmando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [segundos, setSegundos] = useState(0);
  const [aiExplicacoes, setAiExplicacoes] = useState<Record<string, ExplicacaoIA>>(
    () => {
      const cache: Record<string, ExplicacaoIA> = {};
      for (const q of questoes) {
        if (q.explicacao_ia) cache[q.id] = q.explicacao_ia as ExplicacaoIA;
      }
      return cache;
    }
  );
  const [explicandoId, setExplicandoId] = useState<string | null>(null);

  useEffect(() => {
    if (finalizado) return;
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [finalizado]);

  const questao = questoes[index];
  const selecionada = answers[questao.id] ?? null;
  const respondidas = Object.keys(answers).length;

  const validas = questoes.filter((q) => !q.anulada);
  const acertos = validas.filter((q) => {
    const alt = q.alternativas.find((a) => a.letra === answers[q.id]);
    return alt?.correta;
  }).length;
  const pctAcerto = validas.length > 0 ? Math.round((acertos / validas.length) * 100) : 0;

  function selecionar(letra: string) {
    if (finalizado) return;
    setAnswers((prev) => ({ ...prev, [questao.id]: letra }));
  }

  async function finalizar() {
    if (!user) return;
    setSalvando(true);
    setErro(null);

    const rows = Object.entries(answers).map(([simulado_questao_id, resposta_letra]) => {
      const q = questoes.find((qq) => qq.id === simulado_questao_id)!;
      const alt = q.alternativas.find((a) => a.letra === resposta_letra);
      return {
        user_id: user.id,
        simulado_id: simulado.id,
        simulado_questao_id,
        resposta_letra,
        acertou: !!alt?.correta,
      };
    });

    const supabase = createClient();
    const { error } = await supabase
      .from("simulado_tentativas")
      .upsert(rows, { onConflict: "user_id,simulado_questao_id" });

    setSalvando(false);
    if (error) {
      setErro(error.message);
      return;
    }
    setFinalizado(true);
    setIndex(0);
  }

  async function gerarExplicacao(q: SimuladoQuestao) {
    setExplicandoId(q.id);
    setErro(null);
    try {
      const res = await fetch("/api/explicar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questaoId: q.id, fonte: "simulado" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || "Falha ao gerar explicação.");
      setAiExplicacoes((prev) => ({ ...prev, [q.id]: json.explicacao }));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao gerar explicação.");
    } finally {
      setExplicandoId(null);
    }
  }

  if (!mounted) {
    return (
      <div className="mt-6 animate-pulse rounded-3xl border border-border bg-bg-elevated p-6 sm:p-8">
        <div className="h-5 w-32 rounded-full bg-bg-inset" />
        <div className="mt-6 h-16 rounded-lg bg-bg-inset" />
      </div>
    );
  }

  const ai = aiExplicacoes[questao.id];

  return (
    <div className="mt-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-text-primary">{simulado.nome}</h1>
          <p className="font-mono text-xs text-text-tertiary">
            {respondidas}/{questoes.length} respondidas
            {finalizado && ` · ${acertos}/${validas.length} certas (${pctAcerto}%)`}
          </p>
        </div>
        {!finalizado && (
          <span className="flex items-center gap-1.5 rounded-full border border-border-strong bg-bg-inset px-3 py-1.5 font-mono text-xs text-text-secondary">
            <Clock size={13} /> {formatarTempo(segundos)}
          </span>
        )}
      </div>

      {/* palette */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        {questoes.map((q, i) => {
          const respondida = !!answers[q.id];
          const correta = finalizado
            ? q.alternativas.find((a) => a.letra === answers[q.id])?.correta
            : null;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg font-mono text-[11px] transition-colors",
                i === index && "ring-2 ring-accent",
                finalizado
                  ? correta
                    ? "bg-vital-500/20 text-vital-500"
                    : respondida
                      ? "bg-coral-500/20 text-coral-500"
                      : "bg-bg-inset text-text-tertiary"
                  : respondida
                    ? "bg-accent/15 text-accent"
                    : "bg-bg-inset text-text-tertiary hover:bg-bg-inset/70"
              )}
            >
              {q.numero}
            </button>
          );
        })}
      </div>

      <div className="flex items-stretch gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setIndex((i) => (i - 1 + questoes.length) % questoes.length)}
          aria-label="Questão anterior"
          className="flex h-9 w-9 shrink-0 self-center items-center justify-center rounded-full border border-border-strong bg-bg-elevated text-text-tertiary transition-colors hover:border-accent hover:text-accent sm:h-10 sm:w-10"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={questao.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
                className="rounded-3xl border border-border bg-bg-elevated p-4 sm:p-8"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-text-tertiary">
                  Questão {questao.numero}
                </span>
                {questao.anulada && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-500">
                    <Flag size={11} /> Anulada
                  </span>
                )}
              </div>

              <FormattedText
                text={questao.enunciado}
                className="mt-4 text-base leading-relaxed text-text-primary"
              />

              {questao.imagem_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={questao.imagem_url}
                  alt={`Figura da questão ${questao.numero}`}
                  className="mt-4 max-h-96 w-full rounded-xl border border-border-strong object-contain"
                />
              )}

              <div className="mt-6 flex flex-col gap-3">
                {questao.alternativas.map((alt) => {
                  const isSelected = alt.letra === selecionada;
                  const showState = finalizado;
                  const refutacao = ai?.refutacoes.find((r) => r.letra === alt.letra);
                  const explicacaoTexto = ai
                    ? alt.correta
                      ? ai.por_que_correta
                      : refutacao?.erro
                    : alt.explicacao;

                  return (
                    <div key={alt.letra}>
                      <button
                        type="button"
                        disabled={finalizado}
                        onClick={() => selecionar(alt.letra)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl border p-4 text-left text-sm transition-colors",
                          !finalizado &&
                            (isSelected
                              ? "border-accent bg-accent/10"
                              : "border-border-strong hover:border-accent cursor-pointer"),
                          showState &&
                            !alt.correta &&
                            !isSelected &&
                            "border-border opacity-50",
                          showState && alt.correta && "border-vital-500 bg-vital-500/10",
                          showState &&
                            isSelected &&
                            !alt.correta &&
                            "border-coral-500 bg-coral-500/10"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs",
                            showState && alt.correta
                              ? "border-vital-500 bg-vital-500 text-on-accent"
                              : showState && isSelected
                                ? "border-coral-500 bg-coral-500 text-on-accent"
                                : isSelected
                                  ? "border-accent bg-accent text-on-accent"
                                  : "border-border-strong text-text-tertiary"
                          )}
                        >
                          {showState && alt.correta ? (
                            <Check size={13} />
                          ) : showState && isSelected ? (
                            <X size={13} />
                          ) : (
                            alt.letra
                          )}
                        </span>
                        <span className="text-text-secondary">
                          {decodeEntities(alt.texto)}
                        </span>
                      </button>

                      {showState && explicacaoTexto && (isSelected || alt.correta) && (
                        <div
                          className={cn(
                            "mt-2 rounded-xl px-4 py-3",
                            alt.correta ? "bg-vital-500/10" : "bg-coral-500/10"
                          )}
                        >
                          <FormattedText
                            text={explicacaoTexto}
                            className="text-xs leading-relaxed text-text-secondary"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {finalizado && !ai && !questao.anulada && (
                <div className="mt-5 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border-strong p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-2 text-xs text-text-tertiary">
                    <Sparkles size={14} className="text-accent" />
                    Essa questão ainda não tem explicação.
                  </p>
                  <Button
                    onClick={() => gerarExplicacao(questao)}
                    disabled={explicandoId === questao.id}
                    size="sm"
                    variant="secondary"
                  >
                    {explicandoId === questao.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    Gerar explicação com IA
                  </Button>
                </div>
              )}

              {finalizado && ai?.revisao_do_tema && (
                <div className="mt-5 rounded-xl border border-border-strong bg-bg-inset p-4">
                  <h4 className="font-mono text-[11px] uppercase tracking-wider text-accent">
                    Revisão do tema — {ai.tema}
                  </h4>
                  <FormattedText
                    text={ai.revisao_do_tema}
                    className="mt-2 text-sm leading-relaxed text-text-secondary"
                  />
                </div>
              )}

              {finalizado && ai?.discordo_do_gabarito && (
                <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <TriangleAlert size={16} className="mt-0.5 shrink-0 text-amber-500" />
                  <p className="text-sm leading-relaxed text-text-secondary">
                    <span className="font-semibold text-text-primary">
                      Gabarito contestado pela IA:
                    </span>{" "}
                    {ai.motivo_discordancia || "questão possivelmente ambígua ou desatualizada."}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % questoes.length)}
          aria-label="Próxima questão"
          className="flex h-9 w-9 shrink-0 self-center items-center justify-center rounded-full border border-border-strong bg-bg-elevated text-text-tertiary transition-colors hover:border-accent hover:text-accent sm:h-10 sm:w-10"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {erro && <p className="mt-4 text-sm text-coral-500">{erro}</p>}

      {!finalizado && (
        <div className="mt-6 flex justify-end">
          {confirmando ? (
            <div className="flex items-center gap-3">
              <p className="text-xs text-text-tertiary">
                {respondidas < questoes.length
                  ? `${questoes.length - respondidas} questões em branco. `
                  : ""}
                Confirma finalizar?
              </p>
              <Button variant="secondary" size="sm" onClick={() => setConfirmando(false)}>
                Voltar
              </Button>
              <Button size="sm" onClick={finalizar} disabled={salvando}>
                {salvando ? <Loader2 size={14} className="animate-spin" /> : "Confirmar"}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setConfirmando(true)}>Finalizar simulado</Button>
          )}
        </div>
      )}
    </div>
  );
}
