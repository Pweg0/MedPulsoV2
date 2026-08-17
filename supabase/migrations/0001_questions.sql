create extension if not exists "pgcrypto";

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  subarea text,
  banca text,
  prova text,
  ano int,
  statement text not null,
  alternatives jsonb not null,
  source_url text,
  created_at timestamptz not null default now()
);

create index if not exists questions_area_idx on questions (area);
create index if not exists questions_prova_idx on questions (prova);

alter table questions enable row level security;

create policy "questions are readable by anyone"
  on questions for select
  using (true);
