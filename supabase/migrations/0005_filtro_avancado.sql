-- Suporte ao filtro avançado de /estudar: árvore de especialidade, banca e
-- ano com contagem real, mais busca/contagem combinando todos os filtros
-- (inclusive status da questão pro usuário logado: vista/resolvida/
-- acertada/errada).

create or replace function disciplina_counts()
returns table(disciplina text, total bigint)
language sql
stable
as $$
  select disciplina, count(*) as total
  from questoes
  where disciplina is not null
  group by disciplina
  order by disciplina;
$$;

create or replace function instituicao_counts()
returns table(instituicao text, total bigint)
language sql
stable
as $$
  select instituicao, count(*) as total
  from questoes
  where instituicao is not null
    and instituicao not in (
      'Desconto inscrição para sócios.',
      'Órgão',
      'Região é Estadual pois tem hospitais em mais uma cidade.',
      'Acredito que o Hospital foi fechado!'
    )
  group by instituicao
  order by total desc;
$$;

create or replace function ano_counts()
returns table(ano int, total bigint)
language sql
stable
as $$
  select ano, count(*) as total
  from questoes
  where ano is not null
  group by ano
  order by ano desc;
$$;

create index if not exists questoes_disciplina_idx on questoes (disciplina);
create index if not exists questoes_instituicao_idx on questoes (instituicao);
create index if not exists questoes_ano_idx on questoes (ano);

-- p_status: 'todas' | 'nao_vistas' | 'resolvidas' | 'acertadas' | 'erradas' | 'nao_acertadas'
create or replace function contar_questoes(
  p_anos int[] default null,
  p_bancas text[] default null,
  p_especialidades text[] default null,
  p_status text default 'todas',
  p_user_id uuid default null
)
returns bigint
language sql
stable
as $$
  select count(*)
  from questoes q
  where (p_anos is null or q.ano = any(p_anos))
    and (p_bancas is null or q.instituicao = any(p_bancas))
    and (
      p_especialidades is null
      or exists (
        select 1 from unnest(p_especialidades) as esp
        where q.disciplina = esp or q.disciplina like esp || ' > %'
      )
    )
    and (
      p_status = 'todas'
      or p_user_id is null
      or (p_status = 'nao_vistas' and not exists (
            select 1 from tentativas t where t.questao_id = q.id and t.user_id = p_user_id))
      or (p_status = 'resolvidas' and exists (
            select 1 from tentativas t where t.questao_id = q.id and t.user_id = p_user_id))
      or (p_status = 'acertadas' and exists (
            select 1 from tentativas t where t.questao_id = q.id and t.user_id = p_user_id and t.acertou))
      or (p_status = 'erradas' and exists (
            select 1 from tentativas t where t.questao_id = q.id and t.user_id = p_user_id and not t.acertou))
      or (p_status = 'nao_acertadas' and not exists (
            select 1 from tentativas t where t.questao_id = q.id and t.user_id = p_user_id and t.acertou))
    );
$$;

create or replace function buscar_questoes(
  p_anos int[] default null,
  p_bancas text[] default null,
  p_especialidades text[] default null,
  p_status text default 'todas',
  p_user_id uuid default null,
  p_limit int default 200
)
returns setof questoes
language sql
stable
as $$
  select q.*
  from questoes q
  where (p_anos is null or q.ano = any(p_anos))
    and (p_bancas is null or q.instituicao = any(p_bancas))
    and (
      p_especialidades is null
      or exists (
        select 1 from unnest(p_especialidades) as esp
        where q.disciplina = esp or q.disciplina like esp || ' > %'
      )
    )
    and (
      p_status = 'todas'
      or p_user_id is null
      or (p_status = 'nao_vistas' and not exists (
            select 1 from tentativas t where t.questao_id = q.id and t.user_id = p_user_id))
      or (p_status = 'resolvidas' and exists (
            select 1 from tentativas t where t.questao_id = q.id and t.user_id = p_user_id))
      or (p_status = 'acertadas' and exists (
            select 1 from tentativas t where t.questao_id = q.id and t.user_id = p_user_id and t.acertou))
      or (p_status = 'erradas' and exists (
            select 1 from tentativas t where t.questao_id = q.id and t.user_id = p_user_id and not t.acertou))
      or (p_status = 'nao_acertadas' and not exists (
            select 1 from tentativas t where t.questao_id = q.id and t.user_id = p_user_id and t.acertou))
    )
  order by q.id
  limit p_limit;
$$;
