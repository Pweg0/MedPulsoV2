create index if not exists questoes_reta_final_search_idx
  on questoes using gin (
    to_tsvector('portuguese'::regconfig, coalesce(enunciado, '') || ' ' || coalesce(disciplina, ''))
  );

create or replace function correlacionar_reta_final(p_tema_id uuid default null)
returns integer
language plpgsql security definer
set search_path = public
as $$
declare
  tema record;
  consulta tsquery;
  total integer;
begin
  delete from reta_final_questoes where true;

  for tema in
    select id, nome, prevalencia, palavras_chave
    from reta_final_temas
    where (p_tema_id is null or id = p_tema_id)
      and prevalencia >= 14.3
  loop
    consulta := websearch_to_tsquery('portuguese', array_to_string(tema.palavras_chave, ' OR '));
    insert into reta_final_questoes (questao_id, tema_id, pontuacao, prevalencia, justificativa)
    select q.id, tema.id,
      (ts_rank(
        to_tsvector('portuguese'::regconfig, coalesce(q.enunciado, '') || ' ' || coalesce(q.disciplina, '')),
        consulta
      ) * 100 + tema.prevalencia),
      tema.prevalencia,
      'Correlação textual indexada com o tema recorrente: ' || tema.nome || '.'
    from questoes q
    where to_tsvector('portuguese'::regconfig, coalesce(q.enunciado, '') || ' ' || coalesce(q.disciplina, '')) @@ consulta
    on conflict (questao_id) do update
      set tema_id = excluded.tema_id,
          pontuacao = excluded.pontuacao,
          prevalencia = excluded.prevalencia,
          justificativa = excluded.justificativa,
          atualizado_em = now()
      where excluded.pontuacao > reta_final_questoes.pontuacao;
  end loop;

  select count(*) into total from reta_final_questoes;
  return total;
end;
$$;

revoke execute on function correlacionar_reta_final(uuid) from public, anon, authenticated;
grant execute on function correlacionar_reta_final(uuid) to service_role;
