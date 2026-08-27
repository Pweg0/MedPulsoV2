import { AppShell } from "@/components/dashboard/app-shell";

export default function RevisaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
