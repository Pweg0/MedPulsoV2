"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { useMounted } from "@/lib/use-mounted";
import type { Questao } from "@/lib/supabase/questoes";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function PracticeSession({ questoes }: { questoes: Questao[] }) {
  const { user } = useAuth();
  const mounted = useMounted();
  const [order, setOrder] = useState(questoes);
  const [shuffled, setShuffled] = useState(false);

  if (mounted && !shuffled) {
    setOrder(shuffle(questoes));
    setShuffled(true);
  }

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const questao = order[index % order.length];
  const answered = selected !== null;

  async function handleSelect(letra: string) {
    if (answered) return;
    setSelected(letra);

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

  function handleNext() {
    setSelected(null);
    setIndex((i) => i + 1);
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

          <p className="mt-5 text-base leading-relaxed text-text-primary">
            {questao.enunciado}
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {questao.alternativas.map((alt) => {
              const isSelected = alt.letra === selected;
              const showState = answered;

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
                    <span className="text-text-secondary">{alt.texto}</span>
                  </button>

                  {showState && alt.explicacao && (isSelected || alt.correta) && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.25 }}
                      className="ml-9 mt-2 overflow-hidden text-xs leading-relaxed text-text-tertiary"
                    >
                      {alt.explicacao}
                    </motion.p>
                  )}
                </div>
              );
            })}
          </div>

          {answered && questao.comentario_geral && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-5 overflow-hidden rounded-2xl border border-accent/30 bg-accent/10 p-4"
            >
              <p className="text-sm leading-relaxed text-text-secondary">
                <span className="font-semibold text-text-primary">
                  Resumo:
                </span>{" "}
                {questao.comentario_geral}
              </p>
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
