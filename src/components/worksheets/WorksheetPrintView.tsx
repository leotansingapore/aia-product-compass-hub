import { blockIsEmpty, cellKey, omitKey, type WorksheetBlock } from "@/features/pre-rnf-worksheets/schema";
import { headline, personName, schemeFor, themeFor } from "@/features/pre-rnf-worksheets/customize";
import {
  TT_DAYS,
  TT_HOURS,
  allCategories,
  hourLabel,
  readableTextColor,
  resolveCat,
  ttKey,
  ttNoteKey,
} from "@/features/pre-rnf-worksheets/timetable";
import { EPS_TABLE, money } from "@/features/pre-rnf-worksheets/recognition";
import type { WorksheetValues } from "@/features/pre-rnf-worksheets/worksheets";

// A print/PDF render of a worksheet that mirrors the downloadable PDF template:
// section heads ruled in the chosen accent colour, bordered tables, and the
// learner's name. Uses inline styles + a scoped <style> so the look survives
// Tailwind purging and the browser's colour stripping.
const v = (values: WorksheetValues, id: string) => values[id] ?? "";

function FieldValue({ value }: { value: string }) {
  return (
    <div className="wpv-value">{value.trim() ? value : " "}</div>
  );
}

export default function WorksheetPrintView({
  title,
  subtitle,
  schema,
  values,
  images,
  autofill,
  bare = false,
}: {
  title: string;
  subtitle: string;
  schema: WorksheetBlock[];
  values: WorksheetValues;
  images?: Record<string, string>;
  autofill?: Record<string, string>;
  /** Render only the blocks (no cover/title header) — used inside deck slides. */
  bare?: boolean;
}) {
  const scheme = schemeFor(values);
  const theme = themeFor(values);
  const name = personName(values);
  const customHeadline = headline(values);
  const showCover = values._cover === "yes";
  // Theme-derived CSS fragments (see PrintTheme in customize.ts).
  const headCss = `font-family: ${theme.headFont}; font-weight: ${theme.headWeight}; text-transform: ${theme.headCase}; letter-spacing: ${theme.headCase === "uppercase" ? ".5px" : "0"};`;
  const cellBorder =
    theme.tableBorders === "horizontal"
      ? `border: none; border-bottom: 1px solid ${theme.tableBorderColor};`
      : `border: 1px solid ${theme.tableBorderColor};`;
  const thCss = {
    tint: `background: ${scheme.tint}; color: ${scheme.deep};`,
    solid: `background: ${scheme.accent}; color: #ffffff;`,
    ink: `background: ${theme.bandBg}; color: #ffffff;`,
    plain: `background: transparent; color: ${theme.mutedInk}; border-bottom: 2px solid ${scheme.accent};`,
  }[theme.thStyle];
  const stepCss = {
    underline: `border-bottom: ${theme.key === "bold" ? 4 : 2}px solid ${scheme.accent}; padding-bottom: 6px;`,
    hairline: `border-bottom: 1px solid ${theme.tableBorderColor}; padding-bottom: 8px;`,
    band: `background: ${theme.bandBg}; padding: 9px 12px 8px; border-radius: 3px;`,
  }[theme.stepStyle];
  const band = theme.stepStyle === "band";
  // Section numbers sit ON the dark band in band themes — a dark accent (e.g.
  // Slate/Charcoal) would disappear there, so fall back to white.
  const accentLum = (() => {
    const m = /^#([0-9a-f]{6})$/i.exec(scheme.accent);
    if (!m) return 0;
    const n = parseInt(m[1], 16);
    return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  })();
  const bandNumColor = band && accentLum < 0.32 ? "#ffffff" : scheme.accent;

  // Export options (all ride the worksheet values like the theme does).
  const hideEmpty = values._hide_empty === "yes";
  const showDate = values._cover_date !== "no";
  const contact = (values._contact ?? "").trim();

  // Respect section toggles and (optionally) drop unanswered blocks, then prune
  // any heading whose whole section ended up empty so it isn't stranded.
  const visibleSchema = (() => {
    const kept: WorksheetBlock[] = [];
    let omit = false;
    for (const b of schema) {
      if (b.kind === "step") {
        omit = values[omitKey(b.id)] === "yes";
        if (!omit) kept.push(b);
        continue;
      }
      if (omit) continue;
      if (hideEmpty && blockIsEmpty(b, values, { images, autofill })) continue;
      kept.push(b);
    }
    // A heading survives only if real learner content follows it before the
    // next heading — fixed notes and the closing pledge don't count, so an
    // emptied section's heading goes while the closers still print.
    return kept.filter((b, i) => {
      if (b.kind !== "step") return true;
      for (let j = i + 1; j < kept.length && kept[j].kind !== "step"; j++) {
        if (kept[j].kind !== "note" && kept[j].kind !== "pledge") return true;
      }
      return false;
    });
  })();
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
  return (
    <div className="wpv">
      <style>{`
        .wpv { font-family: ${theme.bodyFont}; color: ${theme.ink}; font-size: 14px; line-height: 1.5; background: ${theme.pageTint}; }
        .wpv * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
        .wpv-cover { position: relative; min-height: 1040px; display: flex; flex-direction: column; justify-content: center; padding: 30px 6px; break-inside: avoid; break-after: page; }
        .wpv-cover .cbar { position: absolute; top: 0; left: 0; height: 9px; width: 100%; background: ${theme.darkCover ? theme.bandBg : scheme.accent}; }
        .wpv-cover .ckick { letter-spacing: 5px; font-size: 12px; font-weight: 800; color: ${scheme.accent}; text-transform: uppercase; font-family: ${theme.headFont}; }
        .wpv-cover h1 { ${headCss} font-size: ${theme.headCase === "uppercase" ? 40 : 46}px; line-height: 1.08; margin: 12px 0 8px; }
        .wpv-cover .csub { font-size: 16px; color: ${theme.mutedInk}; max-width: 150mm; margin: 10px 0 0; }
        .wpv-cover .crule { height: 5px; width: 90px; background: ${scheme.accent}; margin: 26px 0; border-radius: 3px; }
        .wpv-cover .cprep { font-size: 16px; }
        .wpv-cover .cprep b { color: ${scheme.accent}; }
        .wpv-cover .ccontact { font-size: 13.5px; color: ${theme.mutedInk}; margin-top: 8px; }
        .wpv-cover .cdate { font-size: 13px; color: ${theme.mutedInk}; margin-top: 4px; }
        .wpv-name { font-size: 14px; font-weight: 700; color: ${scheme.accent}; font-family: ${theme.headFont}; }
        .wpv-title { ${headCss} font-size: ${theme.headCase === "uppercase" ? 26 : 30}px; margin: 4px 0 4px; }
        .wpv-sub { color: ${theme.mutedInk}; font-size: 14px; margin: 0; max-width: 165mm; }
        .wpv-rule { height: 3px; width: 64px; background: ${scheme.accent}; margin: 12px 0 18px; border-radius: 2px; }
        .wpv-step { break-inside: avoid; margin: 18px 0 9px; ${stepCss} }
        .wpv-step h3 { ${headCss} font-size: ${theme.headCase === "uppercase" ? 16.5 : 18}px; margin: 0; ${band ? "color: #ffffff;" : ""} }
        /* NOTE: no flex/inline-flex centering anywhere in this stylesheet — html2canvas
           (the PDF rasteriser) mis-places glyphs inside flex-centred boxes and the
           accumulated height drift makes page cuts land mid-line. Centre with
           line-height + inline-block instead. */
        .wpv-badge { color: ${bandNumColor}; font-size: ${theme.headCase === "uppercase" ? 17 : 19}px; font-weight: ${theme.headWeight}; letter-spacing: .5px; margin-right: 9px; font-family: ${theme.headFont}; }
        .wpv-step p { font-size: 12px; color: ${band ? "rgba(255,255,255,.78)" : theme.mutedInk}; font-style: italic; margin: 4px 0 0; }
        .wpv-field { break-inside: avoid; margin: 10px 0; }
        .wpv-label { font-size: 13.5px; font-weight: 700; margin-bottom: 4px; font-family: ${theme.headFont}; }
        .wpv-value { min-height: 20px; border-bottom: 1px solid ${theme.boxBorderColor}; padding: 3px 2px 4px; white-space: pre-wrap; }
        .wpv-value.box { border: ${theme.key === "bold" ? "1.5px" : "1px"} solid ${theme.boxBorderColor}; border-radius: ${theme.key === "minimal" ? 0 : 4}px; min-height: 46px; padding: 6px 8px; }
        .wpv table { width: 100%; border-collapse: collapse; margin: 7px 0; break-inside: avoid; }
        .wpv th, .wpv td { ${cellBorder} padding: 7px 9px; text-align: left; vertical-align: top; }
        .wpv th { ${thCss} font-size: 12px; text-transform: uppercase; letter-spacing: .4px; word-break: normal; overflow-wrap: normal; hyphens: none; font-family: ${theme.headFont}; font-weight: 700; }
        .wpv td.rowlabel { background: ${theme.tableBorders === "horizontal" || theme.zebra ? "transparent" : "#fafafa"}; font-weight: 600; font-size: 13px; }
        ${theme.zebra ? `.wpv table:not(.wpv-tt) tbody tr:nth-child(even) td { background: ${scheme.tint}; }` : ""}
        .wpv td .wpv-cell { min-height: 20px; white-space: pre-wrap; }
        .wpv-note { background: ${scheme.tint}; border-left: 3px solid ${scheme.accent}; padding: 10px 14px; font-size: 13.5px; color: ${scheme.deep}; margin: 12px 0; }
        .wpv-table-label { font-size: 13.5px; font-weight: 700; margin: 9px 0 3px; font-family: ${theme.headFont}; }
        .wpv-legend { margin: 4px 0 6px; font-size: 11px; }
        .wpv-legend .lg { display: inline-block; margin: 0 10px 3px 0; }
        .wpv-legend .sw { width: 11px; height: 11px; border-radius: 2px; display: inline-block; vertical-align: -1.5px; margin-right: 5px; }
        .wpv-tt { width: 100%; border-collapse: collapse; margin: 4px 0; break-inside: avoid; table-layout: fixed; }
        .wpv-tt th, .wpv-tt td { border: 1px solid #ccc; height: 16px; font-size: 9px; text-align: center; padding: 0; }
        .wpv-tt th { background: #efefef; font-weight: 700; }
        .wpv-tt td.tt-cell { height: 26px; padding: 1px 2px; font-size: 7px; line-height: 1.1; text-align: left; vertical-align: top; overflow: hidden; word-break: break-word; }
        .wpv-tt td.tt-time { background: #fafafa; text-align: right; padding: 0 4px; color: #555; white-space: nowrap; width: 34px; }
        .wpv-check { margin: 5px 0; font-size: 13px; break-inside: avoid; }
        .wpv-check .bx { position: relative; display: inline-block; width: 15px; height: 15px; border: 1.5px solid #555; border-radius: 3px; vertical-align: -2.5px; margin-right: 8px; }
        .wpv-check .bx.round { border-radius: 50%; }
        /* Tick and dot are drawn with borders/backgrounds (not glyphs) so the PDF
           rasteriser places them exactly. */
        .wpv-check .bx .tick { position: absolute; left: 2px; top: 2.5px; width: 8px; height: 4.5px; border-left: 2px solid #16a34a; border-bottom: 2px solid #16a34a; transform: rotate(-45deg); }
        .wpv-check .bx .dot { position: absolute; left: 3px; top: 3px; width: 6px; height: 6px; border-radius: 50%; background: #16a34a; }
        .wpv-st { display: inline-block; width: 10px; height: 10px; border-radius: 2px; vertical-align: -2px; margin-right: 5px; }
        .wpv-pill { font-size: 12px; font-weight: 700; }
      `}</style>

      {bare ? null : showCover ? (
        <div className="wpv-cover">
          <div className="cbar" />
          <div className="ckick">Business Plan</div>
          <h1>{customHeadline || title}</h1>
          <p className="csub">{subtitle}</p>
          <div className="crule" />
          {name && (
            <div className="cprep">
              Prepared by <b>{name}</b>
            </div>
          )}
          {contact && <div className="ccontact">{contact}</div>}
          <div className="cdate">
            {visibleSchema.filter((b) => b.kind === "step" && /^\d+\./.test(b.label)).length} sections
            {showDate && coverDate ? ` · ${coverDate}` : ""}
          </div>
        </div>
      ) : (
        <>
          {name && <div className="wpv-name">{name}</div>}
          <div className="wpv-title">{customHeadline || title}</div>
          <p className="wpv-sub">{subtitle}</p>
          <div className="wpv-rule" />
        </>
      )}

      {visibleSchema.map((block) => {
        switch (block.kind) {
          case "step": {
            // Drop the vision-board heading from the PDF when there's no board.
            if (block.id === "svb" && !images?.vision_board) return null;
            // Drop the 100 Whys heading when there's nothing written or pulled in.
            if (
              block.id === "s100w" &&
              !v(values, "hundred_whys_text").trim() &&
              !(autofill?.hundred_whys_text ?? "").trim()
            )
              return null;
            const m = block.label.match(/^(\d+)\.\s*(.*)$/);
            return (
              <div key={block.id} className="wpv-step">
                <h3>
                  {m ? (
                    <>
                      <span className="wpv-badge">{m[1].padStart(2, "0")}</span>
                      {m[2]}
                    </>
                  ) : (
                    block.label
                  )}
                </h3>
                {block.pdfHint && <p>{block.pdfHint}</p>}
              </div>
            );
          }
          case "text":
            return (
              <div key={block.id} className="wpv-field">
                <div className="wpv-label">{block.label}</div>
                <FieldValue value={v(values, block.id)} />
              </div>
            );
          case "textarea":
            return (
              <div key={block.id} className="wpv-field">
                <div className="wpv-label">{block.label}</div>
                <div className="wpv-value box">{v(values, block.id).trim() ? v(values, block.id) : " "}</div>
              </div>
            );
          case "table": {
            const baseRows = block.rowLabels?.length ?? block.rows ?? 1;
            const extra = block.addRows
              ? Math.max(0, parseInt(v(values, `${block.id}__rows`) || "0", 10))
              : 0;
            const hasRowLabels = !!block.rowLabels?.length;
            // With "hide unanswered fields" on, blank rows in free tables are
            // dropped (labelled rows keep their structure).
            const rowIdx = Array.from({ length: baseRows + extra }, (_, r) => r).filter(
              (r) =>
                hasRowLabels ||
                !hideEmpty ||
                block.columns.some((_, c) => v(values, cellKey(block.id, r, c)).trim()),
            );
            return (
              <div key={block.id} className="wpv-field">
                {block.label && <div className="wpv-table-label">{block.label}</div>}
                <table>
                  <thead>
                    <tr>
                      {block.columns.map((c, ci) => (
                        <th key={ci} style={block.colWidths?.[ci] ? { width: block.colWidths[ci] } : undefined}>{c || " "}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rowIdx.map((r) => (
                      <tr key={r}>
                        {block.columns.map((_, c) => {
                          if (hasRowLabels && c === 0) {
                            return (
                              <td key={c} className="rowlabel">
                                {block.rowLabels![r]}
                              </td>
                            );
                          }
                          const val = v(values, cellKey(block.id, r, c));
                          return (
                            <td key={c}>
                              <div className="wpv-cell">{val.trim() ? val : " "}</div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          case "note":
            return (
              <p key={block.id} className="wpv-note">
                {block.text}
              </p>
            );

          case "whys": {
            const text = v(values, block.id).trim() || (autofill?.[block.id] ?? "").trim();
            if (!text) return null; // omit entirely from the PDF when empty
            return (
              <div key={block.id} className="wpv-field">
                {block.label && <div className="wpv-label">{block.label}</div>}
                <div className="wpv-value box">{text}</div>
              </div>
            );
          }

          case "pledge": {
            const who = (values._name ?? "").trim();
            const signed = v(values, `${block.id}_signed`).trim();
            const date = v(values, `${block.id}_date`).trim();
            return (
              <div
                key={block.id}
                className="wpv-field"
                style={{
                  border: `2px solid ${scheme.accent}`,
                  borderRadius: "8px",
                  padding: "16px 18px",
                  marginTop: "16px",
                  breakInside: "avoid",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    letterSpacing: "3px",
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    color: scheme.accent,
                  }}
                >
                  {block.heading}
                </div>
                <p style={{ textAlign: "center", fontSize: "13.5px", lineHeight: 1.6, margin: "10px 0 0" }}>
                  {who ? `I, ${who}, ` : "I "}
                  {block.text}
                </p>
                <div style={{ display: "flex", gap: "24px", marginTop: "26px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ borderBottom: "1.5px solid #333", minHeight: "44px", paddingLeft: "2px", display: "flex", alignItems: "flex-end" }}>
                      {signed.startsWith("data:image") ? (
                        <img src={signed} alt="Signature" style={{ maxHeight: "42px", maxWidth: "100%" }} />
                      ) : (
                        <span style={{ fontFamily: "Georgia, serif", fontSize: "18px" }}>{signed || " "}</span>
                      )}
                    </div>
                    <div style={{ fontSize: "11px", color: "#666", marginTop: "3px", textTransform: "uppercase", letterSpacing: ".5px" }}>
                      Signed
                    </div>
                  </div>
                  <div style={{ width: "150px" }}>
                    <div style={{ borderBottom: "1.5px solid #333", minHeight: "26px", fontSize: "14px", paddingLeft: "2px" }}>
                      {date || " "}
                    </div>
                    <div style={{ fontSize: "11px", color: "#666", marginTop: "3px", textTransform: "uppercase", letterSpacing: ".5px" }}>
                      Date
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          case "image": {
            const src = images?.[block.id];
            if (!src) return null; // omit from the PDF when there's no image
            return (
              <div key={block.id} className="wpv-field" style={{ textAlign: "center" }}>
                <img
                  src={src}
                  alt={block.label ?? ""}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "150mm",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              </div>
            );
          }

          case "timetable": {
            const ttAll = allCategories(values);
            return (
              <div key={block.id} className="wpv-field">
                <div className="wpv-legend">
                  {ttAll.map((c) => (
                    <span key={c.key} className="lg">
                      <span className="sw" style={{ background: c.color }} />
                      {c.label}
                    </span>
                  ))}
                </div>
                <table className="wpv-tt">
                  <thead>
                    <tr>
                      <th style={{ width: "34px" }}>Time</th>
                      {TT_DAYS.map((d) => (
                        <th key={d}>{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TT_HOURS.map((h) => (
                      <tr key={h}>
                        <td className="tt-time">{hourLabel(h)}</td>
                        {TT_DAYS.map((d) => {
                          const c = resolveCat(values[ttKey(d, h)], ttAll);
                          const note = (values[ttNoteKey(d, h)] ?? "").trim();
                          return (
                            <td
                              key={d}
                              className="tt-cell"
                              style={{
                                background: c?.color ?? "#ffffff",
                                color: note ? readableTextColor(c?.color) : undefined,
                              }}
                            >
                              {note}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          case "checklist":
            return (
              <div key={block.id} className="wpv-field">
                {block.label && <div className="wpv-table-label">{block.label}</div>}
                {block.items.map((item) => {
                  const v = (values[`${block.id}__${item.id}`] ?? "").trim();
                  if (item.type === "check") {
                    return (
                      <div key={item.id} className="wpv-check">
                        <span className="bx">{v === "yes" && <span className="tick" />}</span>
                        {item.text}
                      </div>
                    );
                  }
                  if (item.type === "radio") {
                    const selected =
                      (values[`${block.id}__grp_${item.group ?? "g"}`] ?? "").trim() === item.id;
                    return (
                      <div key={item.id} className="wpv-check">
                        <span className="bx round">{selected && <span className="dot" />}</span>
                        {item.text}
                      </div>
                    );
                  }
                  if (item.type === "scale") {
                    return (
                      <div key={item.id} className="wpv-check">
                        {item.text} — <b>&nbsp;{v !== "" ? v : "__"}</b>&nbsp;/ 10
                      </div>
                    );
                  }
                  const sw = v === "Done" ? "#16a34a" : v === "In progress" ? "#d97706" : "#94a3b8";
                  const ink = v === "Done" ? "#15803d" : v === "In progress" ? "#b45309" : "#64748b";
                  return (
                    <div key={item.id} className="wpv-check">
                      {item.text} —&nbsp;
                      <span className="wpv-st" style={{ background: sw }} />
                      <span className="wpv-pill" style={{ color: ink }}>{v || "Not done"}</span>
                    </div>
                  );
                })}
              </div>
            );

          case "eps": {
            const level = (values.eps_target ?? "").trim();
            const arr = EPS_TABLE[level];
            if (!arr) {
              return (
                <div key={block.id} className="wpv-field">
                  <div className="wpv-label">EPS I'm gunning for</div>
                  <div className="wpv-value"> </div>
                </div>
              );
            }
            return (
              <div key={block.id} className="wpv-field">
                <div className="wpv-table-label">
                  EPS target: {money(Number(level))} / month — cumulative FYC to validate, by month
                </div>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "10%" }}>Mo</th>
                      <th style={{ width: "40%" }}>Cumulative FYC</th>
                      <th style={{ width: "10%" }}>Mo</th>
                      <th style={{ width: "40%" }}>Cumulative FYC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <tr key={i}>
                        <td className="rowlabel">{i + 1}</td>
                        <td>{money(arr[i])}</td>
                        <td className="rowlabel">{i + 13}</td>
                        <td>{money(arr[i + 12])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          // Reference links / tools are interactive helpers for filling the plan
          // in-app — they're intentionally omitted from the printed/exported PDF.
          case "links":
            return null;

          case "objections": {
            const extra = Math.max(0, parseInt(values[`${block.id}__rows`] || "0", 10));
            const objIdx = Array.from({ length: (block.rows ?? 5) + extra }, (_, r) => r).filter(
              (r) =>
                !hideEmpty ||
                (values[`${block.id}__r${r}_type`] ?? "").trim() ||
                (values[`${block.id}__r${r}_resp`] ?? "").trim(),
            );
            return (
              <div key={block.id} className="wpv-field">
                {block.label && <div className="wpv-table-label">{block.label}</div>}
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "34%" }}>Objection</th>
                      <th>How I'll handle it</th>
                    </tr>
                  </thead>
                  <tbody>
                    {objIdx.map((r) => {
                      const type = (values[`${block.id}__r${r}_type`] ?? "").trim();
                      const obj = type === "__other" ? (values[`${block.id}__r${r}_other`] ?? "").trim() : type;
                      const resp = (values[`${block.id}__r${r}_resp`] ?? "").trim();
                      return (
                        <tr key={r}>
                          <td className="rowlabel">{obj || " "}</td>
                          <td><div className="wpv-cell">{resp || " "}</div></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
