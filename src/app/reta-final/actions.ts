"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { createClient } from "@/lib/supabase/server";

export async function excluirBloco(formData: FormData) {
  const blocoId = formData.get("blocoId");
  if (typeof blocoId !== "string" || !blocoId) return;

  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("excluir_reta_final_bloco", {
    p_bloco_id: blocoId,
    p_user_id: user.id,
  });
  if (error) throw new Error("Não foi possível apagar o bloco.");

  revalidatePath("/reta-final");
}
