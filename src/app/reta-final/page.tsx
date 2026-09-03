import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { PracticeSession } from "@/components/practice/practice-session";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { createClient } from "@/lib/supabase/server";
import type { RetaFinalQuestao } from "@/lib/supabase/questoes";
import { ArrowRight, Menu } from "lucide-react";

export const metadata: Metadata = { title: "Reta Final Revalida — MedPulso.ia" };

export default async function RetaFinalPage({
  searchParams,
}: {
  searchParams: Promise<{ quantidade?: string; iniciar?: string; filtro?: string; tema?: string | string[]; area?: string | string[]; randomizar?: string; ids?: string; blocoId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const params = await searchParams;
  const quantidade = Math.min(200, Math.max(5, Number(params.quantidade) || 50));
  const iniciou = params.iniciar === "1";
  const filtro = params.filtro === "erradas" ? "erradas" : params.filtro === "todas" ? "todas" : "novas";
  const temasSelecionados = Array.isArray(params.tema) ? params.tema : params.tema ? [params.tema] : [];
  const areasSelecionadas = Array.isArray(params.area) ? params.area : params.area ? [params.area] : [];
  const randomizar = params.randomizar !== "0";
  let idsPersistidos = params.ids?.split(",").filter(Boolean) ?? [];
  const supabase = await createClient();
  if (params.blocoId && idsPersistidos.length === 0) {
    const { data: bloco } = await supabase.from("reta_final_blocos").select("questao_ids").eq("id", params.blocoId).eq("user_id", user.id).maybeSingle();
    idsPersistidos = (bloco?.questao_ids as string[] | undefined) ?? [];
  }
  const { data: temasData } = await supabase.from("reta_final_temas").select("id, nome, area_grande, prevalencia").order("area_grande").order("prevalencia", { ascending: false });
  const temas = (temasData as { id: string; nome: string; area_grande: string; prevalencia: number }[] | null) ?? [];
  const areas = [...new Set(temas.map((tema) => tema.area_grande))];
  let blocos: { id: string; numero: number; quantidade: number; questao_ids: string[]; questoes_feitas: number; acertos: number; percentual: number }[] = [];
  const { data: blocosData } = await supabase.rpc("listar_reta_final_blocos", { p_user_id: user.id });
  blocos = (blocosData as typeof blocos | null) ?? [];
  const { data, error } = iniciou
    ? await supabase.rpc("buscar_reta_final", {
        p_user_id: user.id,
        p_limit: quantidade,
        p_apenas_nao_respondidas: !idsPersistidos.length && filtro === "novas",
        p_apenas_erradas: !idsPersistidos.length && filtro === "erradas",
        p_tema_ids: temasSelecionados.length ? temasSelecionados : null,
        p_area_grandes: areasSelecionadas.length ? areasSelecionadas : null,
        p_randomizar: randomizar,
        p_questao_ids: idsPersistidos.length ? idsPersistidos : null,
      })
    : { data: null, error: null };
  const questoes = (data as RetaFinalQuestao[] | null) ?? [];
  const prevalenciaPorQuestao = Object.fromEntries(
    questoes.map((q) => [q.id, { prevalencia: Number(q.prevalencia), tema: q.tema }])
  );

  if (iniciou && questoes.length > 0 && idsPersistidos.length === 0) {
    const { data: novoBloco, error: blocoError } = await supabase.from("reta_final_blocos").insert({
      user_id: user.id,
      numero: blocos.length + 1,
      quantidade: questoes.length,
      questao_ids: questoes.map((q) => q.id),
    }).select("id").single();
    if (blocoError || !novoBloco) return null;
    const query = new URLSearchParams();
    query.set("iniciar", "1");
    query.set("quantidade", String(quantidade));
    query.set("filtro", filtro);
    query.set("randomizar", randomizar ? "1" : "0");
    query.set("ids", questoes.map((q) => q.id).join(","));
    query.set("blocoId", novoBloco.id);
    redirect(`/reta-final?${query.toString()}`);
  }

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
        {!iniciou && (
          <form className="flex flex-wrap items-center gap-2 text-xs" method="get">
            <input type="hidden" name="iniciar" value="1" />
            <label className="text-text-tertiary" htmlFor="quantidade">Questões</label>
            <select id="quantidade" name="quantidade" defaultValue={String(quantidade)} className="rounded-lg border border-border-strong bg-bg-elevated px-2.5 py-2 text-text-primary">
              {[20, 50, 100, 200].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <select name="filtro" defaultValue="novas" className="rounded-lg border border-border-strong bg-bg-elevated px-2.5 py-2 text-text-primary">
              <option value="novas">Somente não respondidas</option>
              <option value="erradas">Somente erradas</option>
              <option value="todas">Mostrar todas</option>
            </select>
            <label className="flex items-center gap-1.5 text-text-secondary">
              <input type="checkbox" name="randomizar" value="1" defaultChecked />
              randomizar
            </label>
            <details className="relative basis-full sm:basis-auto">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-border-strong bg-bg-elevated px-3 py-2 text-text-secondary">
                <Menu size={14} /> áreas e temas
              </summary>
              <div className="absolute right-0 z-10 mt-2 max-h-[60vh] w-[min(92vw,420px)] overflow-y-auto rounded-2xl border border-border bg-bg-elevated p-3 shadow-xl">
                <p className="mb-3 text-[11px] text-text-tertiary">Sem seleção, todas as áreas entram. Com seleção, a quantidade é distribuída igualmente entre os grupos.</p>
                {areas.map((area) => (
                  <div key={area} className="flex items-start gap-2 border-b border-border py-2 last:border-0">
                    <input className="mt-1" type="checkbox" name="area" value={area} />
                    <details className="min-w-0 flex-1">
                      <summary className="cursor-pointer text-sm font-medium text-text-primary">
                        {area}
                      </summary>
                      <div className="mt-2 grid gap-1 pl-2">
                        {temas.filter((tema) => tema.area_grande === area).map((tema) => (
                          <label key={tema.id} className="flex items-start gap-2 text-xs text-text-secondary">
                            <input type="checkbox" name="tema" value={tema.id} />
                            <span>{tema.nome} <span className="font-mono text-[10px] text-accent">{Math.round(Number(tema.prevalencia))}%</span></span>
                          </label>
                        ))}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </details>
            <button type="submit" className="rounded-lg bg-accent px-3 py-2 font-medium text-on-accent">Iniciar bloco de revisão</button>
          </form>
        )}
      </div>

      {error ? (
        <div className="rounded-2xl border border-coral-500/30 bg-coral-500/10 p-6 text-sm text-coral-600">
          A seleção ainda não foi preparada no banco. Execute a migration `0009_reta_final.sql` e o script de análise.
        </div>
      ) : questoes.length > 0 ? (
        <PracticeSession questoes={questoes} prevalenciaPorQuestao={prevalenciaPorQuestao} bloco />
      ) : (
        <div className="rounded-3xl border border-dashed border-border-strong p-8 text-center text-sm text-text-tertiary">
          {iniciou ? "Nenhuma questão encontrada com esse filtro. Tente outro tipo de bloco." : "Escolha o tamanho e inicie seu primeiro bloco de revisão."}
        </div>
      )}

      {!iniciou && blocos.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-xl text-text-primary">Seus blocos de revisão</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {blocos.map((bloco) => (
              <div key={bloco.id} className="rounded-2xl border border-border bg-bg-elevated p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg text-text-primary">Bloco {bloco.numero}</p>
                    <p className="mt-1 text-xs text-text-tertiary">{bloco.quantidade} questões · {bloco.questoes_feitas} feitas</p>
                  </div>
                  <span className="font-mono text-sm font-semibold text-accent">{Math.round(Number(bloco.percentual))}%</span>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-bg-inset">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, (bloco.questoes_feitas / Math.max(1, bloco.quantidade)) * 100)}%` }} />
                </div>
                <a href={`/reta-final?iniciar=1&blocoId=${bloco.id}`} className="mt-4 flex items-center justify-end gap-1.5 font-mono text-xs text-accent hover:underline">
                  Continuar <ArrowRight size={13} />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
