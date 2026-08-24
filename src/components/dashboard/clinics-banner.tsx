import { Stethoscope, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClinicsBanner() {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-bg-elevated p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Stethoscope size={18} />
        </span>
        <div>
          <p className="font-display text-base text-text-primary">
            Já é médico?
          </p>
          <p className="text-xs text-text-tertiary">
            Veja o MedPulso Clinics — painel gestor de clínicas e
            consultórios.
          </p>
        </div>
      </div>

      <Button
        href="https://clinics.medpulso.com.br"
        variant="secondary"
        size="sm"
        className="shrink-0"
      >
        Conhecer o MedPulso Clinics <ArrowRight size={15} />
      </Button>
    </div>
  );
}
