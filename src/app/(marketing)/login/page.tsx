import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar — MedPulso.ia",
  description: "Acesse sua conta MedPulso.ia e continue sua trilha de estudo para residência médica.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Acesso"
      headline="Onde aprovação vira rotina, não sorte."
    >
      <LoginForm />
    </AuthLayout>
  );
}
