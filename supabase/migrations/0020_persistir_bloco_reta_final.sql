create or replace function buscar_reta_final(
  p_user_id uuid,
  p_limit integer default 50,
  p_apenas_nao_respondidas boolean default false,
  p_apenas_erradas boolean default false,
  p_tema_ids uuid[] default null,
  p_area_grandes text[] default null,
  p_randomizar boolean default true,
  p_questao_ids uuid[] default null
)
returns table (
  id uuid, ano integer, instituicao text, disciplina text, enunciado text,
  alternativas jsonb, comentario_geral text, fonte_url text, explicacao_ia jsonb,
  explicacao_gerada_em timestamptz, created_at timestamptz, prevalencia numeric,
  tema text, justificativa text
)
language sql stable security invoker
as $$
  with candidatos as (
    select rf.questao_id, rf.pontuacao, rf.prevalencia, rt.nome as tema,
      rf.justificativa,
      case when p_tema_ids is not null then rt.id::text else rt.area_grande end as grupo
    from reta_final_questoes rf
    join reta_final_temas rt on rt.id = rf.tema_id
    where (p_questao_ids is null or rf.questao_id = any(p_questao_ids))
      and (p_tema_ids is null or rt.id = any(p_tema_ids))
      and (p_area_grandes is null or rt.area_grande = any(p_area_grandes))
      and (not p_apenas_nao_respondidas or not exists (
        select 1 from tentativas t where t.user_id = p_user_id and t.questao_id = rf.questao_id
      ))
      and (not p_apenas_erradas or exists (
        select 1 from tentativas t where t.user_id = p_user_id and t.questao_id = rf.questao_id and not t.acertou
      ))
  ), ranqueados as (
    select candidatos.*, row_number() over (
      partition by grupo
      order by case when p_randomizar then random() end, pontuacao desc, questao_id
    ) as pos
    from candidatos
  ), grupos as (
    select count(distinct grupo)::integer as total from candidatos
  ), primeiros as (
    select ranqueados.*
    from ranqueados, grupos
    where p_questao_ids is not null
       or pos <= greatest(1, ceil(p_limit::numeric / greatest(grupos.total, 1)))
  ), complementares as (
    select ranqueados.*
    from ranqueados
    where p_questao_ids is null
      and not exists (select 1 from primeiros p where p.questao_id = ranqueados.questao_id)
    order by case when p_randomizar then random() end, prevalencia desc, questao_id
    limit greatest(0, least(coalesce(p_limit, 50), 200) - (select count(*) from primeiros))
  ), selecionados as (
    select * from primeiros
    union all
    select * from complementares
  )
  select q.id, q.ano, q.instituicao, q.disciplina, q.enunciado, q.alternativas,
    q.comentario_geral, q.fonte_url, q.explicacao_ia, q.explicacao_gerada_em,
    q.created_at, selecionados.prevalencia, selecionados.tema, selecionados.justificativa
  from selecionados
  join questoes q on q.id = selecionados.questao_id
  order by case when p_randomizar then random() end, selecionados.prevalencia desc, q.id;
$$;
