export type Plan = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  billingNote: string;
  highlighted?: boolean;
  cta: string;
  features: string[];
};

export const plans: Plan[] = [
  {
    id: "mensal",
    name: "Mensal",
    tagline: "Para quem quer testar o ritmo sem compromisso.",
    price: 79,
    billingNote: "cobrado a cada mês",
    cta: "Começar teste grátis",
    features: [
      "Banco completo de questões comentadas",
      "Explicações baseadas em diretrizes do MS",
      "Dashboard de desempenho por área",
      "Trilha de estudo com IA (revisão semanal)",
      "1 simulado completo por mês",
    ],
  },
  {
    id: "anual",
    name: "Anual",
    tagline: "O plano de quem está construindo a aprovação com calma.",
    price: 49,
    billingNote: "cobrado R$ 588 por ano",
    highlighted: true,
    cta: "Começar teste grátis",
    features: [
      "Tudo do plano Mensal",
      "Trilha de estudo com IA (ajuste diário)",
      "Simulados completos ilimitados",
      "Comparativo de evolução mês a mês",
      "Alertas de déficit por área em tempo real",
      "Suporte prioritário",
    ],
  },
  {
    id: "intensivo",
    name: "Intensivo Pré-prova",
    tagline: "Reta final: semanas antes da prova, foco cirúrgico.",
    price: 129,
    billingNote: "cobrado a cada mês, cancele quando quiser",
    cta: "Começar teste grátis",
    features: [
      "Tudo do plano Anual",
      "Trilha recalculada a cada resposta",
      "Metas diárias por hora disponível",
      "Simulados cronometrados no formato da prova",
      "Ranking de risco por área antes da prova",
    ],
  },
];

export const comparisonRows: {
  label: string;
  values: [string | boolean, string | boolean, string | boolean];
}[] = [
  {
    label: "Questões comentadas de provas anteriores",
    values: [true, true, true],
  },
  {
    label: "Explicações baseadas em diretrizes do MS",
    values: [true, true, true],
  },
  {
    label: "Dashboard de desempenho por área",
    values: [true, true, true],
  },
  {
    label: "Atualização da trilha de estudo por IA",
    values: ["Semanal", "Diária", "A cada resposta"],
  },
  {
    label: "Simulados completos",
    values: ["1 por mês", "Ilimitados", "Ilimitados + cronometrados"],
  },
  {
    label: "Alertas de déficit por área",
    values: [false, true, true],
  },
  {
    label: "Metas por tempo disponível (dias/horas)",
    values: [false, false, true],
  },
  {
    label: "Suporte",
    values: ["E-mail", "Prioritário", "Prioritário"],
  },
];
