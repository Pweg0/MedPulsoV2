import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MedPulso.ia — Aprovação em residência médica com dados",
  description:
    "Banco de questões comentadas de ENARE, ENAMED e Revalida com explicações baseadas nas diretrizes do Ministério da Saúde, dashboard de desempenho por área e trilha de estudo com IA. 7 dias grátis.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${jakarta.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <AuthProvider initialUser={user}>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
