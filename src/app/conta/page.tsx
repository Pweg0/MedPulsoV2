import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CircleUser, Calendar, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { getCurrentUser } from "@/lib/supabase/get-current-user";

export const metadata: Metadata = {
  title: "Minha conta — MedPulso.ia",
};

export default async function ContaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const memberSince = new Date(user.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <Container className="max-w-2xl py-20">
      <div className="rounded-3xl border border-border bg-bg-elevated p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <CircleUser size={26} />
          </span>
          <div>
            <h1 className="font-display text-2xl text-text-primary">
              {(user.user_metadata?.full_name as string) || "Sua conta"}
            </h1>
            <p className="text-sm text-text-secondary">{user.email}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6">
          <div className="flex items-center gap-2.5 text-sm text-text-secondary">
            <Calendar size={15} className="text-text-tertiary" />
            Conta criada em {memberSince}
          </div>
          <div className="flex items-center gap-2.5 text-sm text-text-secondary">
            <ShieldCheck size={15} className="text-vital" />
            Autenticação verificada
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-border-strong p-5 text-sm text-text-tertiary">
          O banco de questões, o dashboard de desempenho e a trilha de
          estudo com IA ainda estão em construção. Sua conta já está
          pronta para quando eles chegarem.
        </div>
      </div>
    </Container>
  );
}
