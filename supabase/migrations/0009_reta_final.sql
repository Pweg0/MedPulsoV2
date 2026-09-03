-- Perfil de incidência do Revalida. Os PDFs usados para gerar estes dados não
-- são importados como questões; apenas os temas e as correlações persistem.
create table if not exists reta_final_temas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  descricao text,
  palavras_chave text[] not null default '{}',
  ocorrencias integer not null default 0,
  total_provas integer not null default 0,
  prevalencia numeric(5,2) not null default 0,
  atualizado_em timestamptz not null default now()
);

create table if not exists reta_final_questoes (
  id uuid primary key default gen_random_uuid(),
  questao_id uuid not null unique references questoes(id) on delete cascade,
  tema_id uuid not null references reta_final_temas(id) on delete cascade,
  pontuacao numeric(8,2) not null default 0,
  prevalencia numeric(5,2) not null default 0,
  justificativa text,
  atualizado_em timestamptz not null default now()
);

create index if not exists reta_final_questoes_score_idx
  on reta_final_questoes (pontuacao desc, prevalencia desc);

alter table reta_final_temas enable row level security;
alter table reta_final_questoes enable row level security;

create policy "reta final temas leitura autenticada"
  on reta_final_temas for select to authenticated using (true);
create policy "reta final questoes leitura autenticada"
  on reta_final_questoes for select to authenticated using (true);

create or replace function buscar_reta_final(
  p_user_id uuid,
  p_limit integer default 50,
  p_apenas_nao_respondidas boolean default false
)
returns table (
  id uuid,
  ano integer,
  instituicao text,
  disciplina text,
  enunciado text,
  alternativas jsonb,
  comentario_geral text,
  fonte_url text,
  explicacao_ia jsonb,
  explicacao_gerada_em timestamptz,
  created_at timestamptz,
  prevalencia numeric,
  tema text,
  justificativa text
)
language sql stable security invoker
as $$
  select q.id, q.ano, q.instituicao, q.disciplina, q.enunciado,
    q.alternativas, q.comentario_geral, q.fonte_url, q.explicacao_ia,
    q.explicacao_gerada_em, q.created_at, rf.prevalencia, rt.nome,
    rf.justificativa
  from reta_final_questoes rf
  join questoes q on q.id = rf.questao_id
  join reta_final_temas rt on rt.id = rf.tema_id
  where not p_apenas_nao_respondidas
    or not exists (
      select 1 from tentativas t
      where t.questao_id = q.id and t.user_id = p_user_id
    )
  order by rf.pontuacao desc, rf.prevalencia desc, q.id
  limit greatest(1, least(coalesce(p_limit, 50), 200));
$$;

-- Cruza temas com o banco existente usando palavras-chave e disciplina. A
-- operação é executada pelo script administrativo depois da análise da IA.
create or replace function correlacionar_reta_final(p_tema_id uuid default null)
returns integer
language plpgsql security definer
set search_path = public
as $$
declare total integer;
begin
  delete from reta_final_questoes where true;
  insert into reta_final_questoes (questao_id, tema_id, pontuacao, prevalencia, justificativa)
  select distinct on (q.id)
    q.id, rt.id,
    (matches.total * 10 + rt.prevalencia), rt.prevalencia,
    'Correlação por tema e palavras-chave da análise das provas anteriores.'
  from questoes q
  cross join lateral (
    select rt0.*, (
      select count(*) from unnest(rt0.palavras_chave) palavra
      where q.enunciado ilike '%' || palavra || '%'
         or coalesce(q.disciplina, '') ilike '%' || palavra || '%'
    ) as total
    from reta_final_temas rt0
    where p_tema_id is null or rt0.id = p_tema_id
    order by total desc, rt0.prevalencia desc
    limit 1
  ) matches
  join reta_final_temas rt on rt.id = matches.id
  where matches.total > 0
  order by q.id, matches.total desc, rt.prevalencia desc;
  get diagnostics total = row_count;
  return total;
end;
$$;

revoke execute on function correlacionar_reta_final(uuid) from public, anon, authenticated;
grant execute on function correlacionar_reta_final(uuid) to service_role;
