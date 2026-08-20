-- Funções de apoio pro filtro de /estudar (ano e banca/instituição).
-- SECURITY DEFINER não é necessário: só leem dados já públicos via RLS de select.

create or replace function distinct_anos()
returns table(ano int)
language sql
stable
as $$
  select distinct ano
  from questoes
  where ano is not null
  order by ano desc;
$$;

create or replace function distinct_instituicoes()
returns table(instituicao text)
language sql
stable
as $$
  select distinct instituicao
  from questoes
  where instituicao is not null
    -- linhas de lixo que vazaram da fonte original (não são nome de instituição)
    and instituicao not in (
      'Desconto inscrição para sócios.',
      'Órgão',
      'Região é Estadual pois tem hospitais em mais uma cidade.',
      'Acredito que o Hospital foi fechado!'
    )
  order by instituicao;
$$;
