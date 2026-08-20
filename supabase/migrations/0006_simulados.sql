-- Modo SIMULADO/TREINO: provas inteiras indexadas de PDF, guardadas à parte
-- do banco de questões principal (não compartilha linhas com `questoes`).

create table if not exists simulados (
  id uuid primary key default gen_random_uuid(),
  nome text not null,              -- ex: "Revalida 2024"
  instituicao text,                -- ex: "INEP"
  ano int,
  numero_questoes int not null default 0,
  fonte_url text,
  created_at timestamptz not null default now()
);

create table if not exists simulado_questoes (
  id uuid primary key default gen_random_uuid(),
  simulado_id uuid not null references simulados(id) on delete cascade,
  numero int not null,             -- posição na prova original (1..N)
  enunciado text not null,
  alternativas jsonb not null,     -- [{letra,texto,correta,explicacao}]
  anulada boolean not null default false,
  tem_figura boolean not null default false,
  disciplina text,
  explicacao_ia jsonb,
  explicacao_gerada_em timestamptz,
  created_at timestamptz not null default now(),

  unique (simulado_id, numero)
);

create index if not exists simulado_questoes_simulado_idx
  on simulado_questoes (simulado_id);

create table if not exists simulado_tentativas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  simulado_id uuid not null references simulados(id) on delete cascade,
  simulado_questao_id uuid not null references simulado_questoes(id) on delete cascade,
  resposta_letra text,
  acertou boolean,
  created_at timestamptz not null default now(),

  unique (user_id, simulado_questao_id)
);

create index if not exists simulado_tentativas_user_idx
  on simulado_tentativas (user_id);
create index if not exists simulado_tentativas_simulado_idx
  on simulado_tentativas (simulado_id);

alter table simulados enable row level security;
alter table simulado_questoes enable row level security;
alter table simulado_tentativas enable row level security;

create policy "simulados leitura publica"
  on simulados for select
  using (true);

create policy "simulado_questoes leitura publica"
  on simulado_questoes for select
  using (true);

create policy "usuarios inserem suas proprias simulado_tentativas"
  on simulado_tentativas for insert
  with check (auth.uid() = user_id);

create policy "usuarios atualizam suas proprias simulado_tentativas"
  on simulado_tentativas for update
  using (auth.uid() = user_id);

create policy "usuarios veem suas proprias simulado_tentativas"
  on simulado_tentativas for select
  using (auth.uid() = user_id);
