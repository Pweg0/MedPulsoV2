"use client";

import { motion, type Variants } from "framer-motion";
import { BookOpenCheck, ShieldCheck, LineChart, Brain } from "lucide-react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

function Card({
  className,
  icon: Icon,
  title,
  desc,
  index,
  children,
}: {
  className?: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  index: number;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={cardVariants}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-bg-elevated p-7",
        className
      )}
    >
      <div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Icon size={20} strokeWidth={2} />
        </div>
        <h3 className="mt-5 font-display text-xl text-text-primary">
          {title}
        </h3>
        <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-text-secondary">
          {desc}
        </p>
      </div>
      {children}
    </motion.div>
  );
}

export function Features() {
  return (
    <section id="recursos" className="py-24">
      <Container>
        <div className="max-w-xl">
          <span className="font-mono text-xs uppercase tracking-wider text-accent">
            Recursos
          </span>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-text-primary">
            Tudo que sustenta uma aprovação, num só lugar.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          <Card
            index={0}
            icon={BookOpenCheck}
            title="Banco de questões comentadas"
            desc="Milhares de questões reais de provas anteriores, com explicação de cada alternativa — não só a correta."
            className="md:col-span-2"
          >
            <div className="mt-6 rounded-2xl border border-border bg-bg-inset p-4">
              <p className="text-xs leading-relaxed text-text-secondary">
                <span className="font-mono text-accent">C)</span> Incorreta —
                a conduta preconizada pelo protocolo do MS para sepse é a
                administração de antibiótico em até 1 hora, não 3 horas...
              </p>
            </div>
          </Card>

          <Card
            index={1}
            icon={Brain}
            title="Trilha de estudo com IA"
            desc="A cada resposta, a IA recalcula o que priorizar — por área e pelo tempo que você tem disponível, em dias ou horas."
          />

          <Card
            index={2}
            icon={ShieldCheck}
            title="Base no Ministério da Saúde"
            desc="Explicações fundamentadas em diretrizes, protocolos e cadernos de atenção básica oficiais e atualizados."
          />

          <Card
            index={3}
            icon={LineChart}
            title="Dashboard de desempenho"
            desc="Gráficos detalhados por área, evolução ao longo do tempo e comparação entre tentativas — seu progresso, medido."
            className="md:col-span-2"
          >
            <div className="mt-6 flex items-end gap-2">
              {[38, 61, 54, 76, 82, 45, 69].map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-md bg-accent/20 group-hover:bg-accent/30 transition-colors"
                  style={{ height: `${v}px` }}
                />
              ))}
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
