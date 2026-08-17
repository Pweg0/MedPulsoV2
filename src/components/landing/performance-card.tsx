"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const areas = [
  { label: "Cardiologia", value: 82 },
  { label: "Saúde coletiva", value: 76 },
  { label: "Pediatria", value: 61 },
  { label: "Ginecologia e obstetrícia", value: 54 },
  { label: "Nefrologia", value: 38 },
];

function tone(value: number) {
  if (value >= 70) return "bg-vital-500";
  if (value >= 50) return "bg-amber-500";
  return "bg-coral-500";
}

export function PerformanceCard({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: -1.5 }}
      whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative w-full max-w-sm rounded-3xl border border-border bg-bg-elevated p-6 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.35)]",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
          Seu desempenho
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-vital">
          <span className="h-1.5 w-1.5 rounded-full bg-vital animate-pulse" />
          ao vivo
        </span>
      </div>

      <div className="mt-5 flex items-center gap-5">
        <div className="relative h-24 w-24 shrink-0">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(var(--color-accent) 0deg 245deg, var(--color-bg-inset) 245deg 360deg)`,
            }}
          />
          <div className="absolute inset-[7px] flex flex-col items-center justify-center rounded-full bg-bg-elevated">
            <span className="font-display text-2xl text-text-primary">68%</span>
            <span className="text-[10px] text-text-tertiary">geral</span>
          </div>
        </div>
        <div>
          <p className="font-display text-lg leading-snug text-text-primary">
            Você está pronto para 68% da prova.
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            Baseado em 1.240 questões respondidas
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {areas.map((a, i) => (
          <motion.div
            key={a.label}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-text-secondary">{a.label}</span>
              <span className="font-mono text-xs text-text-tertiary">
                {a.value}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-inset">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${a.value}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: "easeOut" }}
                className={cn("h-full rounded-full", tone(a.value))}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-coral-500/30 bg-coral-500/10 p-3.5">
        <Sparkles size={16} className="mt-0.5 shrink-0 text-accent" />
        <p className="text-xs leading-relaxed text-text-secondary">
          <span className="font-semibold text-text-primary">IA sugere:</span>{" "}
          40 min em Nefrologia hoje — é sua maior lacuna esta semana.
        </p>
      </div>
    </motion.div>
  );
}
