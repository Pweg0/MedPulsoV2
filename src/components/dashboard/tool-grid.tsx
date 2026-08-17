import Link from "next/link";
import {
  BookOpenCheck,
  GraduationCap,
  CalendarDays,
  Layers,
  NotebookPen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  { href: "/estudar", label: "Questões", icon: BookOpenCheck, live: true },
  { href: "#", label: "Material de Apoio", icon: GraduationCap, live: false },
  { href: "#", label: "Cronograma", icon: CalendarDays, live: false },
  { href: "#", label: "Flashcards", icon: Layers, live: false },
  { href: "#", label: "Caderno de Revisão", icon: NotebookPen, live: false },
];

export function ToolGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const content = (
          <>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <Icon size={20} />
            </span>
            <span className="mt-3 text-sm font-medium text-text-primary">
              {tool.label}
            </span>
            {!tool.live && (
              <span className="mt-1 rounded-full bg-bg-inset px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-tertiary">
                em breve
              </span>
            )}
          </>
        );

        const className = cn(
          "flex flex-col items-center justify-center rounded-2xl border p-5 text-center transition-colors",
          tool.live
            ? "border-border bg-bg-elevated hover:border-accent cursor-pointer"
            : "border-dashed border-border-strong bg-bg-elevated/50 text-text-tertiary cursor-not-allowed"
        );

        return tool.live ? (
          <Link key={tool.label} href={tool.href} className={className}>
            {content}
          </Link>
        ) : (
          <div key={tool.label} className={className}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
