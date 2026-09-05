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
  await supabase
    .from("reta_final_blocos")
    .delete()
    .eq("id", blocoId)
    .eq("user_id", user.id);

  revalidatePath("/reta-final");
}
