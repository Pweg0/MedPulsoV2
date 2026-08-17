import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PlanCard } from "@/components/pricing/plan-card";
import { TrialExplainer } from "@/components/pricing/trial-explainer";
import { ComparisonTable } from "@/components/pricing/comparison-table";
import { Faq, type FaqItem } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { PulseLine } from "@/components/pulse-line";
import { plans } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Preços — MedPulso.ia",
  description:
    "Planos do MedPulso.ia para ENARE, ENAMED e Revalida: 7 dias grátis, sem cartão de crédito. Compare recursos e escolha o seu ritmo de estudo.",
};

const billingFaqs: FaqItem[] = [
  {
    q: "O que acontece quando o teste de 7 dias termina?",
    a: "Como não pedimos cartão de crédito no cadastro, nada é cobrado automaticamente. Se quiser continuar, você escolhe um plano e ativa a cobrança manualmente.",
  },
  {
    q: "Posso trocar de plano depois?",
    a: "Sim, a qualquer momento pelo seu perfil. Ao fazer upgrade o valor é ajustado proporcionalmente; ao fazer downgrade, a mudança vale a partir do próximo ciclo.",
  },
  {
    q: "O plano anual é cobrado de uma vez?",
    a: "Sim, à vista, com o equivalente a R$ 49/mês — uma economia de cerca de 38% frente ao plano mensal. Também aceitamos parcelamento no cartão.",
  },
  {
    q: "Existe desconto para grupos de estudo ou ligas acadêmicas?",
    a: "Sim. Entre em contato pelo suporte depois de criar sua conta que avaliamos condições especiais para grupos a partir de 5 pessoas.",
  },
  {
    q: "Como funciona o cancelamento?",
    a: "Direto no seu perfil, sem burocracia e sem necessidade de contato por e-mail ou telefone. O acesso continua até o fim do período já pago.",
  },
];

export default function PrecosPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-16 sm:pt-20">
        <div className="pointer-events-none absolute inset-x-0 top-16 h-32 text-accent/[0.12]">
          <PulseLine strokeWidth={2} />
        </div>
        <Container className="relative text-center">
          <span className="font-mono text-xs uppercase tracking-wider text-accent">
            Preços
          </span>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-5xl leading-tight tracking-tight text-text-primary">
            Um plano para cada etapa da sua preparação.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-text-secondary">
            Comece com 7 dias grátis em qualquer plano. Sem cartão de
            crédito, sem letra miúda.
          </p>
        </Container>
      </section>

      <Container>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {plans.map((p, i) => (
            <PlanCard key={p.id} plan={p} index={i} />
          ))}
        </div>
      </Container>

      <TrialExplainer />
      <ComparisonTable />
      <Faq
        items={billingFaqs}
        eyebrow="Cobrança"
        title="Dúvidas sobre pagamento"
        id="faq-cobranca"
      />
      <FinalCta />
    </>
  );
}
