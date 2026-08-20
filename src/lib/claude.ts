import { INDEXAR_PROMPT, type QuestaoIndexada } from "./gemini";

// Fallback pra indexação de provas quando a Gemini falha ou trava (ver
// PROJECT_STATUS.md — indexação nunca foi validada de ponta a ponta em
// produção). Usa tool_choice forçado em vez de responseSchema pra garantir
// JSON estruturado, já que a Messages API não tem responseSchema nativo.
const TOOL_NAME = "extrair_questoes";

const TOOL_SCHEMA = {
  name: TOOL_NAME,
  description:
    "Registra todas as questões extraídas do caderno de prova, já cruzadas com o gabarito.",
  input_schema: {
    type: "object",
    properties: {
      questoes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            num: { type: "integer" },
            enunciado: { type: "string" },
            alternativas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  letra: { type: "string" },
                  texto: { type: "string" },
                },
                required: ["letra", "texto"],
              },
            },
            gabarito: { type: ["string", "null"] },
            anulada: { type: "boolean" },
            tem_figura: { type: "boolean" },
          },
          required: ["num", "enunciado", "alternativas", "anulada", "tem_figura"],
        },
      },
    },
    required: ["questoes"],
  },
} as const;

export async function indexarProvaComClaude({
  provaBase64,
  gabaritoBase64,
}: {
  provaBase64: string;
  gabaritoBase64: string;
}): Promise<{ questoes: QuestaoIndexada[] }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada.");

  const model = process.env.ANTHROPIC_INDEXADOR_MODEL || "claude-sonnet-5";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 150_000);

  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 64000,
        temperature: 0.1,
        tools: [TOOL_SCHEMA],
        tool_choice: { type: "tool", name: TOOL_NAME },
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: INDEXAR_PROMPT },
              {
                type: "document",
                source: { type: "base64", media_type: "application/pdf", data: provaBase64 },
              },
              {
                type: "document",
                source: { type: "base64", media_type: "application/pdf", data: gabaritoBase64 },
              },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("Claude não respondeu a tempo (timeout).");
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Claude API retornou ${res.status}: ${body.slice(0, 500)}`);
  }

  const json = await res.json();
  const toolUse = json.content?.find(
    (b: { type: string; name?: string }) => b.type === "tool_use" && b.name === TOOL_NAME
  ) as { input?: { questoes: QuestaoIndexada[] } } | undefined;

  if (!toolUse?.input?.questoes) {
    const motivo = json.stop_reason ?? "sem tool_use na resposta";
    throw new Error(`Claude não retornou questões estruturadas (${motivo}).`);
  }

  return { questoes: toolUse.input.questoes };
}
