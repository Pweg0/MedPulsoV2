"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";

const steps = [
  {
    n: "01",
    title: "Resolva questões reais",
    desc: "Comece pelo banco de questões de provas anteriores, organizadas por área e por banca.",
  },
  {
    n: "02",
    title: "Veja seu diagnóstico",
    desc: "O dashboard mostra exatamente onde está seu déficit, área por área, em tempo real.",
  },
  {
    n: "03",
    title: "Receba sua trilha",
    desc: "A IA monta um plano de revisão com base no seu tempo disponível — por dias ou por horas.",
  },
  {
    n: "04",
    title: "Revise e evolua",
    desc: "A cada resposta nova, a trilha se ajusta. Seu esforço vai sempre para onde mais importa.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative py-24">
      <Container>
        <div className="max-w-xl">
          <span className="font-mono text-xs uppercase tracking-wider text-accent">
            Como funciona
          </span>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-text-primary">
            Do primeiro erro à sua aprovação.
          </h2>
        </div>

        <div className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-border lg:block" />
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="relative"
            >
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-border-strong bg-bg font-mono text-sm text-accent">
                {s.n}
              </div>
              <h3 className="mt-5 font-display text-lg text-text-primary">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
