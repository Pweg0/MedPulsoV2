// Usage: node --env-file=.env.local scripts/import-questions.mjs path/to/questions.json
//
// Expects a JSON array of questions shaped like:
// {
//   "area": "Cardiologia",
//   "subarea": "Síndrome coronariana aguda",   // optional
//   "banca": "INEP",                            // optional
//   "prova": "ENAMED 2024",                      // optional
//   "ano": 2024,                                 // optional
//   "statement": "texto da questão...",
//   "alternatives": [
//     { "letter": "A", "text": "...", "correct": false, "explanation": "..." },
//     { "letter": "B", "text": "...", "correct": true,  "explanation": "..." }
//   ],
//   "sourceUrl": "https://..."                   // optional, for provenance
// }

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
  if (!q.area) errors.push("area ausente");
  if (!q.statement) errors.push("statement ausente");
  if (!Array.isArray(q.alternatives) || q.alternatives.length < 2) {
    errors.push("alternatives precisa ter ao menos 2 itens");
  } else {
    const correctCount = q.alternatives.filter((a) => a.correct === true).length;
    if (correctCount !== 1) {
      errors.push(`deveria ter exatamente 1 alternativa correta, encontrou ${correctCount}`);
    }
    q.alternatives.forEach((a, ai) => {
      if (!a.letter) errors.push(`alternativa[${ai}] sem letter`);
      if (!a.text) errors.push(`alternativa[${ai}] sem text`);
    });
  }
  return errors.map((e) => `questão ${i}: ${e}`);
}

const raw = await readFile(filePath, "utf-8");
const questions = JSON.parse(raw);

if (!Array.isArray(questions)) {
  console.error("O JSON precisa ser um array de questões.");
  process.exit(1);
}

const allErrors = questions.flatMap(validate);
if (allErrors.length > 0) {
  console.error(`${allErrors.length} erro(s) de validação — nada foi importado:\n`);
  allErrors.slice(0, 50).forEach((e) => console.error(" - " + e));
  if (allErrors.length > 50) console.error(`  ... e mais ${allErrors.length - 50}`);
  process.exit(1);
}

const rows = questions.map((q) => ({
  area: q.area,
  subarea: q.subarea ?? null,
  banca: q.banca ?? null,
  prova: q.prova ?? null,
  ano: q.ano ?? null,
  statement: q.statement,
  alternatives: q.alternatives,
  source_url: q.sourceUrl ?? null,
}));

const supabase = createClient(url, serviceKey);

const BATCH_SIZE = 500;
let inserted = 0;

for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE);
  const { error } = await supabase.from("questions").insert(batch);
  if (error) {
    console.error(`Erro ao inserir lote ${i / BATCH_SIZE + 1}:`, error.message);
    console.error(`${inserted} questões já foram inseridas antes do erro.`);
    process.exit(1);
  }
  inserted += batch.length;
  console.log(`${inserted}/${rows.length} importadas...`);
}

console.log(`Concluído: ${inserted} questões importadas.`);
