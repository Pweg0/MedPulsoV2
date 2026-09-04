// Provedor único e configurável pra explicação de questões — só endpoint e
// key, sem fallback entre provedores. Formato de requisição compatível com
// OpenAI chat.completions (funciona com Groq, OpenAI, OpenRouter, proxies
// locais etc. — troque AI_ENDPOINT/AI_API_KEY/AI_MODEL no .env.local e no
// Vercel, sem mexer em código).
import { SYSTEM, buildPrompt, type ExplicacaoIA, type QuestaoParaExplicar } from "@/lib/gemini";

const JSON_SHAPE_HINT = `Responda APENAS com um objeto JSON puro (sem markdown, sem crases,
sem preâmbulo) com exatamente estas chaves:
{
 "area": string,
 "tema": string,
 "categoria": string[] (2 a 4 itens, do mais genérico pro mais específico),
 "dado_chave_da_vinheta": string,
 "base_normativa": "protocolo_ms" | "legislacao_sus" | "sociedade_especialidade" | "fisiopatologia",
 "fonte": string (opcional),
 "por_que_correta": string,
 "palavras_chave_prova": string[] (opcional),
 "como_cobra_na_prova": string (opcional),
 "quadro_associado": string (opcional),
 "dica_prova": string (opcional),
 "revisao_do_tema": string (SEMPRE preencher — revisão geral do tema, não só da alternativa),
 "pontos_raciocinio": [{"ponto": string, "verbo": "identificar" | "correlacionar" | "diferenciar" | "associar" | "recordar"}] (SEMPRE preencher, 2 a 4 itens),
 "refutacoes": [{"letra": string, "tipo_erro": "conduta_certa_momento_errado" | "exame_indicado_mas_nao_o_primeiro" | "diagnostico_descartado_por_achado" | "dose_via_ou_duracao_errada" | "conduta_de_outro_nivel_de_atencao" | "contraindicado_no_caso" | "viola_norma_ou_legislacao" | "conceito_trocado" | "incompleto", "erro": string}],
 "pegadinha": string (opcional),
  "nota_de_atualizacao": string (opcional; somente quando houver mudança real e verificável: cite o protocolo/diretriz vigente, o que a prova cobrava, o que mudou e a conduta atual específica; nunca escreva apenas que "o protocolo mudou"),
 "discordo_do_gabarito": boolean,
 "motivo_discordancia": string (opcional),
 "confianca_leitura": "alta" | "media" | "baixa"
}`;

async function chamarProvedorIA(systemPrompt: string, userPrompt: string, formatoJson = true) {
  const apiKey = (process.env.RETA_FINAL_AI_API_KEY || process.env.AI_API_KEY)?.trim();
  const endpoint = (process.env.RETA_FINAL_AI_ENDPOINT || process.env.AI_ENDPOINT)?.trim();
  if (!apiKey || !endpoint) {
    throw new Error("AI_ENDPOINT e/ou AI_API_KEY não configurados.");
  }

  const model = process.env.RETA_FINAL_AI_MODEL || process.env.AI_MODEL;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://medpulso.vercel.app",
      "X-Title": "MedPulso.ia",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      ...(formatoJson ? { response_format: { type: "json_object" } } : {}),
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`IA retornou ${res.status}: ${body.slice(0, 300)}`);
  }

  const json = await res.json();
  const text = json.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Resposta vazia da IA.");
  }

  const limpo = text.trim().replace(/^```(?:json)?\n?|```$/g, "");
  return formatoJson ? JSON.parse(limpo) : limpo;
}

const EXPLICAR_TEXTO_SYSTEM = `Você é um colega médico explicando um texto para outro médico colega ou interno.
Use palavras claras, fáceis e objetivas. Explique o contexto clínico, os termos importantes e o que o texto está descrevendo.
Não invente dados, não dê uma resposta de prova e não revele gabarito. Responda em português do Brasil, em parágrafos curtos.`;

export async function explicarTextoIA(texto: string, alternativas?: string[]) {
  const complemento = alternativas?.length
    ? `\n\nALTERNATIVAS:\n${alternativas.join("\n")}`
    : "";
  return chamarProvedorIA(EXPLICAR_TEXTO_SYSTEM, `TEXTO A EXPLICAR:\n${texto}${complemento}`, false) as Promise<string>;
}

export async function explicarQuestaoIA(
  q: QuestaoParaExplicar
): Promise<ExplicacaoIA> {
  const prompt = buildPrompt(q);
  return chamarProvedorIA(
    `${SYSTEM}\n\n${JSON_SHAPE_HINT}`,
    prompt
  ) as Promise<ExplicacaoIA>;
}

export type FlashcardIA = {
  area_grande: string;
  frente: string;
  verso: string;
};

const AREAS_GRANDES = [
  "Clínica Médica",
  "Cirurgia",
  "Pediatria",
  "Ginecologia e Obstetrícia",
  "Medicina Preventiva e Saúde Coletiva",
];

const FLASHCARD_SYSTEM = `Você cria flashcards de revisão pra um candidato de residência médica
brasileira que acabou de errar uma questão. A partir do enunciado, alternativas e gabarito
(e, se disponível, uma explicação já pronta), gere UM flashcard:
- frente: uma pergunta curta e memorizável sobre o ponto que o candidato errou — não copie o
  enunciado inteiro, condense pro conceito/conduta central que decide a questão.
- verso: a resposta certa em 1-3 frases telegráficas, direto ao ponto, sem repetir a pergunta.
- area_grande: classifique em EXATAMENTE uma destas 5 opções, a que melhor encaixa o tema
  clínico da questão: ${AREAS_GRANDES.map((a) => `"${a}"`).join(", ")}.

Responda em português do Brasil. Responda APENAS com um objeto JSON puro (sem markdown, sem
crases, sem preâmbulo) no formato exato:
{ "area_grande": string, "frente": string, "verso": string }`;

export async function gerarFlashcardIA(params: {
  enunciado: string;
  alternativas: { letra: string; texto: string; correta: boolean }[];
  explicacaoExistente?: { por_que_correta?: string; revisao_do_tema?: string } | null;
}): Promise<FlashcardIA> {
  const gabarito = params.alternativas.find((a) => a.correta)?.letra ?? "?";
  const alts = params.alternativas
    .map((a) => `${a.letra}) ${a.texto}`)
    .join("\n");

  let prompt = `Gabarito: ${gabarito}\n\nENUNCIADO:\n${params.enunciado}\n\nALTERNATIVAS:\n${alts}`;

  if (params.explicacaoExistente?.por_que_correta) {
    prompt += `\n\nPOR QUE A CORRETA ESTÁ CERTA:\n${params.explicacaoExistente.por_que_correta}`;
  }
  if (params.explicacaoExistente?.revisao_do_tema) {
    prompt += `\n\nREVISÃO DO TEMA:\n${params.explicacaoExistente.revisao_do_tema}`;
  }

  return chamarProvedorIA(FLASHCARD_SYSTEM, prompt) as Promise<FlashcardIA>;
}
