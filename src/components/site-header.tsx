"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useAuth } from "@/components/auth/auth-provider";

const links = [
  { href: "/#recursos", label: "Recursos" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/precos", label: "Preços" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <Container className="flex h-18 items-center justify-between py-3.5">
        <Link href="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {user && (
            <Link
              href="/estudar"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Estudar
            </Link>
          )}
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {user ? (
            <>
              <Button href="/dashboard" variant="ghost" size="sm">
                {user.email}
              </Button>
              <Button variant="secondary" size="sm" onClick={signOut}>
                <LogOut size={15} /> Sair
              </Button>
            </>
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm">
                Entrar
              </Button>
              <Button href="/cadastro" variant="primary" size="sm">
                Começar grátis
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border-strong text-text-primary"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </Container>

      {open && (
        <div className="border-t border-border bg-bg md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {user && (
              <Link
                href="/estudar"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-inset hover:text-text-primary"
              >
                Estudar
              </Link>
            )}
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-inset hover:text-text-primary"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
              {user ? (
                <>
                  <Button href="/dashboard" variant="secondary" size="sm">
                    {user.email}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut size={15} /> Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button href="/login" variant="secondary" size="sm">
                    Entrar
                  </Button>
                  <Button href="/cadastro" variant="primary" size="sm">
                    Começar grátis — 7 dias
                  </Button>
                </>
              )}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
