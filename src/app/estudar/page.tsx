import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { PracticeSession } from "@/components/practice/practice-session";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { createClient } from "@/lib/supabase/server";
import type { Questao } from "@/lib/supabase/questoes";

export const metadata: Metadata = {
  title: "Estudar — MedPulso.ia",
};

export default async function EstudarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: questoes } = await supabase
    .from("questoes")
    .select("*")
    .limit(200)
    .returns<Questao[]>();

  return (
    <Container className="max-w-2xl py-16">
      <div className="mb-8">
        <span className="font-mono text-xs uppercase tracking-wider text-accent">
          Praticar
        </span>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-text-primary">
          Resolver questões
        </h1>
      </div>

      {questoes && questoes.length > 0 ? (
        <PracticeSession questoes={questoes} />
      ) : (
        <div className="rounded-3xl border border-dashed border-border-strong p-8 text-center text-sm text-text-tertiary">
          Ainda não há questões no banco. Volte em breve.
        </div>
      )}
    </Container>
  );
}
