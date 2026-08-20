// Importa uma prova inteira indexada de PDF pro modo SIMULADO — tabelas
// `simulados` / `simulado_questoes`, completamente separadas do banco
// principal `questoes` (não compartilha linhas).
//
// Uso: node --env-file=.env.local scripts/import-simulado.mjs arquivo.json
//
// Aceita 3 formatos de entrada:
//   1. { "provas": [ {edicao, questoes:[...]}, ... ] }   (dados.json completo)
//   2. { "edicao": "...", "questoes": [...] }              (uma prova só)
//   3. [ {edicao, questoes:[...]}, ... ]                    (array de provas)
//
// Cada item de `questoes` no formato do indexador_revalida.py:
//   { num, enunciado, alternativas: {A:"...", B:"...", ...},
//     gabarito: "B", anulada: false, area, tem_figura }

import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const filePath = process.argv[2];
if (!filePath) {
  console.error(
    "Uso: node --env-file=.env.local scripts/import-simulado.mjs <arquivo.json>"
  );
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    "Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no ambiente (.env.local)."
  );
  process.exit(1);
}

const raw = await readFile(filePath, "utf-8");
const parsed = JSON.parse(raw);

const provas = Array.isArray(parsed)
  ? parsed
  : Array.isArray(parsed.provas)
    ? parsed.provas
    : [parsed];

function anoDaEdicao(edicao) {
  const m = String(edicao).match(/\d{4}/);
  return m ? Number(m[0]) : null;
}

function validarQuestao(q, i, edicao) {
  const erros = [];
  if (!q.enunciado) erros.push(`questão ${q.num ?? i}: enunciado ausente`);
  const letras = Object.keys(q.alternativas || {});
  if (letras.length < 2) {
    erros.push(`questão ${q.num ?? i}: precisa de ao menos 2 alternativas`);
  }
  if (!q.anulada && !letras.includes(q.gabarito)) {
    erros.push(
      `questão ${q.num ?? i}: gabarito "${q.gabarito}" não bate com nenhuma alternativa`
    );
  }
  return erros.map((e) => `[${edicao}] ${e}`);
}

const supabase = createClient(url, serviceKey);

for (const prova of provas) {
  const edicao = prova.edicao ?? "sem edição";
  const questoes = prova.questoes ?? [];

  const erros = questoes.flatMap((q, i) => validarQuestao(q, i, edicao));
  if (erros.length > 0) {
    console.error(`${erros.length} erro(s) de validação em "${edicao}" — pulando esta prova:\n`);
    erros.slice(0, 30).forEach((e) => console.error(" - " + e));
    if (erros.length > 30) console.error(`  ... e mais ${erros.length - 30}`);
    continue;
  }

  const nome = `Revalida ${edicao}`;

  const { data: existente } = await supabase
    .from("simulados")
    .select("id")
    .eq("nome", nome)
    .maybeSingle();

  let simuladoId = existente?.id;

  if (!simuladoId) {
    const { data: novo, error: erroInsert } = await supabase
      .from("simulados")
      .insert({
        nome,
        instituicao: "INEP",
        ano: anoDaEdicao(edicao),
        numero_questoes: questoes.length,
        fonte_url: prova.fonte_url ?? null,
      })
      .select("id")
      .single();

    if (erroInsert) {
      console.error(`Erro ao criar simulado "${nome}":`, erroInsert.message);
      continue;
    }
    simuladoId = novo.id;
    console.log(`Criado simulado "${nome}" (${questoes.length} questões).`);
  } else {
    console.log(`Simulado "${nome}" já existe — atualizando questões.`);
  }

  const rows = questoes.map((q) => {
    const alternativas = Object.entries(q.alternativas).map(([letra, texto]) => ({
      letra,
      texto,
      correta: !q.anulada && letra === q.gabarito,
      explicacao: "",
    }));

    return {
      simulado_id: simuladoId,
      numero: q.num,
      enunciado: q.enunciado,
      alternativas,
      anulada: !!q.anulada,
      tem_figura: !!q.tem_figura,
      disciplina: q.area ?? null,
    };
  });

  const { error: erroUpsert } = await supabase
    .from("simulado_questoes")
    .upsert(rows, { onConflict: "simulado_id,numero" });

  if (erroUpsert) {
    console.error(`Erro ao inserir questões de "${nome}":`, erroUpsert.message);
    continue;
  }

  console.log(`"${nome}": ${rows.length} questões importadas/atualizadas.`);
}

console.log("Concluído.");
