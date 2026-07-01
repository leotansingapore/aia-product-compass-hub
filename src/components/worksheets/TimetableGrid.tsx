import { useRef, useState } from "react";
import { Eraser } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TT_CATEGORIES,
  TT_DAYS,
  TT_HOURS,
  hourLabel,
  ttCategory,
  ttKey,
} from "@/features/pre-rnf-worksheets/timetable";
import type { WorksheetValues } from "@/features/pre-rnf-worksheets/worksheets";

// Colour-coded weekly planner. Pick a category (or the eraser), then click — or
// click-and-drag — across the grid to paint hours. Each cell stores its category
// key in the worksheet values, so it saves and exports like every other field.
export default function TimetableGrid({
  values,
  onChange,
  readOnly = false,
}: {
  values: WorksheetValues;
  onChange?: (id: string, value: string) => void;
  readOnly?: boolean;
}) {
  const [brush, setBrush] = useState<string>(TT_CATEGORIES[0].key);
  const painting = useRef(false);

  const paint = (key: string) => {
    if (readOnly) return;
    onChange?.(key, brush === "__erase" ? "" : brush);
  };

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-muted-foreground">Fill with:</span>
          {TT_CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setBrush(c.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                brush === c.key ? "ring-2 ring-offset-1" : "hover:bg-muted/50",
              )}
              style={brush === c.key ? ({ "--tw-ring-color": c.color } as React.CSSProperties) : undefined}
            >
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
              {c.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setBrush("__erase")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
              brush === "__erase" ? "ring-2 ring-offset-1 ring-foreground/40" : "hover:bg-muted/50",
            )}
          >
            <Eraser className="h-3 w-3" />
            Erase
          </button>
        </div>
      )}

      <div
        className="overflow-x-auto select-none"
        onPointerUp={() => (painting.current = false)}
        onPointerLeave={() => (painting.current = false)}
      >
        <table className="w-full border-collapse text-xs" style={{ minWidth: 520 }}>
          <thead>
            <tr>
              <th className="w-12 border bg-muted/50 p-1 text-[10px] font-semibold text-muted-foreground">
                Time
              </th>
              {TT_DAYS.map((d) => (
                <th key={d} className="border bg-muted/50 p-1 text-[11px] font-semibold">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TT_HOURS.map((h) => (
              <tr key={h}>
                <td className="border bg-muted/30 px-1 py-0.5 text-right text-[10px] font-medium text-muted-foreground">
                  {hourLabel(h)}
                </td>
                {TT_DAYS.map((d) => {
                  const key = ttKey(d, h);
                  const cat = ttCategory(values[key]);
                  return (
                    <td
                      key={d}
                      className={cn("h-6 border p-0", !readOnly && "cursor-pointer")}
                      style={{ backgroundColor: cat?.color ?? "transparent" }}
                      title={cat?.label ?? ""}
                      onPointerDown={() => {
                        painting.current = true;
                        paint(key);
                      }}
                      onPointerEnter={() => {
                        if (painting.current) paint(key);
                      }}
                    />
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
