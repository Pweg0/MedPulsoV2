import Link from "next/link";
import { Logo } from "@/components/logo";
import { PulseLine } from "@/components/pulse-line";
import { Container } from "@/components/ui/container";
import { MessageCircle } from "lucide-react";
import { InstagramIcon, YoutubeIcon } from "@/components/icons/social-icons";

const columns = [
  {
    title: "Produto",
    links: [
      { label: "Recursos", href: "/#recursos" },
      { label: "Como funciona", href: "/#como-funciona" },
      { label: "Preços", href: "/precos" },
      { label: "Entrar", href: "/login" },
    ],
  },
  {
    title: "Provas cobertas",
    links: [
      { label: "ENARE", href: "/#recursos" },
      { label: "ENAMED", href: "/#recursos" },
      { label: "Revalida (INEP)", href: "/#recursos" },
      { label: "Provas estaduais", href: "/#recursos" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de uso", href: "#" },
      { label: "Política de privacidade", href: "#" },
      { label: "Reembolso", href: "/precos" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-bg-elevated">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 text-accent/20">
        <PulseLine strokeWidth={1.5} />
      </div>

      <Container className="relative pt-20 pb-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-secondary">
              Plataforma de estudo para residência médica com banco de
              questões comentadas e trilhas de revisão guiadas por
              desempenho, com base nas diretrizes do Ministério da Saúde.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[InstagramIcon, YoutubeIcon, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Rede social"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border-strong text-text-secondary transition-colors hover:border-accent hover:text-accent"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-xs font-medium uppercase tracking-wider text-text-tertiary">
                {col.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col-reverse items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-text-tertiary">
            © {new Date().getFullYear()} MedPulso.ia. Todos os direitos
            reservados. Conteúdo de apoio ao estudo — não substitui as
            diretrizes oficiais.
          </p>
          <p className="font-mono text-xs text-text-tertiary">
            Feito para quem vai plantão dobrado.
          </p>
        </div>
      </Container>
    </footer>
  );
}
