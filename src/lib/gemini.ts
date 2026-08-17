const SYSTEM = `Você explica questões de provas de residência médica brasileira (ENARE, ENAMED,
Revalida/INEP e provas de instituições estaduais) para um candidato que já respondeu à
questão. O gabarito definitivo é fornecido — seu trabalho não é descobrir a resposta, é
reconstruir o raciocínio que leva a ela e mostrar por que cada alternativa errada falha.

HIERARQUIA DE FONTES. Essas provas cobram a conduta esperada no SUS brasileiro, e
guideline internacional frequentemente diverge do protocolo nacional. Nesses casos a
prova segue o nacional. Aplique nesta ordem:
1. protocolo_ms — PCDT, Cadernos de Atenção Básica, manuais e portarias do Ministério da
   Saúde, Calendário Nacional de Vacinação, linhas de cuidado.
2. legislacao_sus — Leis 8.080/8.142, ECA, Código de Ética Médica, notificação
   compulsória.
3. sociedade_especialidade — SBP, Febrasgo, SBC, SBD etc., quando não houver norma
   nacional.
4. fisiopatologia — quando a questão é raciocínio clínico puro e nenhuma norma decide.

Declare em base_normativa qual nível decidiu a questão. NUNCA force uma referência
ministerial onde ela não existe: muitas questões são raciocínio puro, e inventar uma
portaria é pior que não citar nenhuma. Nunca cite número de portaria ou PCDT que você não
tenha certeza — prefira nomear o documento.

Se a prova é antiga e o protocolo mudou depois, explique pela norma vigente na época e
registre a mudança em nota_de_atualizacao.

Se você achar que o gabarito está errado ou a questão é ambígua, marque
discordo_do_gabarito: true e explique em motivo_discordancia. NÃO invente justificativa
torta para defender um gabarito que você acha errado.

Se o enunciado depende de figura, gráfico ou tabela que você não recebeu, marque
confianca_leitura: "baixa" e diga o que faltou.

Responda em português do Brasil, tom direto, sem elogiar o candidato e sem repetir o
enunciado. Responda APENAS com um objeto JSON válido conforme o schema, sem markdown e
sem preâmbulo.`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    area: { type: "string" },
    tema: { type: "string" },
    dado_chave_da_vinheta: { type: "string" },
    base_normativa: {
      type: "string",
      enum: [
        "protocolo_ms",
        "legislacao_sus",
        "sociedade_especialidade",
        "fisiopatologia",
      ],
    },
    fonte: { type: "string" },
    por_que_correta: { type: "string" },
    refutacoes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          letra: { type: "string" },
          tipo_erro: {
            type: "string",
            enum: [
              "conduta_certa_momento_errado",
              "exame_indicado_mas_nao_o_primeiro",
              "diagnostico_descartado_por_achado",
              "dose_via_ou_duracao_errada",
              "conduta_de_outro_nivel_de_atencao",
              "contraindicado_no_caso",
              "viola_norma_ou_legislacao",
              "conceito_trocado",
              "incompleto",
            ],
          },
          erro: { type: "string" },
        },
        required: ["letra", "tipo_erro", "erro"],
      },
    },
    pegadinha: { type: "string" },
    nota_de_atualizacao: { type: "string" },
    discordo_do_gabarito: { type: "boolean" },
    motivo_discordancia: { type: "string" },
    confianca_leitura: { type: "string", enum: ["alta", "media", "baixa"] },
  },
  required: [
    "area",
    "tema",
    "dado_chave_da_vinheta",
    "base_normativa",
    "por_que_correta",
    "refutacoes",
    "discordo_do_gabarito",
    "confianca_leitura",
  ],
};

export type ExplicacaoIA = {
  area: string;
  tema: string;
  dado_chave_da_vinheta: string;
  base_normativa: string;
  fonte?: string;
  por_que_correta: string;
  refutacoes: { letra: string; tipo_erro: string; erro: string }[];
  pegadinha?: string;
  nota_de_atualizacao?: string;
  discordo_do_gabarito: boolean;
  motivo_discordancia?: string;
  confianca_leitura: "alta" | "media" | "baixa";
};

type QuestaoParaExplicar = {
  instituicao: string | null;
  prova?: string | null;
  ano: number | null;
  enunciado: string;
  alternativas: { letra: string; texto: string; correta: boolean }[];
  temFigura?: boolean;
};

export async function explicarQuestao(
  q: QuestaoParaExplicar
): Promise<ExplicacaoIA> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }

  const gabarito = q.alternativas.find((a) => a.correta)?.letra ?? "?";
  const alts = q.alternativas
    .map((a) => `${a.letra}) ${a.texto}`)
    .join("\n");

  let prompt =
    `Prova: ${q.instituicao ?? "instituição não informada"}` +
    (q.ano ? ` · ${q.ano}` : "") +
    `\nGabarito definitivo: ${gabarito}\n\n` +
    `ENUNCIADO:\n${q.enunciado}\n\nALTERNATIVAS:\n${alts}`;

  if (q.temFigura) {
    prompt +=
      "\n\nATENÇÃO: esta questão contém uma figura que não foi enviada. Considere isso em confianca_leitura.";
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.2,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API retornou ${res.status}: ${body.slice(0, 300)}`);
  }

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("");

  if (!text) {
    throw new Error("Resposta vazia da Gemini.");
  }

  return JSON.parse(text) as ExplicacaoIA;
}
