"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Rocket, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EspecialidadePicker } from "@/components/practice/especialidade-picker";
import type { EspecialidadeNode } from "@/lib/supabase/especialidade-tree";

const STATUS_OPCOES: { value: string; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "nao_vistas", label: "Não vistas" },
  { value: "resolvidas", label: "Resolvidas" },
  { value: "acertadas", label: "Acertadas" },
  { value: "erradas", label: "Erradas" },
  { value: "nao_acertadas", label: "Ainda não acertadas" },
];

function Secao({
  titulo,
  contagem,
  aberto,
  onToggle,
  children,
}: {
  titulo: string;
  contagem?: number;
  aberto: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-bg-elevated">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 p-4"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          {titulo}
          {!!contagem && (
            <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[11px] text-accent">
              {contagem}
            </span>
          )}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "text-text-tertiary transition-transform",
            aberto && "rotate-180"
          )}
        />
      </button>
      {aberto && <div className="border-t border-border p-4 pt-3">{children}</div>}
    </div>
  );
}

export function FiltroAvancado({
  arvoreEspecialidades,
  anos,
  bancas,
}: {
  arvoreEspecialidades: EspecialidadeNode[];
  anos: { ano: number; total: number }[];
  bancas: { instituicao: string; total: number }[];
}) {
  const router = useRouter();

  const [especialidades, setEspecialidades] = useState<Set<string>>(new Set());
  const [anosSel, setAnosSel] = useState<Set<string>>(new Set());
  const [bancasSel, setBancasSel] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState("todas");
  const [buscaBanca, setBuscaBanca] = useState("");

  const [secaoAberta, setSecaoAberta] = useState<string | null>("especialidades");

  const [total, setTotal] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtroAtivo =
    especialidades.size > 0 ||
    anosSel.size > 0 ||
    bancasSel.size > 0 ||
    status !== "todas";

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setCarregando(true);
      try {
        const res = await fetch("/api/questoes/contar", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            especialidades: [...especialidades],
            anos: [...anosSel],
            bancas: [...bancasSel],
            status,
          }),
        });
        const json = await res.json();
        setTotal(res.ok ? json.total : null);
      } catch {
        setTotal(null);
      } finally {
        setCarregando(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [especialidades, anosSel, bancasSel, status]);

  function toggleSet(
    set: Set<string>,
    setSet: (s: Set<string>) => void,
    valor: string
  ) {
    const novo = new Set(set);
    if (novo.has(valor)) novo.delete(valor);
    else novo.add(valor);
    setSet(novo);
  }

  function limparFiltros() {
    setEspecialidades(new Set());
    setAnosSel(new Set());
    setBancasSel(new Set());
    setStatus("todas");
  }

  function iniciarEstudos() {
    const params = new URLSearchParams();
    especialidades.forEach((e) => params.append("esp", e));
    anosSel.forEach((a) => params.append("ano", a));
    bancasSel.forEach((b) => params.append("banca", b));
    if (status !== "todas") params.set("status", status);
    router.push(`/estudar/praticar?${params.toString()}`);
  }

  const bancasFiltradas = useMemo(() => {
    if (!buscaBanca.trim()) return bancas;
    const termo = buscaBanca.trim().toLowerCase();
    return bancas.filter((b) => b.instituicao.toLowerCase().includes(termo));
  }, [bancas, buscaBanca]);

  const chips: { label: string; onRemove: () => void }[] = [
    ...[...especialidades].map((e) => ({
      label: e.split(">").pop()?.trim() ?? e,
      onRemove: () => toggleSet(especialidades, setEspecialidades, e),
    })),
    ...[...anosSel].map((a) => ({
      label: a,
      onRemove: () => toggleSet(anosSel, setAnosSel, a),
    })),
    ...[...bancasSel].map((b) => ({
      label: b.length > 40 ? b.slice(0, 40) + "…" : b,
      onRemove: () => toggleSet(bancasSel, setBancasSel, b),
    })),
    ...(status !== "todas"
      ? [
          {
            label: STATUS_OPCOES.find((s) => s.value === status)?.label ?? status,
            onRemove: () => setStatus("todas"),
          },
        ]
      : []),
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-4">
        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {chips.map((chip, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 py-1 pl-3 pr-1.5 font-mono text-[11px] text-accent"
              >
                {chip.label}
                <button
                  type="button"
                  onClick={chip.onRemove}
                  className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-accent/20"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={limparFiltros}
              className="font-mono text-[11px] text-text-tertiary underline-offset-2 hover:text-accent hover:underline"
            >
              Limpar tudo
            </button>
          </div>
        )}

        <Secao
          titulo="Especialidades"
          contagem={especialidades.size}
          aberto={secaoAberta === "especialidades"}
          onToggle={() =>
            setSecaoAberta((s) => (s === "especialidades" ? null : "especialidades"))
          }
        >
          <EspecialidadePicker
            arvore={arvoreEspecialidades}
            selecionados={especialidades}
            onToggle={(caminho) => toggleSet(especialidades, setEspecialidades, caminho)}
          />
        </Secao>

        <Secao
          titulo="Anos"
          contagem={anosSel.size}
          aberto={secaoAberta === "anos"}
          onToggle={() => setSecaoAberta((s) => (s === "anos" ? null : "anos"))}
        >
          <div className="grid max-h-64 grid-cols-2 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-3">
            {anos.map(({ ano, total: t }) => (
              <label
                key={ano}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-bg-inset"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={anosSel.has(String(ano))}
                    onChange={() => toggleSet(anosSel, setAnosSel, String(ano))}
                    className="h-3.5 w-3.5 accent-accent"
                  />
                  <span className="text-text-secondary">{ano}</span>
                </span>
                <span className="rounded-full bg-bg-inset px-1.5 py-0.5 font-mono text-[10px] text-text-tertiary">
                  {t}
                </span>
              </label>
            ))}
          </div>
        </Secao>

        <Secao
          titulo="Bancas / Instituições"
          contagem={bancasSel.size}
          aberto={secaoAberta === "bancas"}
          onToggle={() => setSecaoAberta((s) => (s === "bancas" ? null : "bancas"))}
        >
          <div className="relative mb-2">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <input
              value={buscaBanca}
              onChange={(e) => setBuscaBanca(e.target.value)}
              placeholder="Pesquisar instituições..."
              className="w-full rounded-xl border border-border-strong bg-bg-elevated py-2 pl-9 pr-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent"
            />
          </div>
          <div className="max-h-80 overflow-y-auto pr-1">
            {bancasFiltradas.map(({ instituicao, total: t }) => (
              <label
                key={instituicao}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-bg-inset"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={bancasSel.has(instituicao)}
                    onChange={() => toggleSet(bancasSel, setBancasSel, instituicao)}
                    className="h-3.5 w-3.5 shrink-0 accent-accent"
                  />
                  <span className="truncate text-text-secondary">{instituicao}</span>
                </span>
                <span className="shrink-0 rounded-full bg-bg-inset px-1.5 py-0.5 font-mono text-[10px] text-text-tertiary">
                  {t}
                </span>
              </label>
            ))}
          </div>
        </Secao>

        <Secao
          titulo="Status da questão"
          aberto={secaoAberta === "status"}
          onToggle={() => setSecaoAberta((s) => (s === "status" ? null : "status"))}
        >
          <div className="flex flex-wrap gap-2">
            {STATUS_OPCOES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-mono text-xs transition-colors",
                  status === opt.value
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border-strong text-text-secondary hover:border-accent"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Secao>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl border border-border bg-bg-elevated p-5 text-center">
          <p className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
            Questões encontradas
          </p>
          <p className="mt-2 flex items-center justify-center gap-2 font-display text-4xl text-text-primary">
            {carregando ? (
              <Loader2 size={28} className="animate-spin text-accent" />
            ) : (
              (total ?? "—").toLocaleString("pt-BR")
            )}
          </p>
          <button
            type="button"
            onClick={iniciarEstudos}
            disabled={total === 0}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Rocket size={16} />
            Iniciar estudos
          </button>
          <button
            type="button"
            onClick={limparFiltros}
            disabled={!filtroAtivo}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-border-strong px-5 py-2.5 font-mono text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
          >
            Limpar filtros
          </button>
          {!filtroAtivo && (
            <p className="mt-3 text-xs text-text-tertiary">
              Sem filtro, puxa das 200 primeiras questões do banco.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
