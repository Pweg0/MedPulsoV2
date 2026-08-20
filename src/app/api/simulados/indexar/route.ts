import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { indexarProvaComGemini } from "@/lib/gemini";

// Indexar uma prova de 100 questões levou ~135s em teste real — Vercel
// Hobby historicamente limita bem menos que isso (10-60s). Se der timeout
// em produção, a saída é Vercel Pro (até 300s) ou quebrar em lotes.
export const maxDuration = 300;

async function fileParaBase64(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString("base64");
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const form = await request.formData();
  const nome = form.get("nome");
  const prova = form.get("prova");
  const gabarito = form.get("gabarito");

  if (typeof nome !== "string" || !nome.trim()) {
    return NextResponse.json({ erro: "Nome do simulado ausente." }, { status: 400 });
  }
  if (!(prova instanceof File) || !(gabarito instanceof File)) {
    return NextResponse.json(
      { erro: "Envie o PDF da prova e o PDF do gabarito." },
      { status: 400 }
    );
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { erro: "Indexação por IA ainda não configurada neste ambiente." },
      { status: 400 }
    );
  }

  let resultado;
  try {
    const [provaBase64, gabaritoBase64] = await Promise.all([
      fileParaBase64(prova),
      fileParaBase64(gabarito),
    ]);
    resultado = await indexarProvaComGemini({ provaBase64, gabaritoBase64 });
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : "Falha ao indexar a prova." },
      { status: 502 }
    );
  }

  const questoes = resultado.questoes ?? [];
  if (questoes.length === 0) {
    return NextResponse.json(
      { erro: "A IA não extraiu nenhuma questão. Confira se os PDFs estão corretos." },
      { status: 502 }
    );
  }

  const admin = createAdminClient();

  const { data: existente } = await admin
    .from("simulados")
    .select("id")
    .eq("nome", nome.trim())
    .maybeSingle();

  let simuladoId = existente?.id as string | undefined;
  const anoMatch = nome.match(/\d{4}/);

  if (!simuladoId) {
    const { data: novo, error: erroInsert } = await admin
      .from("simulados")
      .insert({
        nome: nome.trim(),
        instituicao: "INEP",
        ano: anoMatch ? Number(anoMatch[0]) : null,
        numero_questoes: questoes.length,
      })
      .select("id")
      .single();

    if (erroInsert) {
      return NextResponse.json({ erro: erroInsert.message }, { status: 500 });
    }
    simuladoId = novo.id;
  }

  const rows = questoes.map((q) => ({
    simulado_id: simuladoId,
    numero: q.num,
    enunciado: q.enunciado,
    alternativas: q.alternativas.map((a) => ({
      letra: a.letra,
      texto: a.texto,
      correta: !q.anulada && a.letra === q.gabarito,
      explicacao: "",
    })),
    anulada: !!q.anulada,
    tem_figura: !!q.tem_figura,
  }));

  const { error: erroUpsert } = await admin
    .from("simulado_questoes")
    .upsert(rows, { onConflict: "simulado_id,numero" });

  if (erroUpsert) {
    return NextResponse.json({ erro: erroUpsert.message }, { status: 500 });
  }

  const semGabarito = questoes.filter((q) => !q.anulada && !q.gabarito).length;

  return NextResponse.json({
    simuladoId,
    totalQuestoes: rows.length,
    semGabarito,
  });
}
