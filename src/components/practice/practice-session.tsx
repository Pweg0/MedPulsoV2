"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowRight, Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { useMounted } from "@/lib/use-mounted";
import { FormattedText, decodeEntities } from "@/components/practice/formatted-text";
import type { Questao, Alternativa } from "@/lib/supabase/questoes";
import type { ExplicacaoIA } from "@/lib/gemini";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function altExplicacao(alt: Alternativa, ai?: ExplicacaoIA) {
  if (ai) {
    return alt.correta
      ? ai.por_que_correta
      : ai.refutacoes.find((r) => r.letra === alt.letra)?.erro || alt.explicacao;
  }
  return alt.explicacao;
}

function montarResumo(ai: ExplicacaoIA) {
  const partes: string[] = [];
  if (ai.pegadinha) partes.push(ai.pegadinha);
  if (ai.nota_de_atualizacao) partes.push(`Atualização: ${ai.nota_de_atualizacao}`);
  return partes.join("\n\n");
}

export function PracticeSession({ questoes }: { questoes: Questao[] }) {
  const { user } = useAuth();
  const mounted = useMounted();
  const [order] = useState(() => shuffle(questoes));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [aiExplicacoes, setAiExplicacoes] = useState<Record<string, ExplicacaoIA>>({});
  const [explicando, setExplicando] = useState(false);
  const [aiErro, setAiErro] = useState<string | null>(null);

  const questao = order[index % order.length];
  const answered = selected !== null;
  const ai = aiExplicacoes[questao.id];
  const temExplicacao =
    !!ai || questao.alternativas.some((a) => a.explicacao?.trim());
  const resumoTexto = ai ? montarResumo(ai) : questao.comentario_geral;

  async function handleSelect(letra: string) {
    if (answered) return;
    setSelected(letra);
    setAiErro(null);

    const alt = questao.alternativas.find((a) => a.letra === letra);
    const acertou = alt?.correta ?? false;
    setAnsweredCount((c) => c + 1);
    if (acertou) setCorrectCount((c) => c + 1);

    if (user) {
      setSaving(true);
      const supabase = createClient();
      await supabase.from("tentativas").insert({
        user_id: user.id,
        questao_id: questao.id,
        resposta_letra: letra,
        acertou,
      });
      setSaving(false);
    }
  }

  async function handleGerarExplicacao() {
    setExplicando(true);
    setAiErro(null);
    try {
      const res = await fetch("/api/explicar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questaoId: questao.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || "Falha ao gerar explicação.");
      setAiExplicacoes((prev) => ({ ...prev, [questao.id]: json.explicacao }));
    } catch (e) {
      setAiErro(e instanceof Error ? e.message : "Falha ao gerar explicação.");
    } finally {
      setExplicando(false);
    }
  }

  function handleNext() {
    setSelected(null);
    setAiErro(null);
    setIndex((i) => i + 1);
  }

  if (!mounted) {
    return (
      <div className="animate-pulse rounded-3xl border border-border bg-bg-elevated p-6 sm:p-8">
        <div className="h-5 w-32 rounded-full bg-bg-inset" />
        <div className="mt-6 h-16 rounded-lg bg-bg-inset" />
        <div className="mt-6 flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-bg-inset" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <span className="font-mono text-xs text-text-tertiary">
          {answeredCount} respondida{answeredCount === 1 ? "" : "s"} nesta
          sessão
          {answeredCount > 0 && ` · ${Math.round((correctCount / answeredCount) * 100)}% de acerto`}
        </span>
        {saving && (
          <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <Loader2 size={12} className="animate-spin" /> salvando
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={questao.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl border border-border bg-bg-elevated p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-center gap-2">
            {questao.disciplina && (
              <span className="rounded-full border border-border-strong bg-bg-inset px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-text-secondary">
                {questao.disciplina}
              </span>
            )}
            {questao.instituicao && (
              <span className="rounded-full border border-border-strong bg-bg-inset px-3 py-1 font-mono text-[11px] text-text-tertiary">
                {questao.instituicao}
                {questao.ano ? ` · ${questao.ano}` : ""}
              </span>
            )}
          </div>

          <FormattedText
            text={questao.enunciado}
            className="mt-5 text-base leading-relaxed text-text-primary"
          />

          <div className="mt-6 flex flex-col gap-3">
            {questao.alternativas.map((alt) => {
              const isSelected = alt.letra === selected;
              const showState = answered;
              const explicacaoTexto = altExplicacao(alt, ai);

              return (
                <div key={alt.letra}>
                  <button
                    type="button"
                    disabled={answered}
                    onClick={() => handleSelect(alt.letra)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border p-4 text-left text-sm transition-colors",
                      !answered &&
                        "border-border-strong hover:border-accent cursor-pointer",
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
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <FormattedText
                        text={explicacaoTexto}
                        className="ml-9 mt-2 text-xs leading-relaxed text-text-tertiary"
                      />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {answered && !temExplicacao && (
            <div className="mt-5 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border-strong p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-xs text-text-tertiary">
                <Sparkles size={14} className="text-accent" />
                Essa questão ainda não tem explicação.
              </p>
              <Button
                onClick={handleGerarExplicacao}
                disabled={explicando}
                size="sm"
                variant="secondary"
              >
                {explicando ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                Gerar explicação com IA
              </Button>
            </div>
          )}

          {aiErro && (
            <p className="mt-3 text-xs text-coral-500">{aiErro}</p>
          )}

          {answered && ai?.discordo_do_gabarito && (
            <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
              <TriangleAlert size={16} className="mt-0.5 shrink-0 text-amber-500" />
              <p className="text-sm leading-relaxed text-text-secondary">
                <span className="font-semibold text-text-primary">
                  A IA discorda do gabarito:
                </span>{" "}
                {ai.motivo_discordancia || "questão possivelmente ambígua ou desatualizada."}
              </p>
            </div>
          )}

          {answered && resumoTexto && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-5 overflow-hidden rounded-2xl border border-accent/30 bg-accent/10 p-4"
            >
              <p className="text-sm font-semibold text-text-primary">Resumo</p>
              <FormattedText
                text={resumoTexto}
                className="mt-1.5 text-sm leading-relaxed text-text-secondary"
              />
            </motion.div>
          )}

          {answered && (
            <Button onClick={handleNext} className="mt-6 w-full" size="lg">
              Próxima questão <ArrowRight size={18} />
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
