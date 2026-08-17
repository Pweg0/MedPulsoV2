import { Check, Minus } from "lucide-react";
import { Container } from "@/components/ui/container";
import { plans, comparisonRows } from "@/lib/pricing";

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check size={17} className="mx-auto text-vital" />
    ) : (
      <Minus size={15} className="mx-auto text-text-tertiary/50" />
    );
  }
  return <span className="text-sm text-text-secondary">{value}</span>;
}

export function ComparisonTable() {
  return (
    <section className="py-20">
      <Container>
        <div className="max-w-xl">
          <span className="font-mono text-xs uppercase tracking-wider text-accent">
            Comparativo
          </span>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-text-primary">
            Todos os recursos, lado a lado.
          </h2>
        </div>

        <div className="mt-10 overflow-x-auto rounded-3xl border border-border">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-bg-inset">
                <th className="p-5 font-display text-sm font-normal text-text-tertiary">
                  Recursos
                </th>
                {plans.map((p) => (
                  <th
                    key={p.id}
                    className="p-5 text-center font-display text-base text-text-primary"
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr
                  key={row.label}
                  className={i % 2 === 0 ? "bg-bg-elevated" : "bg-bg-elevated/60"}
                >
                  <td className="border-t border-border p-5 text-sm text-text-secondary">
                    {row.label}
                  </td>
                  {row.values.map((v, j) => (
                    <td
                      key={j}
                      className="border-t border-border p-5 text-center"
                    >
                      <Cell value={v} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
