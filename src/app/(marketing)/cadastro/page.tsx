import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Criar conta — MedPulso.ia",
  description: "Crie sua conta grátis no MedPulso.ia. 7 dias de acesso completo, sem cartão de crédito.",
};

export default function CadastroPage() {
  return (
    <AuthLayout
      eyebrow="Cadastro"
      headline="Sua próxima prova pode ser a aprovação."
    >
      <SignupForm />
    </AuthLayout>
  );
}
