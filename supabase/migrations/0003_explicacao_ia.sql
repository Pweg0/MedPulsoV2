alter table questoes
  add column if not exists explicacao_ia jsonb,
  add column if not exists explicacao_gerada_em timestamptz;

-- gravação da explicação por IA é feita só pela service_role (rota de servidor),
-- então não é preciso policy de update pra usuários autenticados aqui.
