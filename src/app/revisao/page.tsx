import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { PracticeSession } from "@/components/practice/practice-session";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { createClient } from "@/lib/supabase/server";
import type { Questao } from "@/lib/supabase/questoes";

export const metadata: Metadata = {
  title: "Caderno de Revisão — MedPulso.ia",
};

type TentativaRow = {
  questao_id: string;
  acertou: boolean;
  avaliacao_pontos: { pontos: { nivel: string }[] } | null;
  proxima_revisao_em: string | null;
  created_at: string;
};

function precisaRevisao(t: TentativaRow) {
  if (!t.acertou) return true;
  const pontos = t.avaliacao_pontos?.pontos ?? [];
  return pontos.some((p) => p.nivel === "duvida" || p.nivel === "nao_sabia");
}

export default async function RevisaoPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const { data: tentativas } = await supabase
    .from("tentativas")
    .select("questao_id, acertou, avaliacao_pontos, proxima_revisao_em, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const ultimaPorQuestao = new Map<string, TentativaRow>();
  for (const t of (tentativas as TentativaRow[] | null) ?? []) {
    if (!ultimaPorQuestao.has(t.questao_id)) {
      ultimaPorQuestao.set(t.questao_id, t);
    }
  }

  const paraRevisar = Array.from(ultimaPorQuestao.values())
    .filter(precisaRevisao)
    .sort((a, b) => {
      const da = a.proxima_revisao_em ? new Date(a.proxima_revisao_em).getTime() : 0;
      const db = b.proxima_revisao_em ? new Date(b.proxima_revisao_em).getTime() : 0;
      return da - db;
    });

  const ids = paraRevisar.map((t) => t.questao_id);

  let questoes: Questao[] = [];
  if (ids.length > 0) {
    const { data } = await supabase.from("questoes").select("*").in("id", ids);
    const porId = new Map((data as Questao[] | null)?.map((q) => [q.id, q]) ?? []);
    questoes = ids.map((id) => porId.get(id)).filter((q): q is Questao => !!q);
  }

  return (
    <Container className="max-w-none py-16 lg:px-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-tight text-text-primary">
          Caderno de Revisão
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Questões erradas, ou certas com dúvida — geradas automaticamente pelo
          seu Mapa de Raciocínio.
        </p>
      </div>

      {questoes.length > 0 ? (
        <PracticeSession questoes={questoes} key={questoes.map((q) => q.id).join(",")} />
      ) : (
        <div className="rounded-3xl border border-dashed border-border-strong p-8 text-center text-sm text-text-tertiary">
          Nenhuma questão pendente de revisão agora.
        </div>
      )}
    </Container>
  );
}
