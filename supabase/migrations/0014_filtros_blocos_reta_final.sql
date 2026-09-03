create or replace function buscar_reta_final(
  p_user_id uuid,
  p_limit integer default 50,
  p_apenas_nao_respondidas boolean default false,
  p_apenas_erradas boolean default false
)
returns table (
  id uuid, ano integer, instituicao text, disciplina text, enunciado text,
  alternativas jsonb, comentario_geral text, fonte_url text, explicacao_ia jsonb,
  explicacao_gerada_em timestamptz, created_at timestamptz, prevalencia numeric,
  tema text, justificativa text
)
language sql stable security invoker
as $$
  select q.id, q.ano, q.instituicao, q.disciplina, q.enunciado, q.alternativas,
    q.comentario_geral, q.fonte_url, q.explicacao_ia, q.explicacao_gerada_em,
    q.created_at, rf.prevalencia, rt.nome, rf.justificativa
  from reta_final_questoes rf
  join questoes q on q.id = rf.questao_id
  join reta_final_temas rt on rt.id = rf.tema_id
  where (not p_apenas_nao_respondidas or not exists (
    select 1 from tentativas t where t.questao_id = q.id and t.user_id = p_user_id
  ))
  and (not p_apenas_erradas or exists (
    select 1 from tentativas t where t.questao_id = q.id and t.user_id = p_user_id and not t.acertou
  ))
  order by rf.pontuacao desc, rf.prevalencia desc, q.id
  limit greatest(1, least(coalesce(p_limit, 50), 200));
$$;
