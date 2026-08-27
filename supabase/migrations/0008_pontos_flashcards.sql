alter table tentativas
  add column if not exists avaliacao_pontos jsonb,
  add column if not exists proxima_revisao_em timestamptz;

create policy "usuarios atualizam suas proprias tentativas"
  on tentativas for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists tema_dominio (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tema text not null,
  score numeric not null default 0,
  questoes_avaliadas integer not null default 0,
  atualizado_em timestamptz not null default now(),
  unique (user_id, tema)
);

alter table tema_dominio enable row level security;

create policy "usuarios veem seu dominio"
  on tema_dominio for select
  using (auth.uid() = user_id);

create policy "usuarios inserem seu dominio"
  on tema_dominio for insert
  with check (auth.uid() = user_id);

create policy "usuarios atualizam seu dominio"
  on tema_dominio for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  questao_id uuid not null references questoes (id) on delete cascade,
  tentativa_id uuid references tentativas (id) on delete set null,
  area_grande text not null,
  frente text not null,
  verso text not null,
  revisado_em timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, questao_id)
);

create index if not exists flashcards_user_area_idx on flashcards (user_id, area_grande);

alter table flashcards enable row level security;

create policy "usuarios veem seus flashcards"
  on flashcards for select
  using (auth.uid() = user_id);

create policy "usuarios inserem seus flashcards"
  on flashcards for insert
  with check (auth.uid() = user_id);

create policy "usuarios atualizam seus flashcards"
  on flashcards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
