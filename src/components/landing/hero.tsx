"use client";

import { motion } from "framer-motion";
import { ArrowRight, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PulseLine } from "@/components/pulse-line";
import { QuestionCard } from "@/components/landing/question-card";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-24 h-40 text-accent/[0.14] dark:text-accent/[0.18]">
        <PulseLine strokeWidth={2} />
      </div>
      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-accent/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-40 top-60 h-96 w-96 rounded-full bg-vital-500/10 blur-[110px]" />

      <Container className="relative grid gap-16 pb-24 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pb-32 lg:pt-24">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-bg-inset px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-text-secondary"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Residência médica em todo o Brasil · Revalida
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="mt-6 font-display text-[2.75rem] leading-[1.05] tracking-tight text-text-primary sm:text-6xl"
          >
            Pare de estudar tudo.
            <br />
            Comece a estudar{" "}
            <span className="italic text-accent">o que falta.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary"
          >
            O MedPulso.ia cruza seu desempenho em milhares de questões de
            provas anteriores e monta sua trilha de revisão — com
            explicação de cada alternativa baseada nas diretrizes do
            Ministério da Saúde.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Button href="/cadastro" size="lg">
              Começar grátis por 7 dias
              <ArrowRight size={18} />
            </Button>
            <Button href="#como-funciona" variant="outline" size="lg">
              Ver como funciona
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-tertiary"
          >
            <span className="flex items-center gap-1.5">
              <CircleCheck size={15} className="text-vital" /> Sem cartão de
              crédito
            </span>
            <span className="flex items-center gap-1.5">
              <CircleCheck size={15} className="text-vital" /> Cancele quando
              quiser
            </span>
          </motion.div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <QuestionCard className="max-w-md" />
        </div>
      </Container>
    </section>
  );
}
