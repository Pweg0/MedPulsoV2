import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { explicarTextoIA } from "@/lib/ai-explicar";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const body = await request.json();
  const questaoId = body.questaoId != null ? String(body.questaoId).trim() : "";
  const incluirAlternativas = body.incluirAlternativas === true;
  if (!questaoId) return NextResponse.json({ erro: "questaoId ausente." }, { status: 400 });

  const supabase = await createClient();
  const { data: questao, error: questaoError } = await supabase
    .from("questoes")
    .select("id, enunciado, alternativas, explicacao_texto_ia, explicacao_tudo_ia")
    .eq("id", questaoId)
    .single();
  if (questaoError || !questao) return NextResponse.json({ erro: "Questão não encontrada." }, { status: 404 });

  const cache = incluirAlternativas ? questao.explicacao_tudo_ia : questao.explicacao_texto_ia;
  if (cache) return NextResponse.json({ explicacao: cache, cache: true });

  const texto = questao.enunciado.trim();
  const alternativas = incluirAlternativas
    ? (Array.isArray(questao.alternativas) ? questao.alternativas : [])
        .slice(0, 10)
        .map((alternativa: { letra?: string; texto?: string }) => `${alternativa.letra ?? ""}) ${alternativa.texto ?? ""}`)
    : undefined;
  if (!(process.env.RETA_FINAL_AI_API_KEY || process.env.AI_API_KEY) || !(process.env.RETA_FINAL_AI_ENDPOINT || process.env.AI_ENDPOINT)) {
    return NextResponse.json({ erro: "Explicação por IA ainda não configurada." }, { status: 400 });
  }

  try {
    const explicacao = await explicarTextoIA(texto, alternativas);
    const agora = new Date().toISOString();
    const admin = createAdminClient();
    const { error: cacheError } = await admin.from("questoes").update(
      incluirAlternativas
        ? { explicacao_tudo_ia: explicacao, explicacao_tudo_gerada_em: agora }
        : { explicacao_texto_ia: explicacao, explicacao_texto_gerada_em: agora }
    ).eq("id", questaoId);
    if (cacheError) throw new Error(`Falha ao salvar cache: ${cacheError.message}`);
    return NextResponse.json({ explicacao, cache: false });
  } catch (error) {
    return NextResponse.json({ erro: error instanceof Error ? error.message : "Falha ao explicar o texto." }, { status: 502 });
  }
}
