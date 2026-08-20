import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ImagensManager } from "@/components/simulados/imagens-manager";
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
  return { title: `Imagens — ${data?.nome ?? "Simulado"} — MedPulso.ia` };
}

export default async function SimuladoImagensPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const supabase = await createClient();

  const [{ data: simulado }, { data: questoes }] = await Promise.all([
    supabase.from("simulados").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("simulado_questoes")
      .select("*")
      .eq("simulado_id", id)
      .order("numero", { ascending: true }),
  ]);

  if (!simulado || !questoes) notFound();

  return (
    <Container className="max-w-3xl py-10">
      <Link
        href={`/simulados/${id}`}
        className="flex items-center gap-1.5 font-mono text-xs text-text-tertiary hover:text-accent"
      >
        <ArrowLeft size={14} />
        Voltar ao simulado
      </Link>

      <h1 className="mt-4 font-display text-2xl text-text-primary">
        Imagens — {(simulado as Simulado).nome}
      </h1>
      <p className="mt-2 max-w-lg text-sm text-text-tertiary">
        A indexação por IA lê o PDF como texto e não extrai figuras, gráficos
        ou ECGs. Anexe manualmente a imagem de cada questão que precisar.
        Questões marcadas com <strong>figura</strong> foram flagadas pela IA
        como dependentes de imagem.
      </p>

      <ImagensManager questoes={questoes as SimuladoQuestao[]} />
    </Container>
  );
}
