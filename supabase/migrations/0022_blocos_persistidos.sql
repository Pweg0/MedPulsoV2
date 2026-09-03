create table if not exists reta_final_blocos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  numero integer not null,
  quantidade integer not null,
  questao_ids uuid[] not null,
  criado_em timestamptz not null default now()
);

create index if not exists reta_final_blocos_user_idx
  on reta_final_blocos (user_id, numero desc);

alter table reta_final_blocos enable row level security;

create policy "usuarios veem seus blocos da reta final"
  on reta_final_blocos for select to authenticated using (auth.uid() = user_id);
create policy "usuarios criam seus blocos da reta final"
  on reta_final_blocos for insert to authenticated with check (auth.uid() = user_id);

create or replace function listar_reta_final_blocos(p_user_id uuid)
returns table (
  id uuid,
  numero integer,
  quantidade integer,
  questao_ids uuid[],
  criado_em timestamptz,
  questoes_feitas bigint,
  acertos bigint,
  percentual numeric
)
language sql stable security invoker
as $$
  select b.id, b.numero, b.quantidade, b.questao_ids, b.criado_em,
    (select count(*) from unnest(b.questao_ids) qid
      where exists (select 1 from tentativas t where t.user_id = p_user_id and t.questao_id = qid)) as questoes_feitas,
    (select count(*) from unnest(b.questao_ids) qid
      where (select t.acertou from tentativas t where t.user_id = p_user_id and t.questao_id = qid order by t.created_at desc limit 1)) as acertos,
    coalesce(round(((select count(*) from unnest(b.questao_ids) qid
      where (select t.acertou from tentativas t where t.user_id = p_user_id and t.questao_id = qid order by t.created_at desc limit 1)) * 100.0) /
      nullif((select count(*) from unnest(b.questao_ids) qid where exists (select 1 from tentativas t where t.user_id = p_user_id and t.questao_id = qid)), 0), 0), 0) as percentual
  from reta_final_blocos b
  where b.user_id = p_user_id
  order by b.numero;
$$;
