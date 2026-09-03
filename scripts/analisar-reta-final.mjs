// Analisa PDFs de provas sem importar suas questões.
// Uso: node --env-file=.env.local scripts/analisar-reta-final.mjs
import { readdir, readFile } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import { createClient } from "@supabase/supabase-js";

const pasta = join(process.cwd(), "reta-final-revalida");
const apiKey = process.env.RETA_FINAL_AI_API_KEY || process.env.AI_API_KEY;
const endpoint = process.env.RETA_FINAL_AI_ENDPOINT || process.env.AI_ENDPOINT;
const model = process.env.RETA_FINAL_AI_MODEL || "gpt-5.6-sol";

if (!apiKey || !endpoint || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Configure RETA_FINAL_AI_API_KEY/AI_API_KEY, RETA_FINAL_AI_ENDPOINT/AI_ENDPOINT e SUPABASE_SERVICE_ROLE_KEY.");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

if (process.argv.includes("--somente-correlacao")) {
  console.log("[CORRELAÇÃO] Reconstruindo seleção por lotes de temas...");
  const { data: temas, error: temasError } = await supabase
    .from("reta_final_temas").select("id, nome").gte("prevalencia", 14.3).order("prevalencia", { ascending: false });
  if (temasError) throw temasError;
  const { error: limpezaError } = await supabase.from("reta_final_questoes").delete().neq("questao_id", "00000000-0000-0000-0000-000000000000");
  if (limpezaError) throw limpezaError;
  for (const [indice, tema] of (temas || []).entries()) {
    console.log(`[CORRELAÇÃO] Tema ${indice + 1}/${temas.length}: ${tema.nome}`);
    const { error } = await supabase.rpc("correlacionar_reta_final", { p_tema_id: tema.id });
    if (error) throw error;
  }
  const { count, error: countError } = await supabase.from("reta_final_questoes").select("id", { count: "exact", head: true });
  if (countError) throw countError;
  console.log(`[CONCLUÍDO] ${count ?? 0} questões correlacionadas.`);
  process.exit(0);
}

const prompt = `Analise este caderno de prova do Revalida. NÃO transcreva questões.
Retorne somente JSON no formato {"edicao":"string","temas":[{"nome":"string","descricao":"string","palavras_chave":["string"],"ocorrencias":number}]}.
Identifique os temas clínicos efetivamente cobrados, agrupando sinônimos e variações em categorias canônicas. Retorne NO MÁXIMO 25 temas por edição: por exemplo, agrupe dengue, chikungunya e zika em "arboviroses"; pré-eclâmpsia, eclâmpsia e hipertensão gestacional em "síndromes hipertensivas da gestação"; e asma em "doenças respiratórias". ocorrencias é o número aproximado de questões da edição sobre o tema. Considere diagnóstico, conduta, prevenção e legislação do SUS quando forem o foco. Não crie temas genéricos como "medicina" e não crie um tema separado para cada diagnóstico raro.`;

function slugify(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function analisarArquivo(nome) {
  console.log(`[IA] Preparando ${nome}...`);
  const data = (await readFile(join(pasta, nome))).toString("base64");
  console.log(`[IA] Enviando ${nome} para ${model}...`);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: [{ type: "text", text: "Analise o PDF anexado." }, { type: "file", file: { filename: nome, file_data: `data:application/pdf;base64,${data}` } }] },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    }),
  });
  if (!response.ok) throw new Error(`${nome}: provedor de IA ${response.status} ${await response.text()}`);
  console.log(`[IA] Resposta recebida para ${nome}; interpretando temas...`);
  const json = await response.json();
  const text = json.choices?.[0]?.message?.content;
  const resultado = JSON.parse(text);
  console.log(`[IA] ${nome}: ${resultado.temas?.length ?? 0} temas identificados.`);
  return resultado;
}

const arquivos = (await readdir(pasta)).filter((nome) => extname(nome).toLowerCase() === ".pdf");
console.log(`[INÍCIO] ${arquivos.length} PDFs encontrados. Status: QUEUED -> PROCESSING`);
const porTema = new Map();
const edicoes = new Set();
for (const [indice, arquivo] of arquivos.entries()) {
  console.log(`[PROGRESSO] PDF ${indice + 1}/${arquivos.length}`);
  const analise = await analisarArquivo(arquivo);
  const edicao = slugify(analise.edicao || basename(arquivo, ".pdf"));
  if (edicoes.has(edicao)) {
    console.log(`[DUPLICADO] ${arquivo}: edição já analisada; não será contada novamente.`);
    continue;
  }
  edicoes.add(edicao);
  for (const tema of analise.temas || []) {
    const slug = slugify(tema.nome);
    if (!slug) continue;
    const atual = porTema.get(slug) || { slug, nome: tema.nome, descricao: tema.descricao || "", palavras_chave: new Set(), ocorrencias: 0, total_provas: 0 };
    atual.ocorrencias += Math.max(0, Number(tema.ocorrencias) || 0);
    atual.total_provas += 1;
    for (const palavra of tema.palavras_chave || []) atual.palavras_chave.add(String(palavra));
    porTema.set(slug, atual);
  }
}

const totalProvas = edicoes.size;
console.log(`[CONSOLIDAÇÃO] ${totalProvas} edições únicas e ${porTema.size} temas. Gravando prevalências...`);
const { error: limpezaError } = await supabase.from("reta_final_temas").delete().neq("slug", "");
if (limpezaError) throw limpezaError;
for (const tema of porTema.values()) {
  const prevalencia = totalProvas ? (tema.total_provas / totalProvas) * 100 : 0;
  const { error } = await supabase.from("reta_final_temas").upsert({
    slug: tema.slug, nome: tema.nome, descricao: tema.descricao,
    palavras_chave: [...tema.palavras_chave], ocorrencias: tema.ocorrencias,
    total_provas: totalProvas, prevalencia, atualizado_em: new Date().toISOString(),
  }, { onConflict: "slug" }).select("id").single();
  if (error) throw error;
  console.log(`${tema.nome}: ${prevalencia.toFixed(1)}%`);
}
console.log("[CORRELAÇÃO] Buscando questões relacionadas no banco...");
const { data: totalCorrelacoes, error: correlacaoError } = await supabase.rpc("correlacionar_reta_final");
if (correlacaoError) throw correlacaoError;
console.log(`[CONCLUÍDO] ${totalProvas} edições únicas, ${porTema.size} temas e ${totalCorrelacoes} questões correlacionadas.`);
