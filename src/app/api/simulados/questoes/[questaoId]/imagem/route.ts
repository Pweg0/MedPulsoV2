import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "simulado-imagens";
const TAMANHO_MAXIMO = 8 * 1024 * 1024;
const TIPOS_ACEITOS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ questaoId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { questaoId } = await params;

  const form = await request.formData();
  const imagem = form.get("imagem");
  if (!(imagem instanceof File)) {
    return NextResponse.json({ erro: "Envie um arquivo de imagem." }, { status: 400 });
  }

  const extensao = TIPOS_ACEITOS[imagem.type];
  if (!extensao) {
    return NextResponse.json(
      { erro: "Formato não suportado. Use PNG, JPG ou WEBP." },
      { status: 400 }
    );
  }
  if (imagem.size > TAMANHO_MAXIMO) {
    return NextResponse.json({ erro: "Imagem maior que 8MB." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: questao } = await admin
    .from("simulado_questoes")
    .select("id, simulado_id")
    .eq("id", questaoId)
    .maybeSingle();

  if (!questao) {
    return NextResponse.json({ erro: "Questão não encontrada." }, { status: 404 });
  }

  const caminho = `${questao.simulado_id}/${questaoId}-${Date.now()}.${extensao}`;
  const buffer = Buffer.from(await imagem.arrayBuffer());

  const { error: erroUpload } = await admin.storage
    .from(BUCKET)
    .upload(caminho, buffer, { contentType: imagem.type, upsert: false });

  if (erroUpload) {
    return NextResponse.json({ erro: erroUpload.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from(BUCKET).getPublicUrl(caminho);

  const { error: erroUpdate } = await admin
    .from("simulado_questoes")
    .update({ imagem_url: publicUrl, tem_figura: true })
    .eq("id", questaoId);

  if (erroUpdate) {
    return NextResponse.json({ erro: erroUpdate.message }, { status: 500 });
  }

  return NextResponse.json({ imagemUrl: publicUrl });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ questaoId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { questaoId } = await params;
  const admin = createAdminClient();

  const { error } = await admin
    .from("simulado_questoes")
    .update({ imagem_url: null })
    .eq("id", questaoId);

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
