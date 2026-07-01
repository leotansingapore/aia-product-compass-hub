import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { CURATED_OBJECTIONS } from "@/data/curatedObjections";
import { GENERATED_OBJECTIONS } from "@/data/curatedObjections.generated";
import type { WorksheetValues } from "@/features/pre-rnf-worksheets/worksheets";

// The full objection library from the Objections sales tool, deduped + sorted.
const LIBRARY_OBJECTIONS = Array.from(
  new Set([...CURATED_OBJECTIONS, ...GENERATED_OBJECTIONS].map((o) => o.title)),
).sort((a, b) => a.localeCompare(b));

// Row-by-row objection handling: pick an objection (preset or your own) and write
// how you'll respond. Learners are asked to handle at least 5.
export default function ObjectionsTable({
  id,
  options,
  baseRows,
  values,
  onChange,
  readOnly = false,
}: {
  id: string;
  options: string[];
  baseRows: number;
  values: WorksheetValues;
  onChange?: (id: string, value: string) => void;
  readOnly?: boolean;
}) {
  const extra = Math.max(0, parseInt(values[`${id}__rows`] || "0", 10));
  const rowCount = baseRows + extra;
  const v = (k: string) => values[k] ?? "";

  // Objections already picked in any row — so each dropdown can hide the ones
  // already used elsewhere and narrow the remaining choices.
  const chosen = new Set<string>();
  for (let r = 0; r < rowCount; r++) {
    const t = v(`${id}__r${r}_type`);
    if (t && t !== "__other") chosen.add(t);
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-2/5 border bg-primary/5 px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-foreground/70">
                Objection
              </th>
              <th className="border bg-primary/5 px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-foreground/70">
                How I'll handle it
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }).map((_, r) => {
              const typeKey = `${id}__r${r}_type`;
              const otherKey = `${id}__r${r}_other`;
              const respKey = `${id}__r${r}_resp`;
              const type = v(typeKey);
              return (
                <tr key={r}>
                  <td className="border p-1.5 align-top">
                    {readOnly ? (
                      <div className="min-h-8 px-1 py-1 text-sm font-medium">
                        {type === "__other" ? v(otherKey) || <span className="text-muted-foreground/40">—</span> : type || <span className="text-muted-foreground/40">—</span>}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <select
                          value={type}
                          onChange={(e) => onChange?.(typeKey, e.target.value)}
                          className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                        >
                          <option value="">Choose…</option>
                          <optgroup label="Product / DIY">
                            {options
                              .filter((o) => o === type || !chosen.has(o))
                              .map((o) => (
                                <option key={o} value={o}>
                                  {o}
                                </option>
                              ))}
                          </optgroup>
                          <optgroup label="Warm-market objection library">
                            {LIBRARY_OBJECTIONS.filter(
                              (o) => !options.includes(o) && (o === type || !chosen.has(o)),
                            ).map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </optgroup>
                          <option value="__other">Other…</option>
                        </select>
                        {type === "__other" && (
                          <input
                            value={v(otherKey)}
                            onChange={(e) => onChange?.(otherKey, e.target.value)}
                            placeholder="Type the objection"
                            className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                          />
                        )}
                      </div>
                    )}
                  </td>
                  <td className="border p-1.5 align-top">
                    {readOnly ? (
                      <div className="min-h-8 whitespace-pre-wrap px-1 py-1 text-sm">
                        {v(respKey) || <span className="text-muted-foreground/40">—</span>}
                      </div>
                    ) : (
                      <Textarea
                        value={v(respKey)}
                        onChange={(e) => onChange?.(respKey, e.target.value)}
                        rows={2}
                        className="min-h-0 text-sm"
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!readOnly && (
        <button
          type="button"
          onClick={() => onChange?.(`${id}__rows`, String(extra + 1))}
          className={cn("text-xs font-medium text-primary hover:underline")}
        >
          + Add objection
        </button>
      )}
    </div>
  );
}
