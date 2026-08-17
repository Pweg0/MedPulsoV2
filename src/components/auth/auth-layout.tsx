import { BookOpenCheck, LineChart, Brain } from "lucide-react";
import { Logo } from "@/components/logo";
import { PulseLine } from "@/components/pulse-line";

const bullets = [
  { icon: BookOpenCheck, label: "Banco de questões comentadas" },
  { icon: LineChart, label: "Dashboard de desempenho por área" },
  { icon: Brain, label: "Trilha de estudo com IA" },
];

export function AuthLayout({
  eyebrow,
  headline,
  children,
}: {
  eyebrow: string;
  headline: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-4.5rem)] grid-cols-1 lg:grid-cols-2">
      <div
        className="dark relative hidden flex-col justify-between overflow-hidden px-14 py-14 lg:flex"
        style={{ backgroundColor: "var(--ink-900)" }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-1/3 h-40 text-coral-500/25">
          <PulseLine strokeWidth={2} />
        </div>
        <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-accent/15 blur-[100px]" />

        <Logo className="relative" />

        <div className="relative">
          <span className="font-mono text-xs uppercase tracking-wider text-white/50">
            {eyebrow}
          </span>
          <h1 className="mt-4 max-w-sm font-display text-4xl leading-[1.15] tracking-tight text-white">
            {headline}
          </h1>

          <div className="mt-10 flex flex-col gap-4">
            {bullets.map((b) => (
              <div key={b.label} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                  <b.icon size={16} />
                </span>
                <span className="text-sm text-white/70">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative max-w-xs text-xs leading-relaxed text-white/40">
          Explicações fundamentadas nas diretrizes do Ministério da Saúde.
          Conteúdo de apoio ao estudo — não substitui as diretrizes
          oficiais.
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
