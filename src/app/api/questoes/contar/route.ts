import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { anos, bancas, especialidades, status } = await request.json();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("contar_questoes", {
    p_anos: anos?.length ? anos.map(Number) : null,
    p_bancas: bancas?.length ? bancas : null,
    p_especialidades: especialidades?.length ? especialidades : null,
    p_status: status || "todas",
    p_user_id: user.id,
  });

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  return NextResponse.json({ total: data });
}
