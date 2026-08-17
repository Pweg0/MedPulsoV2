export type Alternativa = {
  letra: string;
  texto: string;
  correta: boolean;
  explicacao?: string;
};

export type Questao = {
  id: string;
  ano: number | null;
  instituicao: string | null;
  disciplina: string | null;
  enunciado: string;
  alternativas: Alternativa[];
  comentario_geral: string | null;
  fonte_url: string | null;
  explicacao_ia?: unknown | null;
  explicacao_gerada_em?: string | null;
  created_at: string;
};
