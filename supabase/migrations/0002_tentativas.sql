create table if not exists tentativas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  questao_id uuid not null references questoes (id) on delete cascade,
  resposta_letra text not null,
  acertou boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists tentativas_user_idx on tentativas (user_id);
create index if not exists tentativas_questao_idx on tentativas (questao_id);

alter table tentativas enable row level security;

create policy "usuarios inserem suas proprias tentativas"
  on tentativas for insert
  with check (auth.uid() = user_id);

create policy "usuarios veem suas proprias tentativas"
  on tentativas for select
  using (auth.uid() = user_id);
