import { Container } from "@/components/ui/container";

export default function Loading() {
  return (
    <Container className="max-w-none animate-pulse py-12 lg:px-12" aria-busy="true" aria-label="Carregando Reta Final">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="h-3 w-32 rounded-full bg-bg-inset" />
          <div className="mt-3 h-10 w-72 rounded-xl bg-bg-inset" />
          <div className="mt-3 h-4 w-[min(90vw,560px)] rounded-full bg-bg-inset" />
        </div>
        <div className="h-10 w-56 rounded-lg bg-bg-inset" />
      </div>

      <div className="rounded-3xl border border-border bg-bg-elevated p-6 sm:p-8">
        <div className="h-4 w-28 rounded-full bg-bg-inset" />
        <div className="mt-6 h-24 rounded-xl bg-bg-inset" />
        <div className="mt-6 flex flex-col gap-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-14 rounded-xl bg-bg-inset" />
          ))}
        </div>
      </div>
    </Container>
  );
}
