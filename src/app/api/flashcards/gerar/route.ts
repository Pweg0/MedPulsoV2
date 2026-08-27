import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { gerarFlashcardIA } from "@/lib/ai-explicar";
import type { Alternativa, Questao } from "@/lib/supabase/questoes";
import type { ExplicacaoIA } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { questaoId, tentativaId } = await request.json();
  if (!questaoId) {
    return NextResponse.json({ erro: "questaoId ausente." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("flashcards")
    .select("*")
    .eq("user_id", user.id)
    .eq("questao_id", questaoId)
    .maybeSingle();

  if (existente) {
    return NextResponse.json({ flashcard: existente, cache: true });
  }

  const { data: questao, error: fetchError } = await supabase
    .from("questoes")
    .select("*")
    .eq("id", questaoId)
    .single();

  if (fetchError || !questao) {
    return NextResponse.json({ erro: "Questão não encontrada." }, { status: 404 });
  }

  if (!process.env.AI_API_KEY || !process.env.AI_ENDPOINT) {
    return NextResponse.json(
      { erro: "Geração de flashcard por IA ainda não configurada neste ambiente." },
      { status: 400 }
    );
  }

  const q = questao as Questao;
  const explicacaoExistente = q.explicacao_ia as ExplicacaoIA | null | undefined;

  let flashcardIA;
  try {
    flashcardIA = await gerarFlashcardIA({
      enunciado: q.enunciado,
      alternativas: (q.alternativas as Alternativa[]).map((a) => ({
        letra: a.letra,
        texto: a.texto,
        correta: a.correta,
      })),
      explicacaoExistente,
    });
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : "Falha ao gerar flashcard." },
      { status: 502 }
    );
  }

  const { data: flashcard, error: insertError } = await supabase
    .from("flashcards")
    .insert({
      user_id: user.id,
      questao_id: questaoId,
      tentativa_id: tentativaId ?? null,
      area_grande: flashcardIA.area_grande,
      frente: flashcardIA.frente,
      verso: flashcardIA.verso,
    })
    .select("*")
    .single();

  if (insertError) {
    return NextResponse.json({ erro: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ flashcard, cache: false });
}
