"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

export type FaqItem = { q: string; a: string };

const defaultFaqs: FaqItem[] = [
  {
    q: "Preciso de cartão de crédito para começar o teste grátis?",
    a: "Não. Você usa os 7 dias completos sem informar nenhum dado de pagamento. Só pedimos os dados de cobrança se você decidir continuar depois do teste.",
  },
  {
    q: "As explicações realmente seguem o Ministério da Saúde?",
    a: "Sim. Cada alternativa comentada é fundamentada em diretrizes clínicas, protocolos e cadernos de atenção básica oficiais, revisados periodicamente conforme atualizações do MS.",
  },
  {
    q: "A plataforma serve para ENARE, ENAMED e Revalida ao mesmo tempo?",
    a: "Sim. O banco de questões é organizado por prova e por área, e a trilha de estudo se adapta conforme qual exame você está priorizando.",
  },
  {
    q: "Como a IA decide o que eu devo estudar?",
    a: "Ela cruza seu histórico de respostas por área, o tempo que você tem disponível (em dias ou horas) e a proximidade da sua prova para recalcular prioridades a cada resposta nova.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim, em qualquer plano. O cancelamento é feito direto no seu perfil e vale até o fim do período já pago, sem multa.",
  },
];

export function Faq({
  items = defaultFaqs,
  eyebrow = "Perguntas frequentes",
  title = "Ainda com dúvidas?",
  id = "faq",
}: {
  items?: FaqItem[];
  eyebrow?: string;
  title?: string;
  id?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id={id} className="py-24">
      <Container className="max-w-3xl">
        <div className="text-center">
          <span className="font-mono text-xs uppercase tracking-wider text-accent">
            {eyebrow}
          </span>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-text-primary">
            {title}
          </h2>
        </div>

        <div className="mt-10 flex flex-col divide-y divide-border rounded-3xl border border-border bg-bg-elevated px-6">
          {items.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left cursor-pointer"
                >
                  <span className="font-display text-base text-text-primary sm:text-lg">
                    {f.q}
                  </span>
                  <Plus
                    size={18}
                    className={cn(
                      "shrink-0 text-accent transition-transform duration-300",
                      isOpen && "rotate-45"
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 pr-8 text-sm leading-relaxed text-text-secondary">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
