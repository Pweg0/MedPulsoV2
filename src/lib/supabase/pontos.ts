import { createClient } from "@/lib/supabase/client";

export type NivelAvaliacao = "dominei" | "duvida" | "vacilei" | "nao_sabia";

export type PontoAvaliado = {
  ponto: string;
  verbo: string;
  nivel: NivelAvaliacao;
};

const SCORE_POR_NIVEL: Record<NivelAvaliacao, number> = {
  dominei: 100,
  vacilei: 70,
  duvida: 40,
  nao_sabia: 0,
};

function calcularProximaRevisao(scoreMedio: number): string {
  const dias = scoreMedio >= 90 ? 14 : scoreMedio >= 70 ? 7 : scoreMedio >= 40 ? 3 : 1;
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return data.toISOString();
}

export async function salvarAvaliacaoPonto(params: {
  tentativaId: string;
  tema: string;
  pontos: PontoAvaliado[];
}) {
  const { tentativaId, tema, pontos } = params;
  if (pontos.length === 0) return;

  const supabase = createClient();
  const scoreMedio =
    pontos.reduce((soma, p) => soma + SCORE_POR_NIVEL[p.nivel], 0) / pontos.length;
  const proximaRevisaoEm = calcularProximaRevisao(scoreMedio);

  await supabase
    .from("tentativas")
    .update({
      avaliacao_pontos: { tema, pontos },
      proxima_revisao_em: proximaRevisaoEm,
    })
    .eq("id", tentativaId);

  const { data: existente } = await supabase
    .from("tema_dominio")
    .select("score, questoes_avaliadas")
    .eq("tema", tema)
    .maybeSingle();

  const novoScore = existente ? existente.score * 0.7 + scoreMedio * 0.3 : scoreMedio;

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return;

  await supabase.from("tema_dominio").upsert(
    {
      user_id: userId,
      tema,
      score: novoScore,
      questoes_avaliadas: (existente?.questoes_avaliadas ?? 0) + 1,
      atualizado_em: new Date().toISOString(),
    },
    { onConflict: "user_id,tema" }
  );
}
