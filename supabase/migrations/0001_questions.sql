create extension if not exists "pgcrypto";

create table if not exists questoes (
  id uuid primary key default gen_random_uuid(),

  ano int,
  instituicao text,       -- banca / prova organizadora
  disciplina text,        -- ex: "Cirurgia", "Cirurgia > Ortopedia"
  enunciado text not null,
  alternativas jsonb not null,   -- [{ letra, texto, correta, explicacao }]
  comentario_geral text,
  fonte_url text,          -- link do PDF/fonte oficial, para auditoria

  -- impressão digital do conteúdo: mesma questão reimportada cai no
  -- mesmo fingerprint e é ignorada, sem depender de ID de terceiro
  fingerprint text generated always as (
    md5(coalesce(instituicao, '') || coalesce(ano::text, '') || enunciado)
  ) stored,

  created_at timestamptz not null default now(),

  unique (fingerprint)
);

create index if not exists questoes_disciplina_idx on questoes (disciplina);
create index if not exists questoes_instituicao_idx on questoes (instituicao);
create index if not exists questoes_ano_idx on questoes (ano);

alter table questoes enable row level security;

create policy "questoes_leitura_publica"
  on questoes for select
  using (true);
