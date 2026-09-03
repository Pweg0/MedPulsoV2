-- Usa apenas temas presentes em pelo menos duas edições. Temas de uma única
-- prova não devem dominar a reta final e tornam a busca textual muito cara.
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
    q.id, matches.id, (matches.total * 10 + matches.prevalencia), matches.prevalencia,
    'Correlação por tema recorrente e palavras-chave da análise das provas anteriores.'
  from questoes q
  cross join lateral (
    select rt0.id, rt0.prevalencia, (
      select count(*) from unnest(rt0.palavras_chave) palavra
      where q.enunciado ilike '%' || palavra || '%'
         or coalesce(q.disciplina, '') ilike '%' || palavra || '%'
    ) as total
    from reta_final_temas rt0
    where (p_tema_id is null or rt0.id = p_tema_id)
      and rt0.prevalencia >= 14.3
    order by total desc, rt0.prevalencia desc
    limit 1
  ) matches
  where matches.total > 0
  order by q.id, matches.total desc, matches.prevalencia desc;
  get diagnostics total = row_count;
  return total;
end;
$$;

revoke execute on function correlacionar_reta_final(uuid) from public, anon, authenticated;
grant execute on function correlacionar_reta_final(uuid) to service_role;
