import { useRef, useState } from "react";
import { Eraser, Plus, Trash2, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
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
  readableTextColor,
  resolveCat,
  ttKey,
  ttNoteKey,
} from "@/features/pre-rnf-worksheets/timetable";
import type { WorksheetValues } from "@/features/pre-rnf-worksheets/worksheets";

// Colour-coded weekly planner for time blocking. Drag across the grid to paint
// hours with the selected activity; single-click any cell to open its editor
// below the grid — pick a colour and type the task, remark, or goal for that
// block. Notes show inside the cell so you can see at a glance what each hour is
// set aside for. Every activity's name and colour is editable (built-ins via
// overrides, custom ones inline). Everything persists in the worksheet values.
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
  const dragged = useRef(false);
  const pressed = useRef<{ day: string; hour: number } | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#0ea5e9");
  const [editing, setEditing] = useState<{ day: string; hour: number } | null>(null);

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

  // The block currently open in the editor panel below the grid.
  const editKey = editing ? ttKey(editing.day, editing.hour) : "";
  const editNoteKey = editing ? ttNoteKey(editing.day, editing.hour) : "";
  const editCat = editing ? resolveCat(values[editKey], cats) : null;

  return (
    <div className="space-y-3">
      {!readOnly && (
        <>
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
          <p className="text-[11px] text-muted-foreground">
            Click a cell to set its colour and write what that time is for. Drag across cells to
            paint the selected activity quickly.
          </p>
        </>
      )}

      <div
        className="overflow-x-auto select-none"
        onPointerUp={() => (painting.current = false)}
        onPointerLeave={() => (painting.current = false)}
      >
        <table className="w-full border-collapse text-xs" style={{ minWidth: 560 }}>
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
                  const note = values[ttNoteKey(d, h)] ?? "";
                  const cat = resolveCat(values[key], cats);
                  const isEditing = editing?.day === d && editing?.hour === h;
                  return (
                    <td
                      key={d}
                      className={cn(
                        "h-9 border p-0.5 align-top",
                        !readOnly && "cursor-pointer",
                        isEditing && "ring-2 ring-inset ring-primary",
                      )}
                      style={{ backgroundColor: cat?.color ?? "transparent" }}
                      title={note || cat?.label || ""}
                      onPointerDown={() => {
                        if (readOnly) return;
                        painting.current = true;
                        dragged.current = false;
                        pressed.current = { day: d, hour: h };
                      }}
                      onPointerEnter={() => {
                        if (readOnly || !painting.current) return;
                        if (!dragged.current) {
                          dragged.current = true;
                          const start = pressed.current;
                          if (start) paint(ttKey(start.day, start.hour));
                        }
                        paint(key);
                      }}
                      onPointerUp={() => {
                        if (readOnly) return;
                        painting.current = false;
                        if (!dragged.current) setEditing({ day: d, hour: h });
                      }}
                    >
                      {note && (
                        <span
                          className="block overflow-hidden text-left text-[9px] font-medium leading-[1.15]"
                          style={{
                            color: readableTextColor(cat?.color),
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {note}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!readOnly && editing && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">
              {editing.day} · {hourLabel(editing.hour)}–{hourLabel(editing.hour + 1)}
            </span>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div>
            <p className="mb-1 text-[11px] font-medium text-muted-foreground">Colour</p>
            <div className="flex flex-wrap gap-1">
              {cats.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => onChange?.(editKey, c.key)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border py-0.5 pl-1 pr-2 text-[11px] font-medium transition-all",
                    editCat?.key === c.key ? "ring-2 ring-offset-1" : "hover:bg-muted/50",
                  )}
                  style={
                    editCat?.key === c.key
                      ? ({ "--tw-ring-color": c.color } as React.CSSProperties)
                      : undefined
                  }
                >
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onChange?.(editKey, "")}
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium hover:bg-muted/50"
              >
                <Eraser className="h-3 w-3" />
                Clear colour
              </button>
            </div>
          </div>

          <div>
            <p className="mb-1 text-[11px] font-medium text-muted-foreground">
              What's this block for?
            </p>
            <Textarea
              autoFocus
              value={values[editNoteKey] ?? ""}
              onChange={(e) => onChange?.(editNoteKey, e.target.value)}
              placeholder="Task, remark, or what you want to accomplish…"
              className="min-h-[72px] text-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              onChange?.(editKey, "");
              onChange?.(editNoteKey, "");
            }}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
            Clear this block
          </button>
        </div>
      )}
    </div>
  );
}
