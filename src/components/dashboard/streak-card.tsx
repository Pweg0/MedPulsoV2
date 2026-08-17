"use client";

import { useEffect, useState } from "react";
import { Flame, Trophy } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useMounted } from "@/lib/use-mounted";
import { TZ, weekdayIndex } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

function greetingFor(hour: number) {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function useBrasiliaClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}

export function StreakCard({
  streakAtual,
  streakRecorde,
  semanaAtiva,
}: {
  streakAtual: number;
  streakRecorde: number;
  semanaAtiva: boolean[];
}) {
  const { user } = useAuth();
  const mounted = useMounted();
  const now = useBrasiliaClock();

  const firstName =
    ((user?.user_metadata?.full_name as string) || user?.email || "").split(
      " "
    )[0] || "";

  const hour = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", hour12: false }).format(now)
  );
  const timeStr = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
  const dateStr = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(now);
  const todayWeekday = weekdayIndex(now);

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-bg-elevated p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
          Semana
        </span>
        <div className="mt-2 flex gap-1.5">
          {WEEKDAY_LABELS.map((label, i) => (
            <div
              key={i}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md font-mono text-[10px]",
                i === todayWeekday
                  ? "bg-accent text-on-accent"
                  : semanaAtiva[i]
                    ? "bg-vital-500/20 text-vital"
                    : "bg-bg-inset text-text-tertiary"
              )}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center sm:text-left">
        <p className="font-display text-lg text-text-primary">
          {mounted ? greetingFor(hour) : "Olá"}
          {firstName ? `, ${firstName}` : ""}!
        </p>
        <p className="text-xs capitalize text-text-tertiary">
          {mounted ? dateStr : ""}
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="flex items-center justify-center gap-1 font-display text-xl text-accent">
            <Flame size={18} /> {streakAtual}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
            atual
          </p>
        </div>
        <div className="text-center">
          <p className="flex items-center justify-center gap-1 font-display text-xl text-amber-500">
            <Trophy size={18} /> {streakRecorde}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
            recorde
          </p>
        </div>
        <div className="text-center">
          <p className="font-mono text-xl text-text-primary">
            {mounted ? timeStr : "--:--"}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
            Brasília
          </p>
        </div>
      </div>
    </div>
  );
}
