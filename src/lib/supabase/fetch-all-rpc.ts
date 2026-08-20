import type { SupabaseClient } from "@supabase/supabase-js";

// Supabase limita cada resposta a 1000 linhas por padrão (db max rows) —
// funções que retornam mais que isso (ex: disciplina_counts, com 8k+
// linhas) precisam paginar via .range() pra trazer tudo.
export async function fetchAllRpc<T>(
  supabase: SupabaseClient,
  fn: string
): Promise<T[]> {
  const todas: T[] = [];
  let from = 0;
  const tamanho = 1000;

  while (true) {
    const { data, error } = await supabase.rpc(fn).range(from, from + tamanho - 1);
    if (error || !data) break;
    todas.push(...(data as T[]));
    if (data.length < tamanho) break;
    from += tamanho;
  }

  return todas;
}
