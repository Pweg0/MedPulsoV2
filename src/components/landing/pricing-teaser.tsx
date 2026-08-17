import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { PlanCard } from "@/components/pricing/plan-card";
import { plans } from "@/lib/pricing";

export function PricingTeaser() {
  return (
    <section className="py-24">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <span className="font-mono text-xs uppercase tracking-wider text-accent">
              Planos
            </span>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-text-primary">
              7 dias grátis. Depois, escolha o seu ritmo.
            </h2>
          </div>
          <Button href="/precos" variant="outline">
            Ver todos os detalhes
            <ArrowRight size={16} />
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {plans.map((p, i) => (
            <PlanCard key={p.id} plan={p} index={i} compact />
          ))}
        </div>
      </Container>
    </section>
  );
}
