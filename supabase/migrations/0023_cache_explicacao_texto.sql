alter table questoes
  add column if not exists explicacao_texto_ia text,
  add column if not exists explicacao_tudo_ia text,
  add column if not exists explicacao_texto_gerada_em timestamptz,
  add column if not exists explicacao_tudo_gerada_em timestamptz;

alter table simulado_questoes
  add column if not exists explicacao_texto_ia text,
  add column if not exists explicacao_tudo_ia text,
  add column if not exists explicacao_texto_gerada_em timestamptz,
  add column if not exists explicacao_tudo_gerada_em timestamptz;
