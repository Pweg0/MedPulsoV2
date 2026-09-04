import { createAdminClient } from "@/lib/supabase/admin";

export async function getTotalUsuarios() {
  const { data, error } = await createAdminClient().auth.admin.listUsers({
    page: 1,
    perPage: 1,
  });
  if (error) return null;
  return data.total ?? null;
}
