import type { Alternativa } from "@/lib/supabase/questoes";

export type Simulado = {
  id: string;
  nome: string;
  instituicao: string | null;
  ano: number | null;
  numero_questoes: number;
  fonte_url: string | null;
  created_at: string;
};

export type SimuladoQuestao = {
  id: string;
  simulado_id: string;
  numero: number;
  enunciado: string;
  alternativas: Alternativa[];
  anulada: boolean;
  tem_figura: boolean;
  disciplina: string | null;
  explicacao_ia?: unknown | null;
  explicacao_gerada_em?: string | null;
  created_at: string;
};
