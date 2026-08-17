"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { PulseLine } from "@/components/pulse-line";

export function FinalCta() {
  return (
    <section className="py-24">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-ink-900 px-8 py-16 text-center sm:px-16 dark:bg-bg-inset"
          style={{ backgroundColor: "var(--ink-900)" }}
        >
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 text-coral-500/25">
            <PulseLine strokeWidth={2} />
          </div>
          <h2 className="relative mx-auto max-w-2xl font-display text-4xl leading-tight tracking-tight text-white sm:text-5xl">
            Sua próxima prova pode ser a aprovação.
          </h2>
          <p className="relative mx-auto mt-5 max-w-md text-base text-white/70">
            7 dias grátis, sem cartão de crédito. Comece agora e veja onde
            está o seu déficit real.
          </p>
          <div className="relative mt-9 flex justify-center">
            <Button href="/cadastro" size="lg">
              Começar grátis por 7 dias
              <ArrowRight size={18} />
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
