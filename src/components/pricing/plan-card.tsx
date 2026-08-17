"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Plan } from "@/lib/pricing";

export function PlanCard({
  plan,
  index,
  compact = false,
}: {
  plan: Plan;
  index: number;
  compact?: boolean;
}) {
  const features = compact ? plan.features.slice(0, 4) : plan.features;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={cn(
        "relative flex flex-col rounded-3xl border p-7",
        plan.highlighted
          ? "border-accent bg-bg-elevated shadow-[0_20px_50px_-20px_var(--color-accent)] lg:-translate-y-3"
          : "border-border bg-bg-elevated"
      )}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-7 rounded-full bg-accent px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-on-accent">
          Mais popular
        </span>
      )}
      <h3 className="font-display text-xl text-text-primary">{plan.name}</h3>
      <p className="mt-1.5 text-sm text-text-tertiary">{plan.tagline}</p>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="font-mono text-sm text-text-tertiary">R$</span>
        <span className="font-display text-4xl text-text-primary">
          {plan.price}
        </span>
        <span className="text-sm text-text-tertiary">/mês</span>
      </div>
      <p className="text-xs text-text-tertiary">{plan.billingNote}</p>

      <ul className="mt-6 flex flex-col gap-2.5">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2 text-sm text-text-secondary"
          >
            <Check size={15} className="mt-0.5 shrink-0 text-vital" />
            {f}
          </li>
        ))}
      </ul>

      <Button
        href="/cadastro"
        variant={plan.highlighted ? "primary" : "secondary"}
        className="mt-7 w-full"
      >
        {plan.cta}
      </Button>
      <p className="mt-3 text-center text-[11px] text-text-tertiary">
        7 dias grátis · sem cartão de crédito
      </p>
    </motion.div>
  );
}
