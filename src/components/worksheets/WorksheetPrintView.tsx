import { cellKey, type WorksheetBlock } from "@/features/pre-rnf-worksheets/schema";
import { headline, personName, schemeFor } from "@/features/pre-rnf-worksheets/customize";
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
}: {
  title: string;
  subtitle: string;
  schema: WorksheetBlock[];
  values: WorksheetValues;
}) {
  const scheme = schemeFor(values);
  const name = personName(values);
  const customHeadline = headline(values);
  return (
    <div className="wpv">
      <style>{`
        .wpv { font-family: "Helvetica Neue", Arial, sans-serif; color: #1a1a1a; font-size: 14px; line-height: 1.5; }
        .wpv * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
        .wpv-name { font-size: 14px; font-weight: 700; color: ${scheme.accent}; }
        .wpv-title { font-size: 30px; font-weight: 800; margin: 4px 0 4px; }
        .wpv-sub { color: #444; font-size: 14px; margin: 0; max-width: 165mm; }
        .wpv-rule { height: 3px; width: 64px; background: ${scheme.accent}; margin: 12px 0 18px; border-radius: 2px; }
        .wpv-step { break-inside: avoid; margin: 18px 0 9px; border-bottom: 2px solid ${scheme.accent}; padding-bottom: 6px; }
        .wpv-step h3 { font-size: 18px; font-weight: 800; margin: 0; }
        .wpv-step p { font-size: 12px; color: #666; font-style: italic; margin: 4px 0 0; }
        .wpv-field { break-inside: avoid; margin: 10px 0; }
        .wpv-label { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
        .wpv-value { min-height: 20px; border-bottom: 1px solid #bbb; padding: 3px 2px 4px; white-space: pre-wrap; }
        .wpv-value.box { border: 1px solid #cfcfcf; border-radius: 4px; min-height: 46px; padding: 6px 8px; }
        .wpv table { width: 100%; border-collapse: collapse; margin: 7px 0; break-inside: avoid; }
        .wpv th, .wpv td { border: 1px solid #c8c8c8; padding: 7px 9px; text-align: left; vertical-align: top; }
        .wpv th { background: ${scheme.tint}; color: ${scheme.deep}; font-size: 12px; text-transform: uppercase; letter-spacing: .4px; }
        .wpv td.rowlabel { background: #fafafa; font-weight: 600; font-size: 13px; }
        .wpv td .wpv-cell { min-height: 20px; white-space: pre-wrap; }
        .wpv-note { background: ${scheme.tint}; border-left: 3px solid ${scheme.accent}; padding: 10px 14px; font-size: 13.5px; color: ${scheme.deep}; margin: 12px 0; }
        .wpv-table-label { font-size: 14px; font-weight: 700; margin: 9px 0 3px; }
      `}</style>

      {name && <div className="wpv-name">{name}</div>}
      <div className="wpv-title">{customHeadline || title}</div>
      <p className="wpv-sub">{subtitle}</p>
      <div className="wpv-rule" />

      {schema.map((block) => {
        switch (block.kind) {
          case "step":
            return (
              <div key={block.id} className="wpv-step">
                <h3>{block.label}</h3>
                {block.hint && <p>{block.hint}</p>}
              </div>
            );
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
            const rowCount = block.rowLabels?.length ?? block.rows ?? 1;
            const hasRowLabels = !!block.rowLabels?.length;
            return (
              <div key={block.id} className="wpv-field">
                {block.label && <div className="wpv-table-label">{block.label}</div>}
                <table>
                  <thead>
                    <tr>
                      {block.columns.map((c, ci) => (
                        <th key={ci}>{c || " "}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: rowCount }).map((_, r) => (
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
          default:
            return null;
        }
      })}
    </div>
  );
}
