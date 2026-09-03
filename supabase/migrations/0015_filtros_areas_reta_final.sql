alter table reta_final_temas add column if not exists area_grande text not null default 'Clínica Médica';

update reta_final_temas set area_grande = case
  when nome ilike any (array['%obst%','%gesta%','%parto%','%puerp%','%ginec%','%contracep%','%sexual%','%colo uterino%','%mama%','%climatério%','%climaterio%','%HPV%']) then 'Ginecologia e Obstetrícia'
  when nome ilike any (array['%pediatr%','%neonat%','%infân%','%infan%','%criança%','%crianca%','%aleitamento%','%crescimento%','%desenvolvimento infantil%']) then 'Pediatria'
  when nome ilike any (array['%trauma%','%cirurg%','%queimadura%','%abdome%','%perioper%','%apendic%','%hérnia%','%hernia%','%ortopedia%','%vascular%']) then 'Cirurgia e Trauma'
  when nome ilike any (array['%SUS%','%atenção primária%','%atencao primaria%','%epidemi%','%vigilância%','%vigilancia%','%saúde pública%','%saude publica%','%ética%','%etica%','%violência%','%violencia%','%trabalh%']) then 'Medicina Preventiva e Saúde Coletiva'
  else 'Clínica Médica'
end;

create index if not exists reta_final_temas_area_idx on reta_final_temas (area_grande);

create or replace function buscar_reta_final(
  p_user_id uuid,
  p_limit integer default 50,
  p_apenas_nao_respondidas boolean default false,
  p_apenas_erradas boolean default false,
  p_tema_ids uuid[] default null,
  p_area_grandes text[] default null,
  p_randomizar boolean default true
)
returns table (
  id uuid, ano integer, instituicao text, disciplina text, enunciado text,
  alternativas jsonb, comentario_geral text, fonte_url text, explicacao_ia jsonb,
  explicacao_gerada_em timestamptz, created_at timestamptz, prevalencia numeric,
  tema text, justificativa text
)
language sql stable security invoker
as $$
  with base as (
    select q.*, rf.pontuacao, rf.prevalencia, rt.nome as tema, rf.justificativa,
      case when p_tema_ids is not null then rt.id::text else rt.area_grande end as grupo
    from reta_final_questoes rf
    join questoes q on q.id = rf.questao_id
    join reta_final_temas rt on rt.id = rf.tema_id
    where (p_tema_ids is null or rt.id = any(p_tema_ids))
      and (p_area_grandes is null or rt.area_grande = any(p_area_grandes))
      and (not p_apenas_nao_respondidas or not exists (
        select 1 from tentativas t where t.questao_id = q.id and t.user_id = p_user_id
      ))
      and (not p_apenas_erradas or exists (
        select 1 from tentativas t where t.questao_id = q.id and t.user_id = p_user_id and not t.acertou
      ))
  ), ranked as (
    select base.*, row_number() over (
      partition by grupo
      order by case when p_randomizar then random() end, pontuacao desc, id
    ) as pos, count(*) over (partition by grupo) as total_grupo,
    (select count(distinct grupo) from base) as grupos
    from base
  )
  select id, ano, instituicao, disciplina, enunciado, alternativas,
    comentario_geral, fonte_url, explicacao_ia, explicacao_gerada_em,
    created_at, prevalencia, tema, justificativa
  from ranked
  where pos <= greatest(1, ceil(p_limit::numeric / greatest(grupos, 1)))
  order by case when p_randomizar then random() end, prevalencia desc, id
  limit greatest(1, least(coalesce(p_limit, 50), 200));
$$;
