import type { ReactNode } from "react";
import type { WorksheetBlock } from "@/features/pre-rnf-worksheets/schema";
import { headline, personName, schemeFor } from "@/features/pre-rnf-worksheets/customize";
import type { WorksheetValues } from "@/features/pre-rnf-worksheets/worksheets";
import WorksheetPrintView from "./WorksheetPrintView";

// Landscape "deck" render of a worksheet: one A4-landscape slide per section,
// with a cover slide and a table of contents — the professional alternative to
// the portrait document export. Slides are sized to the printable page
// (1123×793px ≈ A4 landscape @96dpi) so the PDF generator can cut one page per
// slide; the section content itself is rendered by WorksheetPrintView in `bare`
// mode so both exports share the same print-safe block renderers.
export const DECK_SLIDE_W = 1123;
export const DECK_SLIDE_H = 793;

type Slide = {
  key: string;
  /** "01"-style number for numbered sections. */
  num?: string;
  title: string;
  sub?: string;
  blocks: WorksheetBlock[];
  /** A follow-on slide inside the same numbered section (kept off the TOC). */
  cont?: boolean;
};

// Blocks too tall to share a landscape slide with the rest of their section —
// each gets a slide of its own (same section number, its own title).
const DECK_SPLITS: Record<string, { title: string; sub?: string; stripLabel?: boolean }> = {
  eps: { title: "My EPS pace", sub: "The cumulative FYC I promised to validate, month by month." },
  objections: {
    title: "Objection handling",
    sub: "The objections I knew I'd meet — and how I chose to answer them.",
    stripLabel: true,
  },
  prospect_ready: {
    title: "Am I ready to prospect?",
    sub: "A straight self-check before I pick up the phone.",
    stripLabel: true,
  },
};

function groupSlides(
  schema: WorksheetBlock[],
  values: WorksheetValues,
  images?: Record<string, string>,
  autofill?: Record<string, string>,
): Slide[] {
  const slides: Slide[] = [];
  let cur: Slide | null = null;
  for (const block of schema) {
    if (block.kind === "step") {
      const m = block.label.match(/^(\d+)\.\s*(.*)$/);
      cur = {
        key: block.id,
        num: m ? m[1].padStart(2, "0") : undefined,
        title: m ? m[2] : block.label,
        sub: block.pdfHint,
        blocks: [],
      };
      slides.push(cur);
      continue;
    }
    if (block.kind === "links") continue; // interactive helpers — not printed
    const split = DECK_SPLITS[block.id];
    if (split && cur) {
      cur = {
        key: `${cur.key}-${block.id}`,
        num: cur.num,
        title: split.title,
        sub: split.sub,
        cont: true,
        blocks: [],
      };
      slides.push(cur);
    }
    const printed =
      split?.stripLabel && "label" in block ? ({ ...block, label: undefined } as WorksheetBlock) : block;
    cur?.blocks.push(printed);
  }
  return slides.filter((s) => {
    // Drop slides whose content would be empty (no vision board / no whys).
    if (s.key === "svb") return !!images?.vision_board;
    if (s.key === "s100w")
      return !!(
        (values.hundred_whys_text ?? "").trim() || (autofill?.hundred_whys_text ?? "").trim()
      );
    return s.blocks.length > 0;
  });
}

/** Split the 100-whys text into `n` visually balanced columns, line-wise. */
function splitColumns(text: string, n: number): string[] {
  const lines = text.split("\n");
  const per = Math.ceil(lines.length / n);
  const cols: string[] = [];
  for (let i = 0; i < n; i++) cols.push(lines.slice(i * per, (i + 1) * per).join("\n"));
  return cols.filter((c) => c.trim().length > 0);
}

export default function WorksheetDeckPrintView({
  title,
  subtitle,
  schema,
  values,
  images,
  autofill,
}: {
  title: string;
  subtitle: string;
  schema: WorksheetBlock[];
  values: WorksheetValues;
  images?: Record<string, string>;
  autofill?: Record<string, string>;
}) {
  const scheme = schemeFor(values);
  const name = personName(values);
  const deckTitle = headline(values) || title;
  let coverDate = "";
  try {
    coverDate = new Date().toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    coverDate = "";
  }

  const slides = groupSlides(schema, values, images, autofill);
  const toc = slides.filter((s) => s.num && !s.cont);
  const whysText =
    (values.hundred_whys_text ?? "").trim() || (autofill?.hundred_whys_text ?? "").trim();

  const renderSlideBody = (s: Slide): ReactNode => {
    if (s.key === "svb") {
      const src = images?.vision_board;
      return (
        <div style={{ textAlign: "center", marginTop: "14px" }}>
          <img
            src={src}
            alt="Vision board"
            style={{ maxWidth: "92%", maxHeight: "560px", border: "1px solid #ddd", borderRadius: "4px" }}
          />
        </div>
      );
    }
    if (s.key === "s100w") {
      const cols = splitColumns(whysText, 3);
      const w = `${Math.floor(100 / cols.length)}%`;
      return (
        <div style={{ marginTop: "12px" }}>
          {cols.map((c, i) => (
            <div key={i} className="wdv-col" style={{ width: w }}>
              {c}
            </div>
          ))}
        </div>
      );
    }
    return (
      <WorksheetPrintView
        bare
        title=""
        subtitle=""
        schema={s.blocks}
        values={values}
        images={images}
        autofill={autofill}
      />
    );
  };

  return (
    <div className="wdv">
      <style>{`
        .wdv { font-family: "Helvetica Neue", Arial, sans-serif; color: #1a1a1a; font-size: 13px; line-height: 1.5; }
        .wdv * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
        /* Same rule as the portrait view: no flex centering — the PDF rasteriser
           (html2canvas) misplaces glyphs inside flex-centred boxes. */
        .wdv-slide { position: relative; width: ${DECK_SLIDE_W}px; min-height: ${DECK_SLIDE_H}px; background: #ffffff; padding: 42px 60px 46px; }
        .wdv-slide .bar { position: absolute; top: 0; left: 0; width: 100%; height: 7px; background: ${scheme.accent}; }
        .wdv-kick { letter-spacing: 4px; font-size: 10.5px; font-weight: 800; color: ${scheme.accent}; text-transform: uppercase; }
        .wdv-snum { color: ${scheme.accent}; font-size: 26px; font-weight: 800; letter-spacing: .5px; margin-right: 12px; }
        .wdv-slide h2 { font-size: 27px; font-weight: 800; margin: 6px 0 0; }
        .wdv-ssub { color: #666; font-style: italic; font-size: 13px; margin: 5px 0 0; }
        .wdv-srule { height: 4px; width: 64px; background: ${scheme.accent}; margin: 12px 0 6px; border-radius: 2px; }
        .wdv-col { display: inline-block; vertical-align: top; padding-right: 26px; white-space: pre-wrap; font-size: 10.5px; line-height: 1.55; }
        /* Cover */
        .wdv-cover { position: relative; width: ${DECK_SLIDE_W}px; min-height: ${DECK_SLIDE_H}px; background: #ffffff; }
        .wdv-cover .panel { position: absolute; top: 0; left: 0; bottom: 0; width: 420px; background: ${scheme.accent}; padding: 56px 44px; color: #fff; }
        .wdv-cover .panel .ck { letter-spacing: 4px; font-size: 11px; font-weight: 800; text-transform: uppercase; opacity: .92; }
        .wdv-cover .panel h1 { color: #fff; font-size: 37px; font-weight: 800; line-height: 1.12; margin: 14px 0 0; }
        .wdv-cover .panel .rl { height: 4px; width: 64px; background: #ffffff; opacity: .9; margin: 22px 0; border-radius: 2px; }
        .wdv-cover .panel .by { font-size: 15px; }
        .wdv-cover .panel .by b { font-size: 17px; }
        .wdv-cover .panel .dt { font-size: 12px; opacity: .85; margin-top: 6px; }
        .wdv-cover .toc { margin-left: 420px; padding: 52px 60px; }
        .wdv-cover .toc .th { letter-spacing: 3px; font-size: 11px; font-weight: 800; color: #999; text-transform: uppercase; margin-bottom: 14px; }
        .wdv-cover .toc .ti { font-size: 14.5px; font-weight: 600; margin: 9px 0; }
        .wdv-cover .toc .ti .n { color: ${scheme.accent}; font-weight: 800; display: inline-block; width: 34px; }
        .wdv-cover .toc .sub { color: #777; font-size: 12.5px; font-weight: 400; margin-top: 16px; max-width: 520px; }
        /* Landscape tuning of the shared block styles. */
        .wdv .wpv { font-size: 13px; }
        .wdv .wpv-value.box { min-height: 40px; }
      `}</style>

      {/* ── Cover slide ── */}
      <div className="wdv-cover">
        <div className="panel">
          <div className="ck">Business Plan</div>
          <h1>{deckTitle}</h1>
          <div className="rl" />
          {name && (
            <div className="by">
              Prepared by
              <br />
              <b>{name}</b>
            </div>
          )}
          {coverDate && <div className="dt">{coverDate}</div>}
        </div>
        <div className="toc">
          <div className="th">What's inside</div>
          {toc.map((s) => (
            <div key={s.key} className="ti">
              <span className="n">{s.num}</span>
              {s.title}
            </div>
          ))}
          <div className="sub">{subtitle}</div>
        </div>
      </div>

      {/* ── Section slides ── */}
      {slides.map((s) => (
        <div key={s.key} className="wdv-slide">
          <div className="bar" />
          <div className="wdv-kick">{name ? `${name} · Business Plan` : "Business Plan"}</div>
          <h2>
            {s.num && <span className="wdv-snum">{s.num}</span>}
            {s.title}
          </h2>
          {s.sub && <p className="wdv-ssub">{s.sub}</p>}
          <div className="wdv-srule" />
          {renderSlideBody(s)}
        </div>
      ))}
    </div>
  );
}
