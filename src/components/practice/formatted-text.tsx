const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
};

export function decodeEntities(text: string) {
  return text.replace(/&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, code) => {
    if (code[0] === "#") {
      const codePoint =
        code[1] === "x" || code[1] === "X"
          ? parseInt(code.slice(2), 16)
          : parseInt(code.slice(1), 10);
      return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
    }
    return NAMED_ENTITIES[code] ?? match;
  });
}

function renderInline(line: string) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-text-primary">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function FormattedText({
  text,
  className,
  formatAssertivas = false,
}: {
  text: string;
  className?: string;
  formatAssertivas?: boolean;
}) {
  const paragraphs = decodeEntities(text)
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className={className}>
      {paragraphs.map((p, i) => (
        <FormattedParagraph key={i} text={p} formatAssertivas={formatAssertivas} first={i === 0} />
      ))}
    </div>
  );
}

function FormattedParagraph({
  text,
  formatAssertivas,
  first,
}: {
  text: string;
  formatAssertivas: boolean;
  first: boolean;
}) {
  if (!formatAssertivas) {
    return <p className={first ? undefined : "mt-2"}>{renderInline(text)}</p>;
  }

  const partes = text.split(/\s+(?=(?:IV|IX|V?I{1,3}|X{1,3}|XL|L)\s*[-–.)]\s*)/);
  if (partes.length === 1) {
    return <p className={first ? undefined : "mt-2"}>{renderInline(text)}</p>;
  }

  const introducao = partes.shift();
  return (
    <div className={first ? undefined : "mt-2"}>
      {introducao && <p>{renderInline(introducao)}</p>}
      <div className="mt-3 flex flex-col gap-2">
        {partes.map((parte, index) => {
          const match = parte.match(/^((?:IV|IX|V?I{1,3}|X{1,3}|XL|L))\s*[-–.)]\s*(.*)$/);
          return (
            <div key={index} className="flex items-start gap-3 rounded-xl border border-border-strong bg-bg-inset/60 px-3 py-2.5">
              <span className="shrink-0 font-mono text-xs font-semibold text-accent">{match?.[1] ?? ""}</span>
              <span className="text-text-primary">{renderInline(match?.[2] ?? parte)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
