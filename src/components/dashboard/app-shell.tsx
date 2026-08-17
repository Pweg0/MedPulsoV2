import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { getCurrentUser } from "@/lib/supabase/get-current-user";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      <DashboardSidebar />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
