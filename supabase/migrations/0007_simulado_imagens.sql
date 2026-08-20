-- Upload manual de imagem por questão de simulado. A indexação via IA lê o
-- PDF como texto — figuras/gráficos/ECGs não saem no enunciado, então
-- precisam ser anexados à mão depois de indexar.

alter table simulado_questoes
  add column if not exists imagem_url text;

insert into storage.buckets (id, name, public)
values ('simulado-imagens', 'simulado-imagens', true)
on conflict (id) do nothing;

create policy "simulado imagens leitura publica"
  on storage.objects for select
  using (bucket_id = 'simulado-imagens');

create policy "usuarios autenticados sobem imagens de simulado"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'simulado-imagens');

create policy "usuarios autenticados atualizam imagens de simulado"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'simulado-imagens');
