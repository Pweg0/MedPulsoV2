"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2, CircleCheck, CircleAlert, Mail } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/auth/google-icon";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "check-email">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError("Backend de autenticação ainda não configurado.");
      return;
    }

    setStatus("loading");

    const form = new FormData(e.currentTarget);
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(
        error.message === "User already registered"
          ? "Esse e-mail já tem uma conta. Tente entrar."
          : error.message
      );
      setStatus("idle");
      return;
    }

    if (data.session) {
      setStatus("done");
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setStatus("check-email");
  }

  async function handleGoogle() {
    if (!isSupabaseConfigured) {
      setError("Backend de autenticação ainda não configurado.");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (status === "check-email") {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Mail size={22} />
        </div>
        <h1 className="mt-5 font-display text-2xl tracking-tight text-text-primary">
          Confirme seu e-mail
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          Enviamos um link de confirmação. Clique nele para ativar sua conta
          e começar os 7 dias grátis.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-text-primary">
        Comece seus 7 dias grátis.
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        Sem cartão de crédito. Cancele quando quiser.
      </p>

      <button
        type="button"
        onClick={handleGoogle}
        className="mt-7 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-border-strong text-sm font-medium text-text-primary transition-colors hover:border-accent cursor-pointer"
      >
        <GoogleIcon className="h-4.5 w-4.5" />
        Cadastrar com Google
      </button>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
          ou
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" name="name" type="text" placeholder="Seu nome" required />
        </div>

        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" placeholder="voce@email.com" required />
        </div>

        <div>
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo de 8 caracteres"
              required
              minLength={8}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="flex items-start gap-2 rounded-xl border border-coral-500/30 bg-coral-500/10 p-3 text-xs text-text-secondary">
            <CircleAlert size={15} className="mt-0.5 shrink-0 text-accent" />
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={status !== "idle"}
          className="mt-2 w-full"
        >
          {status === "loading" || status === "done" ? (
            status === "done" ? (
              <>
                <CircleCheck size={18} /> Conta criada
              </>
            ) : (
              <Loader2 size={18} className="animate-spin" />
            )
          ) : (
            <>
              Criar conta grátis <ArrowRight size={18} />
            </>
          )}
        </Button>
        <p className="text-center text-[11px] leading-relaxed text-text-tertiary">
          Ao criar sua conta, você concorda com os{" "}
          <Link href="#" className="underline hover:text-text-secondary">
            Termos de uso
          </Link>{" "}
          e a{" "}
          <Link href="#" className="underline hover:text-text-secondary">
            Política de privacidade
          </Link>
          .
        </p>
      </form>

      <p className="mt-8 text-center text-sm text-text-secondary">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-accent hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
