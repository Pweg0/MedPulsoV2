import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PracticeSession } from "@/components/practice/practice-session";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { createClient } from "@/lib/supabase/server";
import type { Questao } from "@/lib/supabase/questoes";

export const metadata: Metadata = {
  title: "Estudar — MedPulso.ia",
};

function paraArray(valor: string | string[] | undefined): string[] {
  if (!valor) return [];
  return Array.isArray(valor) ? valor : [valor];
}

export default async function PraticarPage({
  searchParams,
}: {
  searchParams: Promise<{
    esp?: string | string[];
    ano?: string | string[];
    banca?: string | string[];
    status?: string;
  }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { esp, ano, banca, status } = await searchParams;
  const especialidades = paraArray(esp);
  const anos = paraArray(ano);
  const bancas = paraArray(banca);

  const supabase = await createClient();
  const { data } = await supabase.rpc("buscar_questoes", {
    p_anos: anos.length ? anos.map(Number) : null,
    p_bancas: bancas.length ? bancas : null,
    p_especialidades: especialidades.length ? especialidades : null,
    p_status: status || "todas",
    p_user_id: user.id,
    p_limit: 200,
  });
  const questoes = data as Questao[] | null;

  const filtroAtivo =
    especialidades.length > 0 || anos.length > 0 || bancas.length > 0 || !!status;

  return (
    <Container className="max-w-none py-16 lg:px-12">
      <div className="mb-8">
        <Link
          href="/estudar"
          className="flex items-center gap-1.5 font-mono text-xs text-text-tertiary hover:text-accent"
        >
          <ArrowLeft size={14} />
          Ajustar filtros
        </Link>
        <h1 className="mt-3 font-display text-3xl tracking-tight text-text-primary">
          Resolver questões
        </h1>
      </div>

      {questoes && questoes.length > 0 ? (
        <PracticeSession
          questoes={questoes}
          key={`${especialidades.join(",")}-${anos.join(",")}-${bancas.join(",")}-${status ?? ""}`}
        />
      ) : (
        <div className="rounded-3xl border border-dashed border-border-strong p-8 text-center text-sm text-text-tertiary">
          {filtroAtivo
            ? "Nenhuma questão encontrada com esses filtros."
            : "Ainda não há questões no banco. Volte em breve."}
        </div>
      )}
    </Container>
  );
}
