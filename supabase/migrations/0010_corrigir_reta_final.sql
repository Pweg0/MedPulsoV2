-- Permite reconstruir as correlações em execuções posteriores do analisador.
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
    q.id, rt.id, (matches.total * 10 + rt.prevalencia), rt.prevalencia,
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
