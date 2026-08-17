import { cn } from "@/lib/utils";

export function PulseLine({
  className,
  strokeWidth = 2.5,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 800 100"
      fill="none"
      preserveAspectRatio="none"
      className={cn("w-full overflow-visible", className)}
      aria-hidden="true"
    >
      <path
        d="M0,52 H118 L146,18 L176,88 L206,4 L236,96 L266,52 H384 L412,30 L440,74 L468,52 H800"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pulse-line-path"
      />
    </svg>
  );
}
