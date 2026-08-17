import { UserPlus, CalendarClock, CreditCard } from "lucide-react";
import { Container } from "@/components/ui/container";

const steps = [
  {
    icon: UserPlus,
    title: "Crie sua conta",
    desc: "Sem cartão de crédito. Leva menos de dois minutos.",
  },
  {
    icon: CalendarClock,
    title: "Use 7 dias completos",
    desc: "Acesso total ao banco de questões, dashboard e trilha com IA.",
  },
  {
    icon: CreditCard,
    title: "Decida se continua",
    desc: "Gostou? Escolha um plano. Se não, é só não fazer nada — nada é cobrado.",
  },
];

export function TrialExplainer() {
  return (
    <section className="border-y border-border bg-bg-inset/50 py-20">
      <Container>
        <div className="text-center">
          <span className="font-mono text-xs uppercase tracking-wider text-accent">
            Teste grátis
          </span>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-text-primary">
            Como funcionam os 7 dias
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="fade-up text-center" style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <s.icon size={22} />
              </div>
              <h3 className="mt-5 font-display text-lg text-text-primary">
                {s.title}
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-text-secondary">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
