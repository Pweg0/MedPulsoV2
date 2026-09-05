create or replace function excluir_reta_final_bloco(p_bloco_id uuid, p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from reta_final_blocos
  where id = p_bloco_id and user_id = p_user_id;
  return found;
end;
$$;

revoke execute on function excluir_reta_final_bloco(uuid, uuid) from public, anon;
grant execute on function excluir_reta_final_bloco(uuid, uuid) to authenticated;
