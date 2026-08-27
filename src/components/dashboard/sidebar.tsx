"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpenCheck,
  FileText,
  GraduationCap,
  CalendarDays,
  Layers,
  NotebookPen,
  LineChart,
  Menu,
  X,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, live: true },
  { href: "/estudar", label: "Questões", icon: BookOpenCheck, live: true },
  { href: "/simulados", label: "Simulados", icon: FileText, live: true },
  { href: "#", label: "Material de Apoio", icon: GraduationCap, live: false },
  { href: "#", label: "Cronograma", icon: CalendarDays, live: false },
  { href: "/flashcards", label: "Flashcards", icon: Layers, live: true },
  { href: "/revisao", label: "Caderno de Revisão", icon: NotebookPen, live: true },
  { href: "#", label: "Progresso", icon: LineChart, live: false },
];

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = item.live && pathname === item.href;
        const Icon = item.icon;

        if (!item.live) {
          return (
            <span
              key={item.label}
              className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-2.5 text-sm text-text-tertiary/60"
            >
              <span className="flex items-center gap-3">
                <Icon size={17} />
                {item.label}
              </span>
              <span className="rounded-full bg-bg-inset px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-tertiary">
                em breve
              </span>
            </span>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent/10 text-accent"
                : "text-text-secondary hover:bg-bg-inset hover:text-text-primary"
            )}
          >
            <Icon size={17} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserFooter() {
  const { user, signOut } = useAuth();

  return (
    <div className="border-t border-border pt-4">
      <div className="flex items-center justify-between px-1">
        <ThemeToggle />
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-text-tertiary transition-colors hover:text-text-primary"
        >
          Ver site <ExternalLink size={12} />
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-bg-inset p-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 font-display text-sm text-accent">
          {(user?.user_metadata?.full_name as string)?.[0]?.toUpperCase() ??
            user?.email?.[0]?.toUpperCase() ??
            "?"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-text-primary">
            {(user?.user_metadata?.full_name as string) || "Sua conta"}
          </p>
          <p className="truncate text-[11px] text-text-tertiary">
            {user?.email}
          </p>
        </div>
        <button
          type="button"
          onClick={signOut}
          aria-label="Sair"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-bg hover:text-coral-500 cursor-pointer"
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-bg-elevated p-5 lg:flex">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <div className="mt-8 flex-1 overflow-y-auto">
          <NavList pathname={pathname} />
        </div>
        <UserFooter />
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-bg/90 p-4 backdrop-blur-md lg:hidden">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <button
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border-strong text-text-primary"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-30 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-72 flex-col bg-bg-elevated p-5">
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              <Logo />
            </Link>
            <div className="mt-8 flex-1 overflow-y-auto">
              <NavList pathname={pathname} onNavigate={() => setOpen(false)} />
            </div>
            <UserFooter />
          </aside>
        </div>
      )}
    </>
  );
}
