import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { IndexarForm } from "@/components/simulados/indexar-form";
import { getCurrentUser } from "@/lib/supabase/get-current-user";

export const metadata: Metadata = {
  title: "Indexar simulado — MedPulso.ia",
};

export default async function IndexarSimuladoPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <Container className="max-w-xl py-16">
      <div className="mb-8">
        <span className="font-mono text-xs uppercase tracking-wider text-accent">
          Simulados
        </span>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-text-primary">
          Indexar nova prova
        </h1>
        <p className="mt-2 text-sm text-text-tertiary">
          Envie o caderno de questões e o gabarito definitivo em PDF — a IA
          extrai e organiza tudo automaticamente. Fica guardado à parte do
          banco de questões principal.
        </p>
      </div>

      <IndexarForm />
    </Container>
  );
}
