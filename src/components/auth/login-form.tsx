"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2, CircleAlert } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/auth/google-icon";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
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
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error.message
      );
      setStatus("idle");
      return;
    }

    setStatus("done");
    router.push("/conta");
    router.refresh();
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

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-text-primary">
        Bem-vindo de volta.
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        Continue de onde parou na sua trilha de estudo.
      </p>

      <button
        type="button"
        onClick={handleGoogle}
        className="mt-7 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-border-strong text-sm font-medium text-text-primary transition-colors hover:border-accent cursor-pointer"
      >
        <GoogleIcon className="h-4.5 w-4.5" />
        Continuar com Google
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
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" placeholder="voce@email.com" required />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link
              href="#"
              className="mb-2 text-xs font-medium text-accent hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
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
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              Entrar <ArrowRight size={18} />
            </>
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-text-secondary">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-accent hover:underline">
          Comece grátis
        </Link>
      </p>
    </div>
  );
}
