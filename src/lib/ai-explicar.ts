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
 "refutacoes": [{"letra": string, "tipo_erro": "conduta_certa_momento_errado" | "exame_indicado_mas_nao_o_primeiro" | "diagnostico_descartado_por_achado" | "dose_via_ou_duracao_errada" | "conduta_de_outro_nivel_de_atencao" | "contraindicado_no_caso" | "viola_norma_ou_legislacao" | "conceito_trocado" | "incompleto", "erro": string}],
 "pegadinha": string (opcional),
 "nota_de_atualizacao": string (opcional),
 "discordo_do_gabarito": boolean,
 "motivo_discordancia": string (opcional),
 "confianca_leitura": "alta" | "media" | "baixa"
}`;

export async function explicarQuestaoIA(
  q: QuestaoParaExplicar
): Promise<ExplicacaoIA> {
  const apiKey = process.env.AI_API_KEY;
  const endpoint = process.env.AI_ENDPOINT;
  if (!apiKey || !endpoint) {
    throw new Error("AI_ENDPOINT e/ou AI_API_KEY não configurados.");
  }

  const model = process.env.AI_MODEL;
  const prompt = buildPrompt(q);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: `${SYSTEM}\n\n${JSON_SHAPE_HINT}` },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
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
  return JSON.parse(limpo) as ExplicacaoIA;
}
