import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { cellKey, STATUS_OPTIONS, type WorksheetBlock } from "@/features/pre-rnf-worksheets/schema";
import { ExternalLink } from "lucide-react";
import TimetableGrid from "@/components/worksheets/TimetableGrid";
import EpsTargetTable from "@/components/worksheets/EpsTargetTable";
import ObjectionsTable from "@/components/worksheets/ObjectionsTable";
import SignaturePad from "@/components/worksheets/SignaturePad";
import type { WorksheetValues } from "@/features/pre-rnf-worksheets/worksheets";

function statusActiveClass(opt: string): string {
  if (opt === "Done") return "border-green-600 bg-green-600 text-white";
  if (opt === "In progress") return "border-amber-500 bg-amber-500 text-white";
  return "border-slate-400 bg-slate-400 text-white";
}

function ReadValue({ value, block }: { value: string; block?: boolean }) {
  if (value.trim().length === 0) {
    return <span className="text-muted-foreground/40">—</span>;
  }
  return <span className={cn("whitespace-pre-wrap", block && "block")}>{value}</span>;
}

export default function WorksheetForm({
  schema,
  values,
  onChange,
  readOnly = false,
  images,
  autofill,
}: {
  schema: WorksheetBlock[];
  values: WorksheetValues;
  onChange?: (id: string, value: string) => void;
  readOnly?: boolean;
  /** Resolved image srcs (e.g. the vision board) keyed by block id. */
  images?: Record<string, string>;
  /** Text pulled from an assignment (e.g. 100 Whys) keyed by block id. */
  autofill?: Record<string, string>;
}) {
  const set = (id: string, v: string) => onChange?.(id, v);
  const val = (id: string) => values[id] ?? "";

  return (
    <div className="space-y-6">
      {schema.map((block) => {
        switch (block.kind) {
          case "step": {
            const m = block.label.match(/^(\d+)\.\s*(.*)$/);
            return (
              <div key={block.id} className="border-b-2 border-primary/70 pb-1.5">
                <h3 className="flex items-center gap-2 font-serif text-base font-bold text-foreground sm:text-lg">
                  {m ? (
                    <>
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-primary px-1.5 text-sm font-bold text-primary-foreground">
                        {m[1]}
                      </span>
                      <span>{m[2]}</span>
                    </>
                  ) : (
                    block.label
                  )}
                </h3>
                {block.hint && (
                  <p className="mt-1 text-xs italic text-muted-foreground">{block.hint}</p>
                )}
              </div>
            );
          }

          case "text":
            return (
              <div key={block.id} className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">{block.label}</label>
                {readOnly ? (
                  <div className="min-h-8 rounded-md border bg-muted/20 px-3 py-1.5 text-sm">
                    <ReadValue value={val(block.id)} />
                  </div>
                ) : (
                  <Input value={val(block.id)} onChange={(e) => set(block.id, e.target.value)} />
                )}
              </div>
            );

          case "textarea":
            return (
              <div key={block.id} className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">{block.label}</label>
                {readOnly ? (
                  <div className="min-h-12 rounded-md border bg-muted/20 px-3 py-1.5 text-sm">
                    <ReadValue value={val(block.id)} block />
                  </div>
                ) : (
                  <Textarea
                    value={val(block.id)}
                    onChange={(e) => set(block.id, e.target.value)}
                    rows={block.rows ?? 4}
                    style={{ fieldSizing: "content" } as React.CSSProperties}
                    className="resize-y"
                  />
                )}
              </div>
            );

          case "table": {
            const baseRows = block.rowLabels?.length ?? block.rows ?? 1;
            const extra = block.addRows ? Math.max(0, parseInt(val(`${block.id}__rows`) || "0", 10)) : 0;
            const rowCount = baseRows + extra;
            const hasRowLabels = !!block.rowLabels?.length;
            return (
              <div key={block.id} className="space-y-2">
                {block.label && (
                  <p className="text-sm font-semibold text-foreground">{block.label}</p>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        {block.columns.map((c, ci) => (
                          <th
                            key={ci}
                            className="border bg-primary/5 px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-foreground/70"
                          >
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: rowCount }).map((_, r) => (
                        <tr key={r}>
                          {block.columns.map((_, c) => {
                            // First column is a fixed label when rowLabels exist.
                            if (hasRowLabels && c === 0) {
                              return (
                                <td
                                  key={c}
                                  className="border bg-muted/30 px-2 py-1.5 text-xs font-medium text-foreground/80"
                                >
                                  {block.rowLabels![r]}
                                </td>
                              );
                            }
                            const k = cellKey(block.id, r, c);
                            return (
                              <td key={c} className="border p-0 align-top">
                                {readOnly ? (
                                  <div className="min-h-8 whitespace-pre-wrap px-2 py-1.5 text-sm">
                                    <ReadValue value={val(k)} />
                                  </div>
                                ) : (
                                  <textarea
                                    value={val(k)}
                                    onChange={(e) => set(k, e.target.value)}
                                    rows={1}
                                    // field-sizing grows the box as they type / hit Enter;
                                    // browsers without it still allow multi-line + resize.
                                    style={{ fieldSizing: "content" } as React.CSSProperties}
                                    className="block w-full resize-y bg-transparent px-2 py-1.5 text-sm leading-snug outline-none focus:bg-primary/5"
                                  />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {block.addRows && !readOnly && (
                  <button
                    type="button"
                    onClick={() => set(`${block.id}__rows`, String(extra + 1))}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    + Add row
                  </button>
                )}
              </div>
            );
          }

          case "note":
            return (
              <p
                key={block.id}
                className="rounded-lg border-l-4 border-primary/70 bg-primary/5 px-4 py-3 text-sm text-foreground/80"
              >
                {block.text}
              </p>
            );

          case "timetable":
            return (
              <TimetableGrid
                key={block.id}
                values={values}
                onChange={onChange}
                readOnly={readOnly}
              />
            );

          case "eps":
            return (
              <EpsTargetTable
                key={block.id}
                values={values}
                onChange={onChange}
                readOnly={readOnly}
              />
            );

          case "links":
            return (
              <div key={block.id} className="space-y-1.5">
                {block.label && (
                  <p className="text-sm font-semibold text-foreground">{block.label}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {block.links.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            );

          case "objections":
            return (
              <div key={block.id} className="space-y-2">
                {block.label && (
                  <p className="text-sm font-semibold text-foreground">{block.label}</p>
                )}
                {block.hint && (
                  <p className="text-xs italic text-muted-foreground">{block.hint}</p>
                )}
                <ObjectionsTable
                  id={block.id}
                  options={block.options}
                  baseRows={block.rows ?? 5}
                  values={values}
                  onChange={onChange}
                  readOnly={readOnly}
                />
              </div>
            );

          case "image": {
            const src = images?.[block.id];
            return (
              <div key={block.id}>
                {src ? (
                  <img
                    src={src}
                    alt={block.label ?? "Image"}
                    className="max-h-80 w-full rounded-lg border bg-muted/20 object-contain"
                  />
                ) : (
                  <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                    {block.hint ?? "Nothing here yet."}
                  </div>
                )}
              </div>
            );
          }

          case "whys": {
            const fetched = autofill?.[block.id] ?? "";
            const current = val(block.id);
            // Nothing written and nothing pulled from the assignment yet — nudge
            // them to go do it (the value will flow in once they submit it).
            if (!current && !fetched) {
              return (
                <div
                  key={block.id}
                  className="rounded-lg border border-dashed bg-muted/20 p-5 text-center text-sm text-muted-foreground"
                >
                  <p>You haven't done your 100 Whys yet — that's the fuel behind this whole plan.</p>
                  <a
                    href={block.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 font-medium text-primary hover:bg-primary/5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Do my 100 Whys
                  </a>
                </div>
              );
            }
            return (
              <div key={block.id} className="space-y-1.5">
                {block.label && (
                  <label className="text-sm font-semibold text-foreground">{block.label}</label>
                )}
                {block.hint && (
                  <p className="text-xs italic text-muted-foreground">{block.hint}</p>
                )}
                {readOnly ? (
                  <div className="min-h-12 rounded-md border bg-muted/20 px-3 py-1.5 text-sm">
                    <ReadValue value={current || fetched} block />
                  </div>
                ) : (
                  // Bind to state only (it's pre-seeded from the assignment) so the
                  // field is fully editable — clearing it stays cleared.
                  <Textarea
                    value={current}
                    onChange={(e) => set(block.id, e.target.value)}
                    rows={6}
                    style={{ fieldSizing: "content" } as React.CSSProperties}
                    className="resize-y"
                  />
                )}
              </div>
            );
          }

          case "pledge": {
            const who = values._name?.trim();
            return (
              <div
                key={block.id}
                className="rounded-xl border-2 border-primary/60 bg-gradient-to-b from-primary/5 to-transparent p-5 sm:p-6"
              >
                <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                  {block.heading}
                </p>
                <p className="mt-3 text-center text-sm leading-relaxed text-foreground/90">
                  {who ? `I, ${who}, ` : "I "}
                  {block.text}
                </p>
                <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Signed
                    </label>
                    <SignaturePad
                      value={val(`${block.id}_signed`)}
                      onChange={(v) => set(`${block.id}_signed`, v)}
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-1.5 sm:w-40">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Date
                    </label>
                    {readOnly ? (
                      <div className="min-h-9 border-b-2 border-foreground/40 px-1 py-1 text-sm">
                        <ReadValue value={val(`${block.id}_date`)} />
                      </div>
                    ) : (
                      <input
                        value={val(`${block.id}_date`)}
                        onChange={(e) => set(`${block.id}_date`, e.target.value)}
                        placeholder="DD / MM / YYYY"
                        className="w-full border-0 border-b-2 border-foreground/40 bg-transparent px-1 py-1 text-sm outline-none focus:border-primary"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          }

          case "checklist":
            return (
              <div key={block.id} className="space-y-2.5">
                {block.label && (
                  <p className="text-sm font-semibold text-foreground">{block.label}</p>
                )}
                {block.items.map((item) => {
                  const k = `${block.id}__${item.id}`;
                  const v = val(k);
                  let control: JSX.Element;
                  if (item.type === "check") {
                    const checked = v === "yes";
                    control = (
                      <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => set(k, checked ? "" : "yes")}
                        className={cn(
                          "flex flex-1 items-center gap-3 rounded-lg border p-2.5 text-left text-sm transition-colors",
                          checked ? "border-green-500/40 bg-green-500/5" : "hover:bg-muted/40",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2",
                            checked ? "border-green-600 bg-green-600 text-white" : "border-muted-foreground/40",
                          )}
                        >
                          {checked && <Check className="h-3.5 w-3.5" />}
                        </span>
                        <span className="font-medium">{item.text}</span>
                      </button>
                    );
                  } else if (item.type === "radio") {
                    const gk = `${block.id}__grp_${item.group ?? "g"}`;
                    const selected = val(gk) === item.id;
                    control = (
                      <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => set(gk, selected ? "" : item.id)}
                        className={cn(
                          "flex flex-1 items-center gap-3 rounded-lg border p-2.5 text-left text-sm transition-colors",
                          selected ? "border-primary/50 bg-primary/5" : "hover:bg-muted/40",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                            selected ? "border-primary" : "border-muted-foreground/40",
                          )}
                        >
                          {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                        </span>
                        <span className="font-medium">{item.text}</span>
                      </button>
                    );
                  } else if (item.type === "scale") {
                    control = (
                      <div className="flex-1 rounded-lg border p-2.5">
                        <p className="mb-1.5 text-sm font-medium">{item.text}</p>
                        <div className="flex flex-wrap gap-1">
                          {Array.from({ length: 11 }).map((_, n) => (
                            <button
                              key={n}
                              type="button"
                              disabled={readOnly}
                              onClick={() => set(k, String(n))}
                              className={cn(
                                "h-7 w-7 rounded-md border text-xs font-semibold transition-colors",
                                v === String(n) ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
                              )}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  } else {
                    control = (
                      <div className="flex flex-1 flex-wrap items-center justify-between gap-2 rounded-lg border p-2.5">
                        <span className="text-sm font-medium">{item.text}</span>
                        <div className="flex gap-1">
                          {STATUS_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              disabled={readOnly}
                              onClick={() => set(k, opt)}
                              className={cn(
                                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                                v === opt ? statusActiveClass(opt) : "hover:bg-muted",
                              )}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={item.id} className="flex items-start gap-2">
                      {control}
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open the assignment"
                          className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/5"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Open
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
