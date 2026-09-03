import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { PracticeSession } from "@/components/practice/practice-session";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { createClient } from "@/lib/supabase/server";
import type { RetaFinalQuestao } from "@/lib/supabase/questoes";

export const metadata: Metadata = { title: "Reta Final Revalida — MedPulso.ia" };

export default async function RetaFinalPage({
  searchParams,
}: {
  searchParams: Promise<{ quantidade?: string; semRespondidas?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const params = await searchParams;
  const quantidade = Math.min(200, Math.max(5, Number(params.quantidade) || 50));
  const apenasNaoRespondidas = params.semRespondidas === "1";
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("buscar_reta_final", {
    p_user_id: user.id,
    p_limit: quantidade,
    p_apenas_nao_respondidas: apenasNaoRespondidas,
  });
  const questoes = (data as RetaFinalQuestao[] | null) ?? [];
  const prevalenciaPorQuestao = Object.fromEntries(
    questoes.map((q) => [q.id, { prevalencia: Number(q.prevalencia), tema: q.tema }])
  );

  return (
    <Container className="max-w-none py-12 lg:px-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-accent">11 dias · foco total</span>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-text-primary">Reta Final Revalida</h1>
          <p className="mt-2 max-w-2xl text-sm text-text-tertiary">
            Questões do banco relacionadas aos temas mais recorrentes nas edições anteriores. Os PDFs foram usados apenas para análise de prevalência.
          </p>
        </div>
        <form className="flex flex-wrap items-center gap-2 text-xs" method="get">
          <label className="text-text-tertiary" htmlFor="quantidade">Questões</label>
          <select id="quantidade" name="quantidade" defaultValue={String(quantidade)} className="rounded-lg border border-border-strong bg-bg-elevated px-2.5 py-2 text-text-primary">
            {[20, 50, 100, 200].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <label className="flex items-center gap-1.5 text-text-secondary">
            <input type="checkbox" name="semRespondidas" value="1" defaultChecked={apenasNaoRespondidas} />
            não respondidas
          </label>
          <button type="submit" className="rounded-lg bg-accent px-3 py-2 font-medium text-on-accent">Aplicar</button>
        </form>
      </div>

      {error ? (
        <div className="rounded-2xl border border-coral-500/30 bg-coral-500/10 p-6 text-sm text-coral-600">
          A seleção ainda não foi preparada no banco. Execute a migration `0009_reta_final.sql` e o script de análise.
        </div>
      ) : questoes.length > 0 ? (
        <PracticeSession questoes={questoes} prevalenciaPorQuestao={prevalenciaPorQuestao} />
      ) : (
        <div className="rounded-3xl border border-dashed border-border-strong p-8 text-center text-sm text-text-tertiary">
          Nenhuma questão encontrada. Tente incluir questões já respondidas ou rode novamente a análise.
        </div>
      )}
    </Container>
  );
}
