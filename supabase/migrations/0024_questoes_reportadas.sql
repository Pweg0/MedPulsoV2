create table if not exists questoes_reportadas (
  id uuid primary key default gen_random_uuid(),
  questao_id uuid not null references questoes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  motivo text not null default 'Outro',
  status text not null default 'pendente' check (status in ('pendente', 'em_revisao', 'resolvida', 'descartada')),
  created_at timestamptz not null default now(),
  unique (questao_id, user_id)
);

create index if not exists questoes_reportadas_status_idx
  on questoes_reportadas (status, created_at desc);

alter table questoes_reportadas enable row level security;

create policy "usuarios reportam questoes"
  on questoes_reportadas for insert to authenticated
  with check (auth.uid() = user_id);

create policy "usuarios veem seus proprios reportes"
  on questoes_reportadas for select to authenticated
  using (auth.uid() = user_id);
