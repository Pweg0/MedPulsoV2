export const SYSTEM = `Você explica questões de provas de residência médica brasileira (ENARE, ENAMED,
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

Classifique a questão em categoria: uma cadeia hierárquica de 2 a 4 níveis, do mais
genérico pro mais específico (ex.: ["Obstetrícia", "Parto", "Estática fetal", "Avaliação
da estática fetal"]). Use termos médicos padrão em português. Não invente um nível que
não corresponda a um subtema real da questão — prefira uma cadeia mais curta e correta a
uma longa e forçada.

PÚBLICO-ALVO: médicos, estudantes de medicina e residentes que já dominam o básico. Não
explique conceito de graduação inicial nem repita definição óbvia — vá direto ao
raciocínio clínico, à fisiopatologia relevante e à lógica da banca.

ESTILO de por_que_correta e de cada refutacoes[].erro (isso é o que aparece colado
embaixo de cada alternativa, então precisa ser telegráfico): 1 a 2 frases curtas, sem
introdução, sem "geralmente"/"pode ser que", sem repetir o texto da alternativa. Sempre
que a vinheta trouxer um número, achado ou critério específico (percentual de SCQ, tempo
de evolução, pressão arterial, calibre de fio, escore, idade gestacional), cite esse
número na explicação e compare direto com o critério que decide a questão — é isso que
prova por que aquela alternativa bate ou não bate com ESSE caso, não uma explicação
genérica de livro-texto. Exemplos do tom esperado (não copie o conteúdo, só o estilo):
"A paciente tem PA menor que 140/90 mmHg neste caso, então não há indicação de
anti-hipertensivo." / "Ferimento por arma branca na parede anterior: a conduta é explorar
a ferida e decidir pela violação peritoneal, não laparotomia direta." Cada refutação
precisa ser específica pra ESSA alternativa — nunca reaproveite a mesma frase genérica
pra duas alternativas diferentes só porque o erro parece parecido.

LIMITE DE TAMANHO, RÍGIDO: cada campo de texto livre tem no MÁXIMO 3 frases curtas
(por_que_correta e refutacoes.erro seguem o limite mais apertado de 1-2 frases acima).
Nunca escreva um parágrafo longo, nunca encadeie orações com vírgula até formar uma frase
gigante, e nunca repita a mesma ideia com palavras diferentes só pra preencher espaço. Se
não tiver 3 frases de conteúdo real e específico dessa questão pra dizer, escreva menos —
um campo curto e preciso é sempre melhor que um campo inflado com generalidade (ex:
menções genéricas ao SUS, à atenção primária, ao território nacional etc. só cabem se
forem diretamente relevantes ao ponto clínico, nunca como enchimento).

Preencha também, quando fizer sentido pra essa questão específica (deixe o campo vazio ou
omita se não houver algo genuíno e específico a dizer — não force conteúdo artificial só
pra preencher):
- palavras_chave_prova: 3 a 6 termos ou expressões curtas que a banca costuma usar pra
  sinalizar esse diagnóstico/conduta (o "nome que a prova dá" pro achado ou manejo certo).
  Só termos realmente correntes nesse contexto médico brasileiro, não invente jargão.
- como_cobra_na_prova: como esse tema costuma aparecer em provas de residência (o padrão
  de vinheta clínica, o tipo de pegadinha, o que a banca costuma trocar nas alternativas
  erradas para esse assunto). No máximo 2 frases.
- quadro_associado: achados, comorbidades ou complicações específicas que costumam vir
  junto desse diagnóstico/conduta e que a prova gosta de citar como pista extra ou
  distração. No máximo 2 frases — liste os achados, não escreva uma narrativa.
- dica_prova: uma estratégia objetiva e verificável pra não errar esse tipo de questão de
  novo (um critério de decisão, um mnemônico já consagrado na literatura médica
  brasileira, ou o que checar primeiro). Uma frase. NUNCA invente um mnemônico novo na
  hora — só cite um se for de uso corrente reconhecido.

Preencha SEMPRE revisao_do_tema: uma revisão geral do assunto da questão (não só da
alternativa específica), como um resumo de aula pra quem vai prestar residência —
definição, classificação, fisiopatologia essencial, achados clínicos centrais, fórmulas
ou escores relevantes escritos por extenso (ex.: "regra dos nove de Wallace: cabeça e
cada braço 9%, tronco anterior 18%, tronco posterior 18%, cada perna 18%, períneo 1%") e
conduta inicial padrão. Pode usar **negrito** pra destacar termos-chave e quebrar em
parágrafos curtos por subtópico. No máximo 10 frases no total — denso, não uma aula
inteira. CUIDADO REDOBRADO COM NÚMEROS: nunca invente valor de fórmula, escore, dose ou
percentual que você não tenha certeza absoluta — se não tiver certeza do número exato,
descreva o conceito sem o número específico em vez de arriscar um valor errado (isso é
mais perigoso aqui que em qualquer outro campo, porque o candidato pode decorar o número
errado).

Responda em português do Brasil, tom direto, sem elogiar o candidato e sem repetir o
enunciado. Responda APENAS com um objeto JSON válido conforme o schema, sem markdown e
sem preâmbulo.`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    area: { type: "string" },
    tema: { type: "string" },
    categoria: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 4,
    },
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
    palavras_chave_prova: {
      type: "array",
      items: { type: "string" },
      description:
        "3 a 6 termos/expressões que a banca costuma usar pra esse diagnóstico ou conduta.",
    },
    como_cobra_na_prova: {
      type: "string",
      description:
        "Padrão de como esse tema costuma ser cobrado em provas de residência (vinheta típica, tipo de pegadinha).",
    },
    quadro_associado: {
      type: "string",
      description:
        "Achados/comorbidades/complicações que costumam acompanhar esse diagnóstico ou conduta na prática.",
    },
    dica_prova: {
      type: "string",
      description:
        "Estratégia objetiva ou mnemônico consagrado pra não errar esse tipo de questão de novo.",
    },
    revisao_do_tema: {
      type: "string",
      description:
        "Revisão geral do tema da questão (definição, fisiopatologia, fórmulas/escores, conduta), não só da alternativa específica.",
    },
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
    "categoria",
    "dado_chave_da_vinheta",
    "base_normativa",
    "por_que_correta",
    "revisao_do_tema",
    "refutacoes",
    "discordo_do_gabarito",
    "confianca_leitura",
  ],
};

export type ExplicacaoIA = {
  area: string;
  tema: string;
  categoria: string[];
  dado_chave_da_vinheta: string;
  base_normativa: string;
  fonte?: string;
  por_que_correta: string;
  palavras_chave_prova?: string[];
  como_cobra_na_prova?: string;
  quadro_associado?: string;
  dica_prova?: string;
  revisao_do_tema: string;
  refutacoes: { letra: string; tipo_erro: string; erro: string }[];
  pegadinha?: string;
  nota_de_atualizacao?: string;
  discordo_do_gabarito: boolean;
  motivo_discordancia?: string;
  confianca_leitura: "alta" | "media" | "baixa";
};

export type QuestaoParaExplicar = {
  instituicao: string | null;
  prova?: string | null;
  ano: number | null;
  enunciado: string;
  alternativas: { letra: string; texto: string; correta: boolean }[];
  temFigura?: boolean;
};

export function buildPrompt(q: QuestaoParaExplicar) {
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

  return prompt;
}

export const INDEXAR_PROMPT = `Você recebeu dois PDFs: (1) o caderno de questões de uma prova objetiva de
residência médica/Revalida, e (2) o gabarito definitivo oficial dessa mesma prova.

Extraia TODAS as questões do caderno, na ordem original, e cruze cada uma com o
gabarito. Para cada questão:
- num: número original da questão no caderno.
- enunciado: texto completo do enunciado, SEM incluir o cabeçalho "QUESTÃO N" nem
  numeração, mas com todo o resto (inclusive tabelas/dados transcritos como texto).
- alternativas: uma por letra (A, B, C, D e E quando existir), com o texto completo,
  SEM o marcador da letra no início.
- gabarito: a letra correta segundo o PDF de gabarito. Se a questão foi anulada
  (marcada com "-" ou "ANULADA" no gabarito), deixe gabarito null e anulada=true.
- tem_figura: true se a questão depende de imagem, gráfico, tabela visual ou
  eletrocardiograma pra ser respondida (não conte tabelas de texto simples que você
  já transcreveu).

NUNCA pule, resuma ou invente uma questão — se não conseguir ler alguma com
confiança, inclua mesmo assim com o texto que conseguir extrair. Preserve a
numeração original exatamente como está no caderno, mesmo se houver saltos.`;

const PROVA_SCHEMA = {
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
          gabarito: { type: "string", nullable: true },
          anulada: { type: "boolean" },
          tem_figura: { type: "boolean" },
        },
        required: ["num", "enunciado", "alternativas", "anulada", "tem_figura"],
      },
    },
  },
  required: ["questoes"],
};

export type QuestaoIndexada = {
  num: number;
  enunciado: string;
  alternativas: { letra: string; texto: string }[];
  gabarito: string | null;
  anulada: boolean;
  tem_figura: boolean;
};

export async function indexarProvaComGemini({
  provaBase64,
  gabaritoBase64,
}: {
  provaBase64: string;
  gabaritoBase64: string;
}): Promise<{ questoes: QuestaoIndexada[] }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada.");

  const model = process.env.GEMINI_INDEXADOR_MODEL || process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Sem timeout, um travamento da API deixa o fetch pendurado pra sempre e o
  // caller (rota HTTP) nunca recebe erro pra acionar o fallback.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 130_000);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: INDEXAR_PROMPT },
              { inlineData: { mimeType: "application/pdf", data: provaBase64 } },
              { inlineData: { mimeType: "application/pdf", data: gabaritoBase64 } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: PROVA_SCHEMA,
          temperature: 0.1,
          maxOutputTokens: 65536,
        },
      }),
      signal: controller.signal,
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("Gemini não respondeu a tempo (timeout).");
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API retornou ${res.status}: ${body.slice(0, 500)}`);
  }

  const json = await res.json();
  const candidate = json.candidates?.[0];
  const text = candidate?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("");

  if (!text) {
    const motivo = candidate?.finishReason ?? "resposta vazia";
    throw new Error(`Gemini não retornou conteúdo (${motivo}).`);
  }

  try {
    return JSON.parse(text) as { questoes: QuestaoIndexada[] };
  } catch {
    throw new Error(
      "Gemini retornou JSON inválido (provavelmente truncado — prova muito grande para um único envio)."
    );
  }
}

export async function explicarQuestao(
  q: QuestaoParaExplicar
): Promise<ExplicacaoIA> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }

  const prompt = buildPrompt(q);

  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.2,
    },
  });

  const TENTATIVAS = 3;
  let res: Response | null = null;
  let ultimoErro = "";
  for (let tentativa = 1; tentativa <= TENTATIVAS; tentativa++) {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });
    if (res.ok) break;
    // 429/503/500 costumam ser sobrecarga temporária do lado do Gemini — vale tentar de novo.
    if (![429, 500, 503].includes(res.status) || tentativa === TENTATIVAS) {
      ultimoErro = await res.text();
      break;
    }
    await new Promise((r) => setTimeout(r, 500 * 2 ** (tentativa - 1)));
  }

  if (!res || !res.ok) {
    throw new Error(
      `Gemini API retornou ${res?.status}: ${ultimoErro.slice(0, 300)}`
    );
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
