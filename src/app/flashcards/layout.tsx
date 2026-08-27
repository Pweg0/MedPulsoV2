import { AppShell } from "@/components/dashboard/app-shell";

export default function FlashcardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
