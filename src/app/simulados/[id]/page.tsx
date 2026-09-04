import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SimuladoSession } from "@/components/simulados/simulado-session";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { createClient } from "@/lib/supabase/server";
import type { Simulado, SimuladoQuestao } from "@/lib/supabase/simulados";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("simulados")
    .select("nome")
    .eq("id", id)
    .maybeSingle();
  return { title: `${data?.nome ?? "Simulado"} — MedPulso.ia` };
}

export default async function SimuladoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const supabase = await createClient();

  const [{ data: simulado }, { data: questoes }, { data: tentativas }] =
    await Promise.all([
      supabase.from("simulados").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("simulado_questoes")
        .select("*")
        .eq("simulado_id", id)
        .order("numero", { ascending: true }),
      supabase
        .from("simulado_tentativas")
        .select("simulado_questao_id, resposta_letra")
        .eq("simulado_id", id)
        .eq("user_id", user.id),
    ]);

  if (!simulado || !questoes || questoes.length === 0) notFound();

  const respostasSalvas: Record<string, string> = {};
  for (const t of tentativas ?? []) {
    if (t.resposta_letra) respostasSalvas[t.simulado_questao_id] = t.resposta_letra;
  }

  return (
    <Container className="max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/simulados"
          className="flex items-center gap-1.5 font-mono text-xs text-text-tertiary hover:text-accent"
        >
          <ArrowLeft size={14} />
          Todos os simulados
        </Link>
        <Link
          href={`/simulados/${id}/imagens`}
          className="font-mono text-xs text-text-tertiary hover:text-accent"
        >
          Gerenciar imagens
        </Link>
      </div>

      <SimuladoSession
        simulado={simulado as Simulado}
        questoes={questoes as SimuladoQuestao[]}
        respostasSalvas={respostasSalvas}
        jaFinalizado={Object.keys(respostasSalvas).length >= questoes.length}
      />
    </Container>
  );
}
