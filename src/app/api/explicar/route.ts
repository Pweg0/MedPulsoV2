import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ExplicacaoIA } from "@/lib/gemini";
import { explicarQuestaoIA } from "@/lib/ai-explicar";
import type { Alternativa } from "@/lib/supabase/questoes";

const TABELAS = { questoes: "questoes", simulado: "simulado_questoes" } as const;
type Fonte = keyof typeof TABELAS;

function montarComentario(explicacao: ExplicacaoIA) {
  const partes: string[] = [];
  if (explicacao.pegadinha) partes.push(explicacao.pegadinha);
  if (explicacao.nota_de_atualizacao) {
    partes.push(`Atualização: ${explicacao.nota_de_atualizacao}`);
  }
  return partes.join("\n\n");
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { questaoId, fonte: fonteInput } = await request.json();
  if (!questaoId) {
    return NextResponse.json({ erro: "questaoId ausente." }, { status: 400 });
  }
  const fonte: Fonte = fonteInput === "simulado" ? "simulado" : "questoes";
  const tabela = TABELAS[fonte];

  const supabase = await createClient();
  const { data: questao, error: fetchError } = await supabase
    .from(tabela)
    .select("*")
    .eq("id", questaoId)
    .single();

  if (fetchError || !questao) {
    return NextResponse.json({ erro: "Questão não encontrada." }, { status: 404 });
  }

  if (questao.explicacao_ia) {
    return NextResponse.json({ explicacao: questao.explicacao_ia, cache: true });
  }

  if (!(process.env.RETA_FINAL_AI_API_KEY || process.env.AI_API_KEY) || !(process.env.RETA_FINAL_AI_ENDPOINT || process.env.AI_ENDPOINT)) {
    return NextResponse.json(
      { erro: "Explicação por IA ainda não configurada neste ambiente." },
      { status: 400 }
    );
  }

  const questaoInput = {
    instituicao: questao.instituicao ?? null,
    ano: questao.ano ?? null,
    enunciado: questao.enunciado,
    alternativas: (questao.alternativas as Alternativa[]).map((a) => ({
      letra: a.letra,
      texto: a.texto,
      correta: a.correta,
    })),
    temFigura: !!questao.tem_figura,
  };

  let explicacao: ExplicacaoIA;
  try {
    explicacao = await explicarQuestaoIA(questaoInput);
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : "Falha ao gerar explicação." },
      { status: 502 }
    );
  }

  const refutacaoPorLetra = new Map(
    explicacao.refutacoes.map((r) => [r.letra, r.erro])
  );
  const novasAlternativas: Alternativa[] = (
    questao.alternativas as Alternativa[]
  ).map((a) => ({
    ...a,
    explicacao: a.correta
      ? explicacao.por_que_correta
      : refutacaoPorLetra.get(a.letra) || a.explicacao,
  }));

  const admin = createAdminClient();
  const { error: updateError } = await admin
    .from(tabela)
    .update({
      alternativas: novasAlternativas,
      ...(fonte === "questoes"
        ? { comentario_geral: montarComentario(explicacao) || questao.comentario_geral }
        : {}),
      explicacao_ia: explicacao,
      explicacao_gerada_em: new Date().toISOString(),
      disciplina: questao.disciplina ?? explicacao.area,
    })
    .eq("id", questaoId);

  if (updateError) {
    return NextResponse.json({ erro: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ explicacao, cache: false });
}
