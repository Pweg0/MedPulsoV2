import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Plus, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { createClient } from "@/lib/supabase/server";
import type { Simulado } from "@/lib/supabase/simulados";

export const metadata: Metadata = {
  title: "Simulados — MedPulso.ia",
};

export default async function SimuladosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase
    .from("simulados")
    .select("*")
    .order("ano", { ascending: false });
  const simulados = (data as Simulado[]) ?? [];

  return (
    <Container className="max-w-4xl py-16">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-accent">
            Simulado / Treino
          </span>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-text-primary">
            Provas completas
          </h1>
          <p className="mt-2 max-w-lg text-sm text-text-tertiary">
            Provas indexadas na íntegra, separadas do banco de questões
            avulsas — resolva do jeito que caiu na prova real.
          </p>
        </div>
        <Button href="/simulados/indexar" variant="secondary" size="sm">
          <Plus size={15} /> Indexar prova
        </Button>
      </div>

      {simulados.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border-strong p-8 text-center text-sm text-text-tertiary">
          Nenhuma prova indexada ainda.{" "}
          <Link href="/simulados/indexar" className="text-accent hover:underline">
            Indexar a primeira
          </Link>
          .
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {simulados.map((s) => (
            <Link
              key={s.id}
              href={`/simulados/${s.id}`}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-bg-elevated p-5 transition-colors hover:border-accent"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <FileText size={18} />
                </span>
                <div>
                  <p className="font-display text-lg text-text-primary">
                    {s.nome}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {s.instituicao}
                    {s.instituicao && " · "}
                    {s.numero_questoes} questões
                  </p>
                </div>
              </div>
              <span className="mt-4 flex items-center gap-1.5 self-end font-mono text-xs text-text-tertiary transition-colors group-hover:text-accent">
                Começar <ArrowRight size={13} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
