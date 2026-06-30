import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { cellKey, type WorksheetBlock } from "@/features/pre-rnf-worksheets/schema";
import type { WorksheetValues } from "@/features/pre-rnf-worksheets/worksheets";

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
}: {
  schema: WorksheetBlock[];
  values: WorksheetValues;
  onChange?: (id: string, value: string) => void;
  readOnly?: boolean;
}) {
  const set = (id: string, v: string) => onChange?.(id, v);
  const val = (id: string) => values[id] ?? "";

  return (
    <div className="space-y-6">
      {schema.map((block) => {
        switch (block.kind) {
          case "step":
            return (
              <div key={block.id} className="border-b-2 border-primary/70 pb-1.5">
                <h3 className="font-serif text-base font-bold text-foreground sm:text-lg">
                  {block.label}
                </h3>
                {block.hint && (
                  <p className="mt-1 text-xs italic text-muted-foreground">{block.hint}</p>
                )}
              </div>
            );

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
                  />
                )}
              </div>
            );

          case "table": {
            const rowCount = block.rowLabels?.length ?? block.rows ?? 1;
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
                              <td key={c} className="border p-0">
                                {readOnly ? (
                                  <div className="min-h-8 px-2 py-1.5 text-sm">
                                    <ReadValue value={val(k)} />
                                  </div>
                                ) : (
                                  <input
                                    value={val(k)}
                                    onChange={(e) => set(k, e.target.value)}
                                    className="w-full bg-transparent px-2 py-1.5 text-sm outline-none focus:bg-primary/5"
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

          default:
            return null;
        }
      })}
    </div>
  );
}
