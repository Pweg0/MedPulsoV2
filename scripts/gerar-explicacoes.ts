// Uso: npx tsx --env-file=.env.local scripts/gerar-explicacoes.ts [quantidade]
//
// Gera e salva a explicação por IA (mesmo pipeline de /api/explicar) pra N
// questões do banco que ainda não têm `explicacao_ia`, uma por vez, com log
// de tempo por questão e total no final. Serve pra pré-popular o cache antes
// do aluno chegar na questão.

import { createClient } from "@supabase/supabase-js";
import { explicarQuestaoIA } from "../src/lib/ai-explicar";
import type { ExplicacaoIA } from "../src/lib/gemini";
import type { Alternativa } from "../src/lib/supabase/questoes";

const quantidade = Number(process.argv[2]) || 10;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no ambiente (.env.local)."
  );
  process.exit(1);
}

if (!process.env.AI_ENDPOINT || !process.env.AI_API_KEY) {
  console.error("Faltam AI_ENDPOINT e/ou AI_API_KEY no ambiente (.env.local).");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

function montarComentario(explicacao: ExplicacaoIA) {
  const partes: string[] = [];
  if (explicacao.pegadinha) partes.push(explicacao.pegadinha);
  if (explicacao.nota_de_atualizacao) {
    partes.push(`Atualização: ${explicacao.nota_de_atualizacao}`);
  }
  return partes.join("\n\n");
}

async function main() {
  console.log(`Buscando ${quantidade} questões sem explicacao_ia...`);
  const { data: questoes, error } = await supabase
    .from("questoes")
    .select("*")
    .is("explicacao_ia", null)
    .limit(quantidade);

  if (error) {
    console.error("Erro ao buscar questões:", error.message);
    process.exit(1);
  }
  if (!questoes || questoes.length === 0) {
    console.log("Nenhuma questão pendente de explicação.");
    return;
  }

  console.log(`${questoes.length} questões encontradas. Gerando...\n`);
  const inicioTotal = Date.now();
  let sucesso = 0;
  let falhas = 0;

  for (const [i, questao] of questoes.entries()) {
    const inicio = Date.now();
    process.stdout.write(
      `[${i + 1}/${questoes.length}] ${questao.id} — ${(questao.enunciado as string).slice(0, 60)}... `
    );

    try {
      const explicacao = await explicarQuestaoIA({
        instituicao: questao.instituicao,
        ano: questao.ano,
        enunciado: questao.enunciado,
        alternativas: (questao.alternativas as Alternativa[]).map((a) => ({
          letra: a.letra,
          texto: a.texto,
          correta: a.correta,
        })),
        temFigura: !!questao.tem_figura,
      });

      const refutacaoPorLetra = new Map(
        explicacao.refutacoes.map((r) => [r.letra, r.erro])
      );
      const novasAlternativas: Alternativa[] = (
        questao.alternativas as Alternativa[]
      ).map((a) => ({
        ...a,
        explicacao: a.correta
          ? explicacao.por_que_correta
          : refutacaoPorLetra.get(a.letra) || a.explicacao,
      }));

      const { error: updateError } = await supabase
        .from("questoes")
        .update({
          alternativas: novasAlternativas,
          comentario_geral: montarComentario(explicacao) || questao.comentario_geral,
          explicacao_ia: explicacao,
          explicacao_gerada_em: new Date().toISOString(),
          disciplina: questao.disciplina ?? explicacao.area,
        })
        .eq("id", questao.id);

      if (updateError) throw new Error(updateError.message);

      sucesso++;
      console.log(`ok (${((Date.now() - inicio) / 1000).toFixed(1)}s)`);
    } catch (e) {
      falhas++;
      console.log(`FALHOU (${e instanceof Error ? e.message : e})`);
    }
  }

  const totalSeg = (Date.now() - inicioTotal) / 1000;
  console.log(
    `\nConcluído: ${sucesso} ok, ${falhas} falharam, em ${totalSeg.toFixed(1)}s (média ${(totalSeg / questoes.length).toFixed(1)}s/questão).`
  );
}

main();
