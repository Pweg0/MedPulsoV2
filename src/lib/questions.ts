export type PracticeQuestion = {
  id: string;
  area: string;
  statement: string;
  alternatives: string[];
  correctIndex: number;
  explanation: string;
};

export const practiceQuestions: PracticeQuestion[] = [
  {
    id: "cardio-1",
    area: "Cardiologia",
    statement:
      "Paciente de 58 anos, hipertenso, chega à emergência com dor torácica típica há 40 minutos. ECG mostra supradesnivelamento de ST em parede anterior. Qual a conduta prioritária?",
    alternatives: [
      "Solicitar troponina e aguardar resultado antes de qualquer intervenção.",
      "Terapia de reperfusão imediata (angioplastia primária ou trombólise).",
      "Iniciar apenas anti-hipertensivo oral e observar em enfermaria.",
      "Prescrever analgesia e reavaliar em 6 horas.",
      "Solicitar teste ergométrico para confirmar isquemia.",
    ],
    correctIndex: 1,
    explanation:
      "IAM com supra de ST é diagnóstico eletrocardiográfico — a reperfusão deve ser a mais rápida possível, sem aguardar marcadores.",
  },
  {
    id: "pediatria-1",
    area: "Pediatria",
    statement:
      "Lactente de 8 meses, previamente hígido, apresenta diarreia aquosa há 2 dias, está irritado, com olhos fundos e sinal da prega positivo. Segundo o protocolo do MS, qual a classificação e conduta?",
    alternatives: [
      "Sem sinais de desidratação — manter aleitamento e orientar sinais de alarme.",
      "Desidratação leve — soro de reidratação oral em casa.",
      "Desidratação — reidratar com TRO supervisionada na unidade (Plano B).",
      "Desidratação grave — hidratação venosa imediata (Plano C).",
      "Quadro compatível com disenteria — iniciar antibiótico empírico.",
    ],
    correctIndex: 2,
    explanation:
      "Dois sinais de desidratação (irritação, olhos fundos, prega positiva) sem choque classificam como desidratação — Plano B, reidratação oral supervisionada.",
  },
  {
    id: "go-1",
    area: "Ginecologia e Obstetrícia",
    statement:
      "Gestante de 32 semanas, primeira consulta de pré-natal, PA 160x110 mmHg, proteinúria positiva na fita, sem sintomas. Qual o diagnóstico mais provável?",
    alternatives: [
      "Hipertensão gestacional",
      "Pré-eclâmpsia",
      "Hipertensão arterial crônica",
      "Síndrome HELLP",
      "Eclâmpsia",
    ],
    correctIndex: 1,
    explanation:
      "PA ≥140x90 mmHg após 20 semanas associada a proteinúria define pré-eclâmpsia, conforme os protocolos de pré-natal do MS.",
  },
  {
    id: "clinica-1",
    area: "Clínica Médica",
    statement:
      "Homem de 45 anos, diabético tipo 2 em uso de metformina, com HbA1c de 8,2% mesmo com boa adesão. Qual a próxima conduta preferencial segundo as diretrizes do MS?",
    alternatives: [
      "Suspender metformina e iniciar insulina basal isoladamente.",
      "Associar segunda classe de antidiabético oral ou injetável à metformina.",
      "Manter apenas metformina e reforçar dieta por mais 6 meses.",
      "Trocar metformina por sulfonilureia isolada.",
      "Solicitar apenas nova HbA1c em 3 meses sem mudança terapêutica.",
    ],
    correctIndex: 1,
    explanation:
      "Com HbA1c acima da meta em monoterapia, a conduta é intensificar associando uma segunda classe terapêutica, mantendo a metformina como base.",
  },
  {
    id: "saude-coletiva-1",
    area: "Saúde Coletiva",
    statement:
      "Em uma Unidade Básica de Saúde, o enfermeiro identifica aumento de casos de dengue no território. Qual é a atribuição da equipe segundo a vigilância em saúde do MS?",
    alternatives: [
      "Aguardar notificação da vigilância municipal antes de qualquer ação local.",
      "Notificar compulsoriamente os casos suspeitos e atuar no controle de vetores com a equipe.",
      "Encaminhar todos os pacientes diretamente para o hospital de referência.",
      "Restringir a ação à prescrição de sintomáticos, sem notificação.",
      "Isolar domiciliarmente todos os pacientes por 14 dias.",
    ],
    correctIndex: 1,
    explanation:
      "Dengue é doença de notificação compulsória; a atenção básica atua ativamente na vigilância epidemiológica e no controle de vetores do território.",
  },
  {
    id: "cirurgia-1",
    area: "Cirurgia Geral",
    statement:
      "Paciente com dor em fossa ilíaca direita há 18 horas, febre, Blumberg positivo e leucocitose. Qual a hipótese diagnóstica mais provável e a conduta?",
    alternatives: [
      "Gastroenterite — tratamento sintomático ambulatorial.",
      "Apendicite aguda — indicação cirúrgica.",
      "Cisto ovariano roto — conduta expectante.",
      "Litíase renal — analgesia e alta.",
      "Diverticulite — antibiótico oral e retorno em 7 dias.",
    ],
    correctIndex: 1,
    explanation:
      "Quadro clássico de apendicite aguda (dor em FID, febre, Blumberg positivo, leucocitose) tem indicação cirúrgica.",
  },
];
