import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Cell = { title: string; detail: string };

export const DIAGRAM_KINDS = ["layers", "pyramid", "steps", "stats", "compare", "press"] as const;
export type DiagramKind = (typeof DIAGRAM_KINDS)[number];

export type Diagram = { title: string; art: string; rows: Cell[][] };

// Body of a ```layers, ```pyramid or ```steps fence. Optional `title:` and `art:`
// lines come first (a "|" in the title starts the navy bar). Then one row per
// line, cells side by side split by "||", each cell "Title | detail".
export function parseDiagram(code: string): Diagram {
  const diagram: Diagram = { title: "", art: "", rows: [] };
  for (const line of code.split("\n").map((l) => l.trim()).filter(Boolean)) {
    const meta = line.match(/^(title|art):\s*(.+)$/);
    if (meta) {
      diagram[meta[1] as "title" | "art"] = meta[2];
      continue;
    }
    diagram.rows.push(
      line.split("||").map((cell) => {
        const [title, ...detail] = cell.split("|");
        return { title: title.trim(), detail: detail.join("|").trim() };
      }),
    );
  }
  return diagram;
}

// Colours of the pieces in each piece of art, in order: the TSS emblem's three
// pillars, and the pyramid's slabs and the stair's steps from the top.
const PILLARS = ["var(--p-pink)", "var(--p-blue)", "var(--p-green)"];
const SERIES = ["var(--p-1)", "var(--p-2)", "var(--p-3)", "var(--p-4)", "var(--p-5)", "var(--p-6)"];

const anton = "font-['Anton',Impact,sans-serif] uppercase";

function Headline({ title }: { title: string }) {
  const [lead, bar] = title.split("|").map((s) => s.trim());
  return (
    <div className={cn(anton, "mb-4 leading-[0.95] text-[color:var(--p-navy)]")}>
      <p className="text-[1.9rem] sm:text-[2.4rem]">{lead}</p>
      {bar && (
        <p className="mt-1.5 inline-block -rotate-[1.5deg] rounded-sm bg-[color:var(--p-navy)] px-3 py-1 text-[1.6rem] text-[color:var(--p-yellow)] sm:text-[2rem]">
          {bar}
        </p>
      )}
    </div>
  );
}

function You({ cell }: { cell: Cell }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
      <span className={cn(anton, "grid h-14 w-14 shrink-0 -rotate-6 place-items-center rounded-full border-[3px] border-white bg-[color:var(--p-pink)] text-lg text-white shadow-md")}>
        {cell.title}
      </span>
      <p className="text-sm font-semibold leading-snug text-[color:var(--p-navy)]">{cell.detail}</p>
    </div>
  );
}

function Card({ cell, color, n }: { cell: Cell; color: string; n?: number }) {
  return (
    <div className="flex flex-1 overflow-hidden rounded-2xl bg-white shadow-sm">
      {n ? (
        <span className={cn(anton, "grid w-11 shrink-0 place-items-center text-2xl text-white")} style={{ background: color }}>
          {n}
        </span>
      ) : (
        <span className="w-2 shrink-0" style={{ background: color }} />
      )}
      <div className="px-3 py-2.5">
        <p className="text-sm font-bold leading-snug text-[color:var(--p-navy)]">{cell.title}</p>
        {cell.detail && <p className="mt-0.5 text-[13px] leading-snug text-[color:var(--p-muted)]">{cell.detail}</p>}
      </div>
    </div>
  );
}

function Base({ cell }: { cell: Cell }) {
  return (
    <div className="-rotate-1 rounded-xl bg-[color:var(--p-navy)] px-4 py-3 text-center shadow-md">
      <p className={cn(anton, "text-xl tracking-wide text-[color:var(--p-yellow)]")}>{cell.title}</p>
      {cell.detail && <p className="text-[13px] text-white/85">{cell.detail}</p>}
    </div>
  );
}

type Box = [left: number, top: number, width: number, height: number];
type Spots = { you: Box; pillars: Box[]; base: Box; ink: string[] };

// Art with room for words on its pieces: where each piece sits as a % box of
// the image, and the text colour that reads on it. A layers fence with this art,
// a reader, one row of pillars and a base prints its labels on the art.
const ON_ART: Record<string, Spots> = {
  // TSS emblem: gold ball, pink top, blue left, green right, navy base.
  // Navy reads on pink and green, white on blue (contrast measured on the art).
  "/first-14-days/diagrams/tss.webp": {
    you: [41, 38, 18, 19],
    pillars: [[34, 13.5, 34, 21], [10, 59, 37.5, 16.5], [53, 59, 37.5, 15]],
    base: [10, 78.5, 80, 17],
    ink: ["text-[color:var(--p-navy)]", "text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.35)]", "text-[color:var(--p-navy)]"],
  },
};

const at = ([left, top, width, height]: Box) => ({ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` });

// Labels scale with the art. The details fit on it from 30rem wide; narrower,
// the pieces keep their names and the details are listed under the art.
function OnArt({ art, spots, you, pillars, base }: { art: string; spots: Spots; you: Cell; pillars: Cell[]; base: Cell }) {
  const detail = "mt-0.5 hidden text-[length:clamp(0.7rem,2.5cqw,0.85rem)] leading-snug [@container_(min-width:30rem)]:block";
  return (
    <div className="[container-type:inline-size]">
      <div className="relative mx-auto aspect-[720/695] w-full max-w-[34rem] [container-type:inline-size]">
        <img src={art} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full drop-shadow-xl" />
        <p aria-hidden style={at(spots.you)} className={cn(anton, "absolute grid place-items-center text-[length:clamp(1rem,5.5cqw,2rem)] text-[color:var(--p-navy)]")}>
          {you.title}
        </p>
        {pillars.map((cell, i) => (
          <div key={cell.title} style={at(spots.pillars[i])} className={cn("absolute flex flex-col items-center justify-center text-center", spots.ink[i])}>
            <p className="text-[length:clamp(0.7rem,3.1cqw,1.05rem)] font-extrabold leading-tight">{cell.title}</p>
            {cell.detail && <p className={cn(detail, "font-semibold")}>{cell.detail}</p>}
          </div>
        ))}
        <div style={at(spots.base)} className="absolute flex flex-col items-center justify-center text-center">
          <p className={cn(anton, "text-[length:clamp(1rem,4.4cqw,1.6rem)] leading-none tracking-wide text-[color:var(--p-yellow)]")}>{base.title}</p>
          {base.detail && <p className={cn(detail, "text-white/90")}>{base.detail}</p>}
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2 [@container_(min-width:30rem)]:hidden">
        {pillars.map((cell, i) => (
          <Card key={cell.title} cell={cell} color={PILLARS[i % PILLARS.length]} />
        ))}
        <Card cell={base} color="var(--p-navy)" />
      </div>
    </div>
  );
}

const DONE_RE = /\s*\(done\)$/i;

function Steps({ cells }: { cells: Cell[] }) {
  const n = cells.length;
  return (
    <ol
      className="relative flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:gap-3 sm:p-5"
      // On a wide screen the road runs from the first circle's centre to the last's.
      style={{ "--edge": `calc(1.25rem + (100% - 2.5rem - ${(n - 1) * 0.75}rem) / ${2 * n})` } as React.CSSProperties}
    >
      <span
        aria-hidden
        className="absolute bottom-9 left-9 top-9 w-1 rounded-full bg-gradient-to-b from-[color:var(--p-1)] to-[color:var(--p-5)] sm:bottom-auto sm:left-[var(--edge)] sm:right-[var(--edge)] sm:top-[2.4rem] sm:h-1 sm:w-auto sm:bg-gradient-to-r"
      />
      {cells.map((cell, i) => {
        // A step titled "... (done)" is one the reader has finished: a tick instead of its number.
        const done = DONE_RE.test(cell.title);
        const title = cell.title.replace(DONE_RE, "");
        return (
        <li key={cell.title} className="relative flex gap-3 sm:flex-1 sm:flex-col sm:items-center sm:text-center">
          <span
            className={cn(anton, "grid h-10 w-10 shrink-0 place-items-center rounded-full border-[3px] border-white text-lg text-white shadow")}
            // Navy, not green: step 4 of the road is already green and would read as done too.
            style={{ background: done ? "var(--p-navy)" : SERIES[i % SERIES.length] }}
          >
            {done ? <Check aria-label="Done" className="h-5 w-5" strokeWidth={3} /> : i + 1}
          </span>
          <div>
            <p className="text-sm font-bold leading-snug text-[color:var(--p-navy)]">{title}</p>
            {cell.detail && <p className="mt-0.5 text-[13px] leading-snug text-[color:var(--p-muted)]">{cell.detail}</p>}
          </div>
        </li>
        );
      })}
    </ol>
  );
}

// Big numbers in a row; two to a line on a phone, an odd last one full width.
function Stats({ cells }: { cells: Cell[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 max-sm:[&>*:last-child:nth-child(odd)]:col-span-2 sm:auto-cols-fr sm:grid-flow-col">
      {cells.map((cell, i) => (
        <div key={cell.title} className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <span className="block h-1.5" style={{ background: SERIES[i % SERIES.length] }} />
          <div className="px-3 pb-3 pt-2">
            <p className={cn(anton, "text-[1.9rem] leading-none sm:text-[2.2rem]")} style={{ color: SERIES[i % SERIES.length] }}>
              {cell.title}
            </p>
            {cell.detail && <p className="mt-1 text-[13px] leading-snug text-[color:var(--p-muted)]">{cell.detail}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

// First row names the two columns ("|| Them || Us"); each row after is
// "Topic || them || us". On a phone each side carries its column name.
// Press cards, one per line: "Outlet, date | Headline | One fact | https://link | Link text".
// The link text is optional ("Read the article"); only http(s) links are drawn.
function Press({ cells }: { cells: Cell[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cells.map((cell) => {
        const [headline, fact, url, linkText] = cell.detail.split("|").map((p) => p.trim());
        return (
          <article key={headline} className="relative rounded-2xl bg-white px-4 pb-4 pt-5 shadow-sm">
            <span aria-hidden className="absolute -top-2 left-1/2 h-4 w-16 -translate-x-1/2 -rotate-2 rounded-sm bg-[color:var(--p-yellow-soft)]" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--p-muted)]">{cell.title}</p>
            <p className="mt-1 font-serif text-base font-bold leading-snug text-[color:var(--p-navy)]">{headline}</p>
            {fact && <p className="mt-1.5 text-[13px] leading-snug text-[color:var(--p-muted)]">{fact}</p>}
            {url && /^https?:\/\//.test(url) && (
              <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-[color:var(--p-blue)] underline-offset-2 hover:underline">
                {linkText || "Read the article"}
              </a>
            )}
          </article>
        );
      })}
    </div>
  );
}

function Compare({ rows }: { rows: Cell[][] }) {
  const [head, ...body] = rows;
  const [them, us] = [head[1]?.title ?? "", head[2]?.title ?? ""];
  const grid = "sm:grid sm:grid-cols-[9rem_1fr_1fr] sm:items-stretch sm:gap-2";
  return (
    <div className="flex flex-col gap-2">
      <div className={cn(grid, "hidden px-3 text-xs font-bold uppercase tracking-wide text-[color:var(--p-navy)]")}>
        <span />
        <span>{them}</span>
        <span>{us}</span>
      </div>
      {body.map(([topic, a, b]) => (
        <div key={topic.title} className={cn(grid, "flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-sm")}>
          <p className={cn(anton, "self-center text-lg leading-tight text-[color:var(--p-navy)]")}>{topic.title}</p>
          <p className="rounded-xl bg-[color:var(--p-card)] px-3 py-2 text-[13px] leading-snug text-[color:var(--p-muted)]">
            <span className="block text-[11px] font-bold uppercase tracking-wide sm:hidden">{them}</span>
            {a?.title}
          </p>
          <p className="rounded-xl border-2 border-[color:var(--p-green)] bg-[#ecfdf5] px-3 py-2 text-[13px] font-semibold leading-snug text-[color:var(--p-navy)]">
            <span className="block text-[11px] font-bold uppercase tracking-wide text-[#0f8a5a] sm:hidden">{us}</span>
            {b?.title}
          </p>
        </div>
      ))}
    </div>
  );
}

// A poster panel in the themoneybees.co/finternship style: Higgsfield art with
// no words in it, and every label as page text, so it stays sharp, correct and
// readable on a phone (a scaled-down Mermaid SVG shrank to ~5px).
// A single-cell first row is the reader (the YOU card). layers: a single-cell
// last row is the base bar, rows between sit side by side. pyramid: numbered
// tiers. steps: one step per line, across on a wide screen, down on a phone.
// stats: big numbers (a single-cell last row is the base bar). compare: see
// Compare. Wide content (steps, stats, compare, a row of 4+) sits under the
// headline instead of beside the art.
export function LayersDiagram({ code, kind = "layers" }: { code: string; kind?: DiagramKind }) {
  const { title, art, rows } = parseDiagram(code);
  const you = (kind === "layers" || kind === "pyramid") && rows.length > 1 && rows[0].length === 1 ? rows[0][0] : undefined;
  const last = rows[rows.length - 1];
  const base = (kind === "layers" || kind === "stats") && rows.length > (you ? 2 : 1) && last.length === 1 ? last[0] : undefined;
  const middle = rows.slice(you ? 1 : 0, base ? -1 : undefined);
  const wide = kind === "steps" || kind === "stats" || kind === "compare" || kind === "press" || middle.some((cells) => cells.length > 3);
  const spots = ON_ART[art];
  const labelled =
    kind === "layers" && spots && you && base && middle.length === 1 && middle[0].length === spots.pillars.length
      ? { spots, you, base, pillars: middle[0] }
      : undefined;

  const content =
    kind === "steps" ? (
      <Steps cells={rows.flat()} />
    ) : kind === "stats" ? (
      <Stats cells={middle.flat()} />
    ) : kind === "press" ? (
      <Press cells={rows.flat()} />
    ) : kind === "compare" ? (
      <Compare rows={rows} />
    ) : (
      middle.map((cells, i) => (
        <div
          key={i}
          // Title-only cells (a list of words) sit two to a line on a phone.
          className={cn("grid gap-2 sm:auto-cols-fr sm:grid-flow-col", cells.length > 2 && cells.every((c) => !c.detail) && "grid-cols-2 max-sm:[&>*:last-child:nth-child(odd)]:col-span-2")}
        >
          {cells.map((cell, j) =>
            kind === "pyramid" ? (
              <Card key={cell.title} cell={cell} color={SERIES[i % SERIES.length]} n={i + 1} />
            ) : (
              <Card key={cell.title} cell={cell} color={PILLARS[j % PILLARS.length]} />
            ),
          )}
        </div>
      ))
    );

  // The art fills a box as tall as the text beside it, so it never pads the
  // panel with empty yellow; on a phone it gets a fixed band above the cards.
  const artBox = art && (
    <div
      className={cn(
        "relative h-56 w-full sm:h-auto sm:min-h-[13rem] sm:self-stretch",
        wide && "sm:col-start-2 sm:row-span-2 sm:row-start-1",
      )}
    >
      <img src={art} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-contain drop-shadow-xl" />
    </div>
  );

  const body = (
    <div className="flex flex-col gap-2">
      {you && <You cell={you} />}
      {content}
      {base && <div className="pt-1"><Base cell={base} /></div>}
    </div>
  );

  return (
    <figure
      aria-label={title.replace("|", " ") || undefined}
      className="f14-poster not-prose relative my-8 overflow-hidden rounded-3xl bg-[color:var(--p-yellow)] p-4 sm:p-7"
    >
      <span aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[color:var(--p-yellow-soft)]" />
      {labelled ? (
        // Headline and the reader's line, then the art with every label on its pieces.
        <div className="relative grid items-center gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div>
            {title && <Headline title={title} />}
            {labelled.you.detail && (
              <p className="text-base font-semibold leading-snug text-[color:var(--p-navy)]">
                {labelled.you.title}: {labelled.you.detail}
              </p>
            )}
          </div>
          <OnArt art={art} {...labelled} />
        </div>
      ) : wide ? (
        // Headline, then art, then cards on a phone; the art takes a right column beside both on a wide screen.
        <div className={cn("relative grid gap-x-6 gap-y-3", art && "sm:grid-cols-[minmax(0,1fr)_14rem] sm:grid-rows-[auto_1fr]")}>
          {title && <Headline title={title} />}
          {artBox}
          <div className="sm:col-start-1">{body}</div>
        </div>
      ) : (
        <div className={cn("relative grid gap-5", art && "sm:grid-cols-[2fr_3fr]")}>
          {artBox}
          <div className="self-center">
            {title && <Headline title={title} />}
            {body}
          </div>
        </div>
      )}
    </figure>
  );
}
