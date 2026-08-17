// Usage: node --env-file=.env.local scripts/import-questions.mjs path/to/questoes.json
//
// Espera um array de questões nesse formato:
// {
//   "instituicao": "AC - Hospital Oftalmológico do Acre - HOA",
//   "disciplina": "Cirurgia",         // opcional
//   "ano": 2018,                       // opcional
//   "enunciado": "texto da questão...",
//   "alternativas": [
//     { "letra": "A", "texto": "...", "correta": false, "explicacao": "..." },
//     { "letra": "B", "texto": "...", "correta": true,  "explicacao": "..." }
//   ],
//   "comentario_geral": "...",         // opcional
//   "fonte_url": "https://..."         // opcional, link do PDF oficial
// }
//
// Reimportar o mesmo arquivo é seguro: cada questão gera um fingerprint
// (instituicao + ano + enunciado) com UNIQUE no banco, então duplicatas
// são ignoradas em vez de inseridas de novo.

import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const filePath = process.argv[2];
if (!filePath) {
  console.error("Uso: node --env-file=.env.local scripts/import-questions.mjs <arquivo.json>");
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

function validate(q, i) {
  const errors = [];
  if (!q.enunciado) errors.push("enunciado ausente");
  if (!Array.isArray(q.alternativas) || q.alternativas.length < 2) {
    errors.push("alternativas precisa ter ao menos 2 itens");
  } else {
    const corretas = q.alternativas.filter((a) => a.correta === true).length;
    if (corretas !== 1) {
      errors.push(`deveria ter exatamente 1 alternativa correta, encontrou ${corretas}`);
    }
    q.alternativas.forEach((a, ai) => {
      if (!a.letra) errors.push(`alternativa[${ai}] sem letra`);
      if (!a.texto) errors.push(`alternativa[${ai}] sem texto`);
    });
  }
  return errors.map((e) => `questão ${i}: ${e}`);
}

const raw = await readFile(filePath, "utf-8");
const questoes = JSON.parse(raw);

if (!Array.isArray(questoes)) {
  console.error("O JSON precisa ser um array de questões.");
  process.exit(1);
}

const allErrors = questoes.flatMap(validate);
if (allErrors.length > 0) {
  console.error(`${allErrors.length} erro(s) de validação — nada foi importado:\n`);
  allErrors.slice(0, 50).forEach((e) => console.error(" - " + e));
  if (allErrors.length > 50) console.error(`  ... e mais ${allErrors.length - 50}`);
  process.exit(1);
}

const rows = questoes.map((q) => ({
  instituicao: q.instituicao ?? null,
  disciplina: q.disciplina ?? null,
  ano: q.ano ?? null,
  enunciado: q.enunciado,
  alternativas: q.alternativas,
  comentario_geral: q.comentario_geral ?? null,
  fonte_url: q.fonte_url ?? null,
}));

const supabase = createClient(url, serviceKey);

const BATCH_SIZE = 500;
let processed = 0;

for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE);
  const { error } = await supabase
    .from("questoes")
    .upsert(batch, { onConflict: "fingerprint", ignoreDuplicates: true });

  if (error) {
    console.error(`Erro ao inserir lote ${i / BATCH_SIZE + 1}:`, error.message);
    console.error(`${processed} questões já foram processadas antes do erro.`);
    process.exit(1);
  }
  processed += batch.length;
  console.log(`${processed}/${rows.length} processadas...`);
}

console.log(`Concluído: ${processed} questões processadas (duplicatas foram ignoradas automaticamente).`);
