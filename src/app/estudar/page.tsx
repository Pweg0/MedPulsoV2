import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { FiltroAvancado } from "@/components/practice/filtro-avancado";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { construirArvoreEspecialidades } from "@/lib/supabase/especialidade-tree";
import { fetchAllRpc } from "@/lib/supabase/fetch-all-rpc";

export const metadata: Metadata = {
  title: "Questões — MedPulso.ia",
};

export default async function EstudarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const [disciplinaRows, anoRows, bancaRows] = await Promise.all([
    fetchAllRpc<{ disciplina: string; total: number }>(
      supabase,
      "disciplina_counts"
    ),
    fetchAllRpc<{ ano: number; total: number }>(supabase, "ano_counts"),
    fetchAllRpc<{ instituicao: string; total: number }>(
      supabase,
      "instituicao_counts"
    ),
  ]);

  const arvoreEspecialidades = construirArvoreEspecialidades(disciplinaRows);

  return (
    <Container className="max-w-none py-16 lg:px-12">
      <div className="mb-8">
        <span className="font-mono text-xs uppercase tracking-wider text-accent">
          Praticar
        </span>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-text-primary">
          Banco de questões
        </h1>
        <p className="mt-2 max-w-xl text-sm text-text-tertiary">
          Filtre por especialidade, ano, banca e status pra montar o treino
          certo antes de começar.
        </p>
      </div>

      <FiltroAvancado
        arvoreEspecialidades={arvoreEspecialidades}
        anos={anoRows}
        bancas={bancaRows}
      />
    </Container>
  );
}
