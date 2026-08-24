import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { PlanCard } from "@/components/dashboard/plan-card";
import { StreakCard } from "@/components/dashboard/streak-card";
import { SessionCard } from "@/components/dashboard/session-card";
import { ToolGrid } from "@/components/dashboard/tool-grid";
import { CollapsibleSections } from "@/components/dashboard/collapsible-sections";
import { ClinicsBanner } from "@/components/dashboard/clinics-banner";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { getDashboardData } from "@/lib/supabase/dashboard-data";

export const metadata: Metadata = {
  title: "Dashboard — MedPulso.ia",
};

function planStatus(createdAt: string) {
  const created = new Date(createdAt);
  const trialEnd = new Date(created.getTime() + 7 * 86400000);
  const now = new Date();
  const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / 86400000);

  if (daysLeft > 0) {
    return {
      label: "Teste grátis",
      note: `Expira em ${daysLeft} dia${daysLeft === 1 ? "" : "s"}`,
    };
  }
  return { label: "Teste expirado", note: "Assine um plano para continuar" };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getDashboardData(user.id);
  const plan = planStatus(user.created_at);

  return (
    <Container className="max-w-6xl py-8">
      <div className="flex flex-col gap-4">
        <PlanCard
          planLabel={plan.label}
          planNote={plan.note}
          totalRespondidas={data.totalRespondidas}
          totalDisponiveis={data.totalDisponiveis}
        />

        <StreakCard
          streakAtual={data.streakAtual}
          streakRecorde={data.streakRecorde}
          semanaAtiva={data.semanaAtiva}
        />

        <SessionCard
          respondidas={data.hoje.respondidas}
          acertos={data.hoje.acertos}
        />

        <ToolGrid />

        <CollapsibleSections data={data} />

        <ClinicsBanner />
      </div>
    </Container>
  );
}
