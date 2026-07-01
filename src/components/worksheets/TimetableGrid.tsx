import { useRef, useState } from "react";
import { Eraser, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TT_CATEGORIES,
  TT_CUSTOM_KEY,
  TT_DAYS,
  TT_HOURS,
  TT_OVERRIDES_KEY,
  allCategories,
  effectiveBuiltins,
  hourLabel,
  parseCustomCats,
  parseOverrides,
  resolveCat,
  ttKey,
} from "@/features/pre-rnf-worksheets/timetable";
import type { WorksheetValues } from "@/features/pre-rnf-worksheets/worksheets";

// Colour-coded weekly planner. Pick an activity (or the eraser), then click — or
// click-and-drag — across the grid to paint hours. Every activity's name and
// colour is editable (built-ins via overrides, custom ones inline); custom
// activities can also be deleted. Everything persists in the worksheet values.
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
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#0ea5e9");

  const custom = parseCustomCats(values);
  const builtins = effectiveBuiltins(values);
  const cats = allCategories(values);
  const builtinKeys = new Set(TT_CATEGORIES.map((c) => c.key));

  const paint = (key: string) => {
    if (readOnly) return;
    onChange?.(key, brush === "__erase" ? "" : brush);
  };

  const patchCat = (key: string, patch: { label?: string; color?: string }) => {
    if (builtinKeys.has(key)) {
      const ov = parseOverrides(values);
      ov[key] = { ...ov[key], ...patch };
      onChange?.(TT_OVERRIDES_KEY, JSON.stringify(ov));
    } else {
      onChange?.(
        TT_CUSTOM_KEY,
        JSON.stringify(custom.map((c) => (c.key === key ? { ...c, ...patch } : c))),
      );
    }
  };

  const addCategory = () => {
    const label = newLabel.trim();
    if (!label) return;
    const key = `custom_${Date.now().toString(36)}`;
    onChange?.(TT_CUSTOM_KEY, JSON.stringify([...custom, { key, label, color: newColor }]));
    setNewLabel("");
    setBrush(key);
  };

  const deleteCat = (key: string) => {
    onChange?.(TT_CUSTOM_KEY, JSON.stringify(custom.filter((c) => c.key !== key)));
    for (const d of TT_DAYS) {
      for (const h of TT_HOURS) {
        const ck = ttKey(d, h);
        if (values[ck] === key) onChange?.(ck, "");
      }
    }
    if (brush === key) setBrush(TT_CATEGORIES[0].key);
  };

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-muted-foreground">Fill with:</span>
          {cats.map((c) => {
            const isCustom = !builtinKeys.has(c.key);
            return (
              <span
                key={c.key}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border py-0.5 pl-1 pr-1.5 text-xs font-medium transition-all",
                  brush === c.key ? "ring-2 ring-offset-1" : "hover:bg-muted/50",
                )}
                style={brush === c.key ? ({ "--tw-ring-color": c.color } as React.CSSProperties) : undefined}
              >
                <input
                  type="color"
                  value={c.color}
                  onChange={(e) => patchCat(c.key, { color: e.target.value })}
                  className="h-4 w-4 shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0"
                  title="Change colour"
                />
                <input
                  value={c.label}
                  onFocus={() => setBrush(c.key)}
                  onChange={(e) => patchCat(c.key, { label: e.target.value })}
                  size={Math.max(4, c.label.length)}
                  className="cursor-text rounded bg-transparent px-1 py-0.5 outline-none focus:bg-background"
                  title="Rename — click to also select this activity"
                />
                {isCustom && (
                  <button
                    type="button"
                    onClick={() => deleteCat(c.key)}
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Delete activity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            );
          })}
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
          <span className="mx-1 h-4 w-px bg-border" />
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="h-6 w-6 cursor-pointer rounded border p-0"
            title="Pick a colour"
          />
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
            placeholder="Add your own activity…"
            className="h-7 w-40 rounded-md border px-2 text-xs"
          />
          <button
            type="button"
            onClick={addCategory}
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium hover:bg-muted/50"
          >
            <Plus className="h-3 w-3" />
            Add
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
                  const cat = resolveCat(values[key], cats);
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
