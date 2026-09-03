import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { explicarTextoIA } from "@/lib/ai-explicar";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const body = await request.json();
  const texto = typeof body.texto === "string" ? body.texto.trim() : "";
  const alternativas = Array.isArray(body.alternativas)
    ? body.alternativas.filter((item: unknown): item is string => typeof item === "string").slice(0, 10)
    : undefined;
  if (!texto) return NextResponse.json({ erro: "Texto ausente." }, { status: 400 });
  if (texto.length > 30000) return NextResponse.json({ erro: "Texto muito longo." }, { status: 400 });
  if (!(process.env.RETA_FINAL_AI_API_KEY || process.env.AI_API_KEY) || !(process.env.RETA_FINAL_AI_ENDPOINT || process.env.AI_ENDPOINT)) {
    return NextResponse.json({ erro: "Explicação por IA ainda não configurada." }, { status: 400 });
  }

  try {
    const explicacao = await explicarTextoIA(texto, alternativas);
    return NextResponse.json({ explicacao });
  } catch (error) {
    return NextResponse.json({ erro: error instanceof Error ? error.message : "Falha ao explicar o texto." }, { status: 502 });
  }
}
