import { cn } from "@/lib/utils";

type Cell = { title: string; detail: string };

// Body of a ```layers or ```pyramid fence: one row per line, cells side by side
// split by "||", each cell "Title | detail". The first row is the reader.
export function parseLayers(code: string): Cell[][] {
  return code
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) =>
      line.split("||").map((cell) => {
        const [title, ...detail] = cell.split("|");
        return { title: title.trim(), detail: detail.join("|").trim() };
      }),
    );
}

// Plain HTML instead of Mermaid: the text stays page-sized on a phone, where a
// scaled-down SVG of three side-by-side boxes shrank to ~5px.
export function LayersDiagram({ code, pyramid = false }: { code: string; pyramid?: boolean }) {
  const rows = parseLayers(code);
  return (
    <figure className="not-prose my-6 flex flex-col items-center gap-1.5">
      {rows.map((cells, i) => (
        <div
          key={i}
          className={cn("flex w-full flex-col gap-1.5 sm:flex-row", pyramid && "sm:w-[var(--row-w)]")}
          // Pyramid rows widen from 40% at the top to the full width at the base.
          style={pyramid ? ({ "--row-w": `${40 + (60 * i) / Math.max(rows.length - 1, 1)}%` } as React.CSSProperties) : undefined}
        >
          {cells.map((cell) => (
            <div
              key={cell.title}
              className={cn(
                "flex-1 rounded-xl border px-4 py-2.5 text-center",
                i === 0 ? "border-primary-glow/60 bg-primary-glow/15" : "border-border bg-muted/40",
                cells.length > 1 && "sm:py-5",
              )}
            >
              <p className={cn("text-sm text-foreground", i === 0 ? "font-bold" : "font-semibold")}>{cell.title}</p>
              {cell.detail && <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{cell.detail}</p>}
            </div>
          ))}
        </div>
      ))}
    </figure>
  );
}
