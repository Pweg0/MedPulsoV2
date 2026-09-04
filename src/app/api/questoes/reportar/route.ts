import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { createClient } from "@/lib/supabase/server";

const MOTIVOS = new Set([
  "Gabarito incorreto",
  "Enunciado com problema",
  "Alternativa duplicada ou ilegível",
  "Protocolo desatualizado",
  "Outro",
]);

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const body = await request.json();
  const questaoId = typeof body.questaoId === "string" ? body.questaoId.trim() : "";
  const motivo = typeof body.motivo === "string" && MOTIVOS.has(body.motivo)
    ? body.motivo
    : "Outro";
  if (!questaoId) return NextResponse.json({ erro: "Questão ausente." }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase.from("questoes_reportadas").insert({
    questao_id: questaoId,
    user_id: user.id,
    motivo,
  });

  if (error?.code === "23505") {
    return NextResponse.json({ reportado: true, duplicado: true });
  }
  if (error) return NextResponse.json({ erro: "Não foi possível registrar o reporte." }, { status: 500 });
  return NextResponse.json({ reportado: true });
}
