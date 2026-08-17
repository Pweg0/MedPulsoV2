import { createClient } from "@/lib/supabase/server";
import { TZ, weekdayIndex, dateKey } from "@/lib/date-utils";

const DAY_MS = 86400000;

export type DashboardData = {
  tableReady: boolean;
  totalRespondidas: number;
  totalDisponiveis: number;
  hoje: { respondidas: number; acertos: number };
  streakAtual: number;
  streakRecorde: number;
  semanaAtiva: boolean[]; // domingo..sábado
  historico: { data: string; respondidas: number; acertos: number }[];
};

function emptyData(totalDisponiveis: number, tableReady: boolean): DashboardData {
  return {
    tableReady,
    totalRespondidas: 0,
    totalDisponiveis,
    hoje: { respondidas: 0, acertos: 0 },
    streakAtual: 0,
    streakRecorde: 0,
    semanaAtiva: [false, false, false, false, false, false, false],
    historico: [],
  };
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createClient();

  const { count: totalDisponiveis } = await supabase
    .from("questoes")
    .select("*", { count: "exact", head: true });

  const { data: tentativas, error } = await supabase
    .from("tentativas")
    .select("questao_id, acertou, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !tentativas) {
    return emptyData(totalDisponiveis ?? 0, false);
  }

  const distinctQuestoes = new Set(tentativas.map((t) => t.questao_id));

  const byDate = new Map<string, { respondidas: number; acertos: number }>();
  for (const t of tentativas) {
    const k = dateKey(t.created_at);
    const entry = byDate.get(k) ?? { respondidas: 0, acertos: 0 };
    entry.respondidas++;
    if (t.acertou) entry.acertos++;
    byDate.set(k, entry);
  }

  const todayKey = dateKey(new Date().toISOString());
  const hoje = byDate.get(todayKey) ?? { respondidas: 0, acertos: 0 };

  function streakFrom(start: Date) {
    let streak = 0;
    const cursor = new Date(start);
    while (byDate.has(cursor.toLocaleDateString("en-CA", { timeZone: TZ }))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  let streakAtual = streakFrom(new Date());
  if (streakAtual === 0) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    streakAtual = streakFrom(yesterday);
  }

  const sortedDates = Array.from(byDate.keys()).sort();
  let streakRecorde = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sortedDates) {
    if (prev) {
      const diffDays = Math.round(
        (new Date(d + "T00:00:00").getTime() -
          new Date(prev + "T00:00:00").getTime()) /
          DAY_MS
      );
      run = diffDays === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    streakRecorde = Math.max(streakRecorde, run);
    prev = d;
  }
  streakRecorde = Math.max(streakRecorde, streakAtual);

  const now = new Date();
  const weekday = weekdayIndex(now);
  const semanaAtiva = [false, false, false, false, false, false, false];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - weekday + i);
    const k = d.toLocaleDateString("en-CA", { timeZone: TZ });
    semanaAtiva[i] = byDate.has(k);
  }

  return {
    tableReady: true,
    totalRespondidas: distinctQuestoes.size,
    totalDisponiveis: totalDisponiveis ?? 0,
    hoje,
    streakAtual,
    streakRecorde,
    semanaAtiva,
    historico: sortedDates
      .slice(-14)
      .reverse()
      .map((d) => ({ data: d, ...byDate.get(d)! })),
  };
}
