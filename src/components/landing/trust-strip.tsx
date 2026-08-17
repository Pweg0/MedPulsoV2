import { Container } from "@/components/ui/container";

const stats = [
  { value: "12.000+", label: "questões comentadas" },
  { value: "18", label: "grandes áreas mapeadas" },
  { value: "27", label: "estados cobertos — residência + Revalida" },
  { value: "100%", label: "explicações com base em diretrizes do MS" },
];

export function TrustStrip() {
  return (
    <section className="border-y border-border bg-bg-inset/50">
      <Container className="grid grid-cols-2 gap-y-8 py-10 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center sm:text-left">
            <p className="font-display text-3xl text-text-primary">
              {s.value}
            </p>
            <p className="mt-1 text-xs leading-snug text-text-tertiary">
              {s.label}
            </p>
          </div>
        ))}
      </Container>
    </section>
  );
}
