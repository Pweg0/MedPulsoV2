"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Loader2,
  Sparkles,
  TriangleAlert,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { useMounted } from "@/lib/use-mounted";
import { FormattedText, decodeEntities } from "@/components/practice/formatted-text";
import type { Questao, Alternativa } from "@/lib/supabase/questoes";
import type { ExplicacaoIA } from "@/lib/gemini";
import { salvarAvaliacaoPonto, type NivelAvaliacao } from "@/lib/supabase/pontos";
import { HighlightableText } from "@/components/practice/highlightable-text";

const NIVEIS: { valor: NivelAvaliacao; label: string; className: string }[] = [
  { valor: "dominei", label: "Dominei", className: "border-vital-500 bg-vital-500 text-on-accent" },
  { valor: "duvida", label: "Dúvida", className: "border-amber-400 bg-amber-400 text-on-accent" },
  { valor: "vacilei", label: "Vacilei", className: "border-amber-600 bg-amber-600 text-on-accent" },
  { valor: "nao_sabia", label: "Não sabia", className: "border-orange-500 bg-orange-500 text-on-accent" },
];

const BASES: Record<string, string> = {
  protocolo_ms: "Ministério da Saúde",
  legislacao_sus: "legislação do SUS",
  sociedade_especialidade: "sociedade de especialidade",
  fisiopatologia: "fisiopatologia",
};

const ERROS: Record<string, string> = {
  conduta_certa_momento_errado: "conduta certa, momento errado",
  exame_indicado_mas_nao_o_primeiro: "exame indicado, mas não o primeiro",
  diagnostico_descartado_por_achado: "diagnóstico descartado por um achado",
  dose_via_ou_duracao_errada: "dose, via ou duração errada",
  conduta_de_outro_nivel_de_atencao: "conduta de outro nível de atenção",
  contraindicado_no_caso: "contraindicado neste caso",
  viola_norma_ou_legislacao: "viola norma ou legislação",
  conceito_trocado: "conceito trocado",
  incompleto: "incompleto",
};

type Estatisticas = {
  counts: Record<string, number>;
  total: number;
  acertos: number;
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type PontoRaciocinio = { ponto: string; verbo: string };

function MapaDeRaciocinio({
  pontos,
  niveis,
  onAvaliar,
}: {
  pontos: PontoRaciocinio[];
  niveis: Record<string, NivelAvaliacao>;
  onAvaliar: (ponto: string, verbo: string, nivel: NivelAvaliacao) => void;
}) {
  const [indice, setIndice] = useState(() => {
    const primeiroPendente = pontos.findIndex((p) => !niveis[p.ponto]);
    return primeiroPendente === -1 ? pontos.length : primeiroPendente;
  });

  const concluido = indice >= pontos.length;
  const atual = !concluido ? pontos[indice] : null;

  return (
    <div className="rounded-xl border border-border-strong bg-bg-elevated p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-mono text-[11px] uppercase tracking-wider text-accent">
          Mapa de raciocínio
        </h4>
        {!concluido && (
          <span className="font-mono text-[10px] text-text-tertiary">
            {indice + 1}/{pontos.length}
          </span>
        )}
      </div>

      {!concluido && (
        <div className="mt-2 flex gap-1">
          {pontos.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full",
                i <= indice ? "bg-accent" : "bg-border-strong"
              )}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {concluido ? (
          <motion.p
            key="concluido"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-2 flex items-center gap-1.5 text-xs text-vital-600 dark:text-vital-400"
          >
            <Check size={13} /> Mapa de raciocínio avaliado.
          </motion.p>
        ) : (
          atual && (
            <motion.div
              key={indice}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {atual.ponto}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {NIVEIS.map((n) => (
                  <button
                    key={n.valor}
                    type="button"
                    onClick={() => {
                      onAvaliar(atual.ponto, atual.verbo, n.valor);
                      setIndice((i) => i + 1);
                    }}
                    className={cn(
                      "rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors cursor-pointer",
                      n.className
                    )}
                  >
                    {n.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIndice((i) => i + 1)}
                  className="ml-1 font-mono text-[11px] text-text-tertiary transition-colors hover:text-accent cursor-pointer"
                >
                  Pular
                </button>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}

function altExplicacao(alt: Alternativa) {
  return alt.explicacao;
}

export function PracticeSession({
  questoes,
  prevalenciaPorQuestao = {},
  bloco = false,
}: {
  questoes: Questao[];
  prevalenciaPorQuestao?: Record<string, { prevalencia: number; tema: string }>;
  bloco?: boolean;
}) {
  const { user } = useAuth();
  const mounted = useMounted();
  const [order] = useState(() => shuffle(questoes));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [aiExplicacoes, setAiExplicacoes] = useState<Record<string, ExplicacaoIA>>(
    () => {
      const cache: Record<string, ExplicacaoIA> = {};
      for (const q of questoes) {
        if (q.explicacao_ia) cache[q.id] = q.explicacao_ia as ExplicacaoIA;
      }
      return cache;
    }
  );
  const [explicando, setExplicando] = useState(false);
  const [aiErro, setAiErro] = useState<string | null>(null);
  const [categoriaAberta, setCategoriaAberta] = useState(false);
  const [categoriaQuestaoId, setCategoriaQuestaoId] = useState<string | null>(
    null
  );
  const [stats, setStats] = useState<Record<string, Estatisticas>>({});
  const [tentativaIds, setTentativaIds] = useState<Record<string, string>>({});
  const [pontosPorQuestao, setPontosPorQuestao] = useState<
    Record<string, Record<string, NivelAvaliacao>>
  >({});
  const [precacheConcluidos, setPrecacheConcluidos] = useState(0);
  const precacheIniciado = useRef(false);

  useEffect(() => {
    if (!bloco || precacheIniciado.current) return;
    precacheIniciado.current = true;
    const pendentes = questoes.filter((q) => !q.explicacao_ia);
    if (pendentes.length === 0) return;
    let proximo = 0;
    let cancelado = false;
    async function trabalhador() {
      while (proximo < pendentes.length) {
        const q = pendentes[proximo++];
        try {
          const resposta = await fetch("/api/explicar", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ questaoId: q.id }),
          });
          const json = await resposta.json();
          if (resposta.ok && json.explicacao && !cancelado) {
            setAiExplicacoes((prev) => ({ ...prev, [q.id]: json.explicacao }));
          }
        } catch {
          // A sessão continua utilizável mesmo se uma pré-carga falhar.
        } finally {
          if (!cancelado) setPrecacheConcluidos((valor) => valor + 1);
        }
      }
    }
    void Promise.all([trabalhador(), trabalhador()]);
    return () => { cancelado = true; };
  }, [bloco, questoes]);

  const questao = order[index % order.length];
  const selected = answers[questao.id] ?? null;
  const answered = selected !== null;
  const ai = aiExplicacoes[questao.id];
  const prevalencia = prevalenciaPorQuestao[questao.id];
  const disciplinaHierarquia = questao.disciplina
    ? questao.disciplina.split(" > ").map((s) => s.trim())
    : [];
  const disciplinaTopo = disciplinaHierarquia[0];
  const hierarquia =
    disciplinaHierarquia.length > 1 ? disciplinaHierarquia : ai?.categoria ?? [];
  const questaoStats = stats[questao.id];
  const acertouAtual = answered
    ? questao.alternativas.find((a) => a.letra === selected)?.correta ?? false
    : false;

  if (mounted && categoriaQuestaoId !== questao.id) {
    setCategoriaQuestaoId(questao.id);
    setCategoriaAberta(false);
  }

  useEffect(() => {
    if (!answered) return;
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("tentativas")
      .select("resposta_letra, acertou")
      .eq("questao_id", questao.id)
      .then(({ data }) => {
        if (cancelled) return;
        const counts: Record<string, number> = {};
        let acertos = 0;
        for (const row of data ?? []) {
          counts[row.resposta_letra] = (counts[row.resposta_letra] ?? 0) + 1;
          if (row.acertou) acertos++;
        }
        setStats((prev) => ({
          ...prev,
          [questao.id]: { counts, total: data?.length ?? 0, acertos },
        }));
      });
    return () => {
      cancelled = true;
    };
  }, [questao.id, answered]);

  async function handleSelect(letra: string) {
    if (answered) return;
    const questaoAtual = questao;
    setAnswers((prev) => ({ ...prev, [questaoAtual.id]: letra }));
    setAiErro(null);

    const alt = questaoAtual.alternativas.find((a) => a.letra === letra);
    const acertou = alt?.correta ?? false;
    setAnsweredCount((c) => c + 1);
    if (acertou) setCorrectCount((c) => c + 1);

    if (user) {
      setSaving(true);
      const supabase = createClient();
      const { data: tentativa } = await supabase
        .from("tentativas")
        .insert({
          user_id: user.id,
          questao_id: questaoAtual.id,
          resposta_letra: letra,
          acertou,
        })
        .select("id")
        .single();
      setSaving(false);

      if (tentativa) {
        setTentativaIds((prev) => ({ ...prev, [questaoAtual.id]: tentativa.id }));
      }

      if (!acertou) {
        fetch("/api/flashcards/gerar", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            questaoId: questaoAtual.id,
            tentativaId: tentativa?.id ?? null,
          }),
        }).catch(() => {});
      }
    }
  }

  function handleAvaliarPonto(ponto: string, verbo: string, nivel: NivelAvaliacao) {
    const idTentativa = tentativaIds[questao.id];
    const temaAtual = ai?.tema;
    if (!idTentativa || !temaAtual) return;

    const atualizados = {
      ...(pontosPorQuestao[questao.id] ?? {}),
      [ponto]: nivel,
    };
    setPontosPorQuestao((prev) => ({ ...prev, [questao.id]: atualizados }));

    const pontosParaSalvar = Object.entries(atualizados).map(([p, n]) => {
      const original = ai?.pontos_raciocinio.find((pr) => pr.ponto === p);
      return { ponto: p, verbo: original?.verbo ?? verbo, nivel: n };
    });

    salvarAvaliacaoPonto({
      tentativaId: idTentativa,
      tema: temaAtual,
      pontos: pontosParaSalvar,
    }).catch(() => {});
  }

  async function handleGerarExplicacao() {
    setExplicando(true);
    setAiErro(null);
    try {
      const res = await fetch("/api/explicar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questaoId: questao.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || "Falha ao gerar explicação.");
      setAiExplicacoes((prev) => ({ ...prev, [questao.id]: json.explicacao }));
    } catch (e) {
      setAiErro(e instanceof Error ? e.message : "Falha ao gerar explicação.");
    } finally {
      setExplicando(false);
    }
  }

  function goPrev() {
    setAiErro(null);
    setIndex((i) => (i - 1 + order.length) % order.length);
  }

  function goNext() {
    setAiErro(null);
    setIndex((i) => (i + 1) % order.length);
  }

  if (!mounted) {
    return (
      <div className="animate-pulse rounded-3xl border border-border bg-bg-elevated p-6 sm:p-8">
        <div className="h-5 w-32 rounded-full bg-bg-inset" />
        <div className="mt-6 h-16 rounded-lg bg-bg-inset" />
        <div className="mt-6 flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-bg-inset" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <span className="font-mono text-xs text-text-tertiary">
          {answeredCount} respondida{answeredCount === 1 ? "" : "s"} nesta
          sessão
          {answeredCount > 0 && ` · ${Math.round((correctCount / answeredCount) * 100)}% de acerto`}
        </span>
        {saving && (
          <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <Loader2 size={12} className="animate-spin" /> salvando
          </span>
        )}
        {bloco && precacheConcluidos > 0 && precacheConcluidos < questoes.length && (
          <span className="font-mono text-[10px] text-accent">IA em cache: {precacheConcluidos}/{questoes.length}</span>
        )}
      </div>

      {bloco && (
        <div className="mb-6 rounded-2xl border border-border bg-bg-elevated p-3">
          <div className="flex flex-wrap gap-1.5">
            {order.map((q, i) => {
              const resposta = answers[q.id];
              const acertou = resposta && q.alternativas.find((a) => a.letra === resposta)?.correta;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Ir para questão ${i + 1}${resposta ? acertou ? ", correta" : ", errada" : ", não respondida"}`}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg border font-mono text-[11px] transition-colors cursor-pointer",
                    i === index && "ring-2 ring-accent",
                    resposta
                      ? acertou
                        ? "border-vital-500 bg-vital-500/20 text-vital-600 dark:text-vital-400"
                        : "border-coral-500 bg-coral-500/20 text-coral-600 dark:text-coral-400"
                      : "border-border-strong bg-bg-inset text-text-tertiary hover:border-accent"
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-stretch gap-2 sm:gap-3">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Questão anterior"
          className="flex h-10 w-10 shrink-0 self-center items-center justify-center rounded-full border border-border-strong bg-bg-elevated text-text-tertiary transition-colors hover:border-accent hover:text-accent"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={questao.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border border-border bg-bg-elevated p-6 sm:p-8"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-xs text-text-tertiary">
                    Questão {index + 1}
                  </span>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {disciplinaTopo && (
                      <span className="rounded-full border border-border-strong bg-bg-inset px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-text-secondary">
                        {disciplinaTopo}
                      </span>
                    )}
                    {questao.instituicao && (
                      <span
                        title={questao.instituicao}
                        className="max-w-[280px] truncate rounded-full border border-border-strong bg-bg-inset px-3 py-1 font-mono text-[11px] text-text-tertiary"
                      >
                        {questao.instituicao}
                        {questao.ano ? ` · ${questao.ano}` : ""}
                      </span>
                    )}
                  </div>
                </div>

                {hierarquia.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setCategoriaAberta((v) => !v)}
                    aria-label="Mostrar categoria"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-strong text-text-tertiary transition-colors hover:border-accent hover:text-accent"
                  >
                    <ChevronDown
                      size={14}
                      className={cn(
                        "transition-transform",
                        categoriaAberta && "rotate-180"
                      )}
                    />
                  </button>
                )}
              </div>

              {categoriaAberta && hierarquia.length > 1 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {hierarquia.map((c, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      {i > 0 && (
                        <ChevronRight
                          size={11}
                          className="text-text-tertiary/50"
                        />
                      )}
                      <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-[11px] text-accent">
                        {c}
                      </span>
                    </span>
                  ))}
                </div>
              )}

              {prevalencia && (
                <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-3">
                  <div className="flex items-center justify-between gap-3 text-[11px]">
                    <span className="font-mono uppercase tracking-wider text-accent">
                      Prevalência · {prevalencia.tema}
                    </span>
                    <span className="font-mono font-semibold text-accent">
                      {Math.round(prevalencia.prevalencia)}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-accent/15">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, prevalencia.prevalencia))}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-text-tertiary">
                    Presente em aproximadamente {Math.round(prevalencia.prevalencia)}% das edições analisadas.
                  </p>
                </div>
              )}

              {answered && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider",
                      acertouAtual
                        ? "bg-vital-500/15 text-vital-500"
                        : "bg-coral-500/15 text-coral-500"
                    )}
                  >
                    {acertouAtual ? "Certa" : "Errada"}
                  </span>
                  {questaoStats && questaoStats.total > 0 && (
                    <span className="rounded-full border border-border-strong bg-bg-inset px-2.5 py-1 font-mono text-[11px] text-text-tertiary">
                      {Math.round((questaoStats.acertos / questaoStats.total) * 100)}% acertaram
                    </span>
                  )}
                </div>
              )}

              <HighlightableText
                text={questao.enunciado}
                className="mt-5 text-base leading-relaxed text-text-primary"
              />

              <div className="mt-6 flex flex-col gap-3">
                {questao.alternativas.map((alt) => {
                  const isSelected = alt.letra === selected;
                  const showState = answered;
                  const refutacao = ai?.refutacoes.find(
                    (r) => r.letra === alt.letra
                  );
                  const explicacaoTexto = ai
                    ? alt.correta
                      ? ai.por_que_correta
                      : refutacao?.erro
                    : altExplicacao(alt);
                  const tipoErroLabel =
                    ai && !alt.correta && refutacao
                      ? ERROS[refutacao.tipo_erro] ?? refutacao.tipo_erro
                      : null;
                  const pct =
                    questaoStats && questaoStats.total > 0
                      ? Math.round(
                          ((questaoStats.counts[alt.letra] ?? 0) /
                            questaoStats.total) *
                            100
                        )
                      : null;

                  return (
                    <div key={alt.letra}>
                      <button
                        type="button"
                        disabled={answered}
                        onClick={() => handleSelect(alt.letra)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl border p-4 text-left text-sm transition-colors",
                          !answered &&
                            "border-border-strong hover:border-accent cursor-pointer",
                          showState &&
                            !alt.correta &&
                            !isSelected &&
                            "border-border opacity-50",
                          showState && alt.correta && "border-vital-500 bg-vital-500/10",
                          showState &&
                            isSelected &&
                            !alt.correta &&
                            "border-coral-500 bg-coral-500/10"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs",
                            showState && alt.correta
                              ? "border-vital-500 bg-vital-500 text-on-accent"
                              : showState && isSelected
                                ? "border-coral-500 bg-coral-500 text-on-accent"
                                : "border-border-strong text-text-tertiary"
                          )}
                        >
                          {showState && alt.correta ? (
                            <Check size={13} />
                          ) : showState && isSelected ? (
                            <X size={13} />
                          ) : (
                            alt.letra
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          {pct !== null && (
                            <span className="mb-1.5 flex items-center gap-2">
                              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-inset">
                                <span
                                  className={cn(
                                    "block h-full rounded-full",
                                    alt.correta ? "bg-vital-500" : "bg-coral-500/70"
                                  )}
                                  style={{ width: `${pct}%` }}
                                />
                              </span>
                              <span className="shrink-0 font-mono text-[10px] text-text-tertiary">
                                {pct}%
                              </span>
                            </span>
                          )}
                          <span className="text-text-secondary">
                            {decodeEntities(alt.texto)}
                          </span>
                        </span>
                      </button>

                      {showState && explicacaoTexto && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div
                            className={cn(
                              "mt-2 rounded-xl px-4 py-3",
                              alt.correta ? "bg-vital-500/10" : "bg-coral-500/10"
                            )}
                          >
                            <span
                              className={cn(
                                "font-mono text-[11px] font-semibold uppercase tracking-wider",
                                alt.correta
                                  ? "text-vital-600 dark:text-vital-400"
                                  : "text-coral-600 dark:text-coral-400"
                              )}
                            >
                              {alt.correta ? "Correta" : "Errada"}
                              {tipoErroLabel ? ` · ${tipoErroLabel}` : ""}
                            </span>
                            <FormattedText
                              text={explicacaoTexto}
                              className="mt-1 text-xs leading-relaxed text-text-secondary"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              {answered && !questaoStats && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-text-tertiary">
                  <Loader2 size={12} className="animate-spin" /> carregando estatísticas
                </p>
              )}

              {answered && !ai && (
                <div className="mt-5 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border-strong p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-2 text-xs text-text-tertiary">
                    <Sparkles size={14} className="text-accent" />
                    Essa questão ainda não tem explicação.
                  </p>
                  <Button
                    onClick={handleGerarExplicacao}
                    disabled={explicando}
                    size="sm"
                    variant="secondary"
                  >
                    {explicando ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    Buscar Explicação e resolução da questão
                  </Button>
                </div>
              )}

              {aiErro && (
                <p className="mt-3 text-xs text-coral-500">{aiErro}</p>
              )}

              {answered && ai && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="mt-5 overflow-hidden rounded-2xl border border-border bg-bg-inset p-5 sm:p-6"
                >
                  {ai.pontos_raciocinio && ai.pontos_raciocinio.length > 0 && (
                    <MapaDeRaciocinio
                      pontos={ai.pontos_raciocinio}
                      niveis={pontosPorQuestao[questao.id] ?? {}}
                      onAvaliar={handleAvaliarPonto}
                    />
                  )}

                  {ai.dado_chave_da_vinheta && (
                    <>
                      <h4 className="mt-5 font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
                        O dado que decide a questão
                      </h4>
                      <p className="mt-2 rounded-xl border border-vital-500/30 bg-vital-500/10 p-3 font-display text-sm italic leading-relaxed text-text-secondary">
                        {ai.dado_chave_da_vinheta}
                      </p>
                    </>
                  )}

                  {ai.como_cobra_na_prova && (
                    <>
                      <h4 className="mt-5 font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
                        Como isso cai na prova
                      </h4>
                      <FormattedText
                        text={ai.como_cobra_na_prova}
                        className="mt-2 text-sm leading-relaxed text-text-secondary"
                      />
                    </>
                  )}

                  {ai.quadro_associado && (
                    <>
                      <h4 className="mt-5 font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
                        O que costuma vir junto
                      </h4>
                      <FormattedText
                        text={ai.quadro_associado}
                        className="mt-2 text-sm leading-relaxed text-text-secondary"
                      />
                    </>
                  )}

                  {ai.palavras_chave_prova && ai.palavras_chave_prova.length > 0 && (
                    <>
                      <h4 className="mt-5 font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
                        Palavras-chave da prova
                      </h4>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {ai.palavras_chave_prova.map((p, i) => (
                          <span
                            key={i}
                            className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs text-accent"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  {ai.pegadinha && (
                    <>
                      <h4 className="mt-5 font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
                        A pegadinha
                      </h4>
                      <FormattedText
                        text={ai.pegadinha}
                        className="mt-2 text-sm leading-relaxed text-text-secondary"
                      />
                    </>
                  )}

                  {ai.dica_prova && (
                    <div className="mt-5 rounded-xl border border-vital-500/30 bg-vital-500/10 p-4">
                      <p className="text-xs font-semibold text-vital-500">
                        Como não errar de novo
                      </p>
                      <FormattedText
                        text={ai.dica_prova}
                        className="mt-1 text-sm leading-relaxed text-text-secondary"
                      />
                    </div>
                  )}

                  {ai.revisao_do_tema && (
                    <div className="mt-5 rounded-xl border border-border-strong bg-bg-elevated p-4">
                      <h4 className="font-mono text-[11px] uppercase tracking-wider text-accent">
                        Revisão do tema — {ai.tema}
                      </h4>
                      <FormattedText
                        text={ai.revisao_do_tema}
                        className="mt-2 text-sm leading-relaxed text-text-secondary"
                      />
                    </div>
                  )}

                  {ai.nota_de_atualizacao && (
                    <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                      <p className="text-xs font-semibold text-amber-500">
                        O protocolo mudou desde esta prova
                      </p>
                      <FormattedText
                        text={ai.nota_de_atualizacao}
                        className="mt-1 text-sm leading-relaxed text-text-secondary"
                      />
                    </div>
                  )}

                  {ai.discordo_do_gabarito && (
                    <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                      <TriangleAlert size={16} className="mt-0.5 shrink-0 text-amber-500" />
                      <div>
                        <p className="text-xs font-semibold text-amber-500">
                          Atenção: gabarito contestado
                        </p>
                        <FormattedText
                          text={
                            ai.motivo_discordancia ||
                            "Questão possivelmente ambígua ou desatualizada."
                          }
                          className="mt-1 text-sm leading-relaxed text-text-secondary"
                        />
                      </div>
                    </div>
                  )}

                  {ai.confianca_leitura === "baixa" && (
                    <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                      <p className="text-xs font-semibold text-amber-500">
                        Leitura incompleta
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                        Esta questão depende de conteúdo visual (figura, gráfico ou
                        tabela) que não foi enviado à IA.
                      </p>
                    </div>
                  )}

                  {(ai.tema || ai.base_normativa || ai.fonte) && (
                    <div className="mt-5 flex flex-wrap gap-2 font-mono text-[10.5px] text-text-tertiary">
                      {ai.tema && (
                        <span className="rounded border border-border px-2 py-1">
                          {ai.tema}
                        </span>
                      )}
                      {ai.base_normativa && (
                        <span className="rounded border border-border px-2 py-1">
                          base: {BASES[ai.base_normativa] ?? ai.base_normativa}
                        </span>
                      )}
                      {ai.fonte && (
                        <span className="rounded border border-border px-2 py-1">
                          {ai.fonte}
                        </span>
                      )}
                    </div>
                  )}

                </motion.div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={goNext}
          aria-label="Próxima questão"
          className="flex h-10 w-10 shrink-0 self-center items-center justify-center rounded-full border border-border-strong bg-bg-elevated text-text-tertiary transition-colors hover:border-accent hover:text-accent"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {bloco && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <a href="/reta-final" className="font-mono text-xs text-text-tertiary hover:text-accent">
            Encerrar bloco
          </a>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-text-secondary">
              {answeredCount}/{questoes.length} · {answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0}% de acerto
            </span>
            {answeredCount === questoes.length && (
              <a href="/reta-final" className="rounded-full bg-accent px-4 py-2 font-mono text-xs font-semibold text-on-accent">
                Iniciar outro bloco
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
