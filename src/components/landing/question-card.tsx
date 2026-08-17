"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Shuffle, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMounted } from "@/lib/use-mounted";
import { practiceQuestions, type PracticeQuestion } from "@/lib/questions";

function pickRandom(excludeId?: string): PracticeQuestion {
  const pool = excludeId
    ? practiceQuestions.filter((q) => q.id !== excludeId)
    : practiceQuestions;
  return pool[Math.floor(Math.random() * pool.length)];
}

const letters = ["A", "B", "C", "D", "E"];

export function QuestionCard({ className }: { className?: string }) {
  const mounted = useMounted();
  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  if (mounted && !question) {
    setQuestion(pickRandom());
  }

  function handleShuffle() {
    setSelected(null);
    setQuestion((prev) => pickRandom(prev?.id));
  }

  const answered = selected !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: -1.5 }}
      animate={{ opacity: 1, y: 0, rotate: -1.5 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "w-full rounded-3xl border border-border bg-bg-elevated p-6 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.35)]",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
          Experimente agora
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-vital">
          <span className="h-1.5 w-1.5 rounded-full bg-vital animate-pulse" />
          questão nova
        </span>
      </div>

      <AnimatePresence mode="wait">
        {question && (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <span className="mt-4 inline-block rounded-full border border-border-strong bg-bg-inset px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-text-secondary">
              {question.area}
            </span>

            <p className="mt-4 text-[15px] leading-relaxed text-text-primary">
              {question.statement}
            </p>

            <div className="mt-5 flex flex-col gap-2">
              {question.alternatives.map((alt, i) => {
                const isCorrect = i === question.correctIndex;
                const isSelected = i === selected;

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={answered}
                    onClick={() => setSelected(i)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors",
                      !answered &&
                        "border-border-strong hover:border-accent cursor-pointer",
                      answered &&
                        !isCorrect &&
                        !isSelected &&
                        "border-border opacity-50",
                      answered &&
                        isCorrect &&
                        "border-vital-500 bg-vital-500/10",
                      answered &&
                        isSelected &&
                        !isCorrect &&
                        "border-coral-500 bg-coral-500/10"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs",
                        answered && isCorrect
                          ? "border-vital-500 bg-vital-500 text-on-accent"
                          : answered && isSelected
                            ? "border-coral-500 bg-coral-500 text-on-accent"
                            : "border-border-strong text-text-tertiary"
                      )}
                    >
                      {answered && isCorrect ? (
                        <Check size={13} />
                      ) : answered && isSelected ? (
                        <X size={13} />
                      ) : (
                        letters[i]
                      )}
                    </span>
                    <span className="text-text-secondary">{alt}</span>
                  </button>
                );
              })}
            </div>

            {answered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 rounded-2xl border border-vital-500/30 bg-vital-500/10 p-3.5">
                  <p className="text-sm leading-relaxed text-text-secondary">
                    <span className="font-semibold text-text-primary">
                      Gabarito: {letters[question.correctIndex]} —
                    </span>{" "}
                    {question.explanation}
                  </p>
                </div>

                <div className="mt-3 flex flex-col items-start gap-2.5 rounded-2xl border border-dashed border-border-strong p-4">
                  <p className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary">
                    <Lock size={14} className="mt-0.5 shrink-0 text-accent" />
                    Crie sua conta para ver a explicação completa de cada
                    alternativa.
                  </p>
                  <Button href="/cadastro" size="sm" className="w-full">
                    Criar conta grátis <ArrowRight size={15} />
                  </Button>
                </div>
              </motion.div>
            )}

            <button
              type="button"
              onClick={handleShuffle}
              className="mt-4 flex items-center gap-1.5 text-xs font-medium text-text-tertiary transition-colors hover:text-accent cursor-pointer"
            >
              <Shuffle size={13} />
              Tentar outra questão
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
