import { Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  ACCENT_KEY,
  COLOR_SCHEMES,
  COVER_KEY,
  HEADLINE_KEY,
  NAME_KEY,
  PRINT_THEMES,
  THEME_KEY,
  schemeFor,
  themeFor,
} from "@/features/pre-rnf-worksheets/customize";
import type { WorksheetValues } from "@/features/pre-rnf-worksheets/worksheets";

// Personalise the worksheet + its exported PDF: name, an optional headline, the
// colour scheme, and the print theme (typography + structure) used in the PDF.
export default function CustomizePanel({
  values,
  onChange,
  readOnly = false,
  showHeadline = false,
}: {
  values: WorksheetValues;
  onChange?: (id: string, value: string) => void;
  readOnly?: boolean;
  showHeadline?: boolean;
}) {
  const active = schemeFor(values);
  const activeTheme = themeFor(values);
  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Palette className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Personalise</h3>
        <span className="text-xs text-muted-foreground">— name, theme &amp; colours on your PDF</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Your name</Label>
          <Input
            value={values[NAME_KEY] ?? ""}
            readOnly={readOnly}
            onChange={(e) => onChange?.(NAME_KEY, e.target.value)}
            placeholder="e.g. Jane Tan"
            className={cn("h-9 text-sm", readOnly && "bg-muted/40")}
          />
        </div>
        {showHeadline && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Headline (optional)</Label>
            <Input
              value={values[HEADLINE_KEY] ?? ""}
              readOnly={readOnly}
              onChange={(e) => onChange?.(HEADLINE_KEY, e.target.value)}
              placeholder="e.g. My First Five Years"
              className={cn("h-9 text-sm", readOnly && "bg-muted/40")}
            />
          </div>
        )}
      </div>
      <div className="mt-4 space-y-1.5">
        <Label className="text-xs font-medium">Theme</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {PRINT_THEMES.map((t) => {
            const selected = t.key === activeTheme.key;
            const band = t.stepStyle === "band";
            return (
              <button
                key={t.key}
                type="button"
                disabled={readOnly}
                onClick={() => onChange?.(THEME_KEY, t.key)}
                title={t.blurb}
                className={cn(
                  "rounded-lg border p-2 text-left transition-colors",
                  selected ? "border-primary ring-1 ring-primary" : "hover:bg-muted/50",
                  readOnly && "cursor-default opacity-70",
                )}
                aria-pressed={selected}
              >
                {/* Mini preview: the theme's own heading treatment over body lines. */}
                <div className="rounded-md bg-white px-2 py-1.5 shadow-sm ring-1 ring-black/5">
                  <div
                    className="truncate text-[11px] leading-4 text-neutral-900"
                    style={{
                      fontFamily: t.headFont,
                      fontWeight: t.headWeight,
                      textTransform: t.headCase,
                      ...(band
                        ? { background: t.bandBg, color: "#fff", padding: "0 4px", borderRadius: "2px" }
                        : {
                            borderBottom: `2px solid ${t.stepStyle === "hairline" ? t.tableBorderColor : active.accent}`,
                          }),
                    }}
                  >
                    Aa Goals
                  </div>
                  <div className="mt-1 h-1 w-4/5 rounded-sm" style={{ background: t.tableBorderColor }} />
                  <div className="mt-0.5 h-1 w-3/5 rounded-sm" style={{ background: t.tableBorderColor }} />
                </div>
                <div className="mt-1.5 text-xs font-semibold">{t.label}</div>
                <div className="truncate text-[10px] leading-3 text-muted-foreground">{t.blurb}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <Label className="text-xs font-medium">Colour scheme</Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_SCHEMES.map((s) => {
            const selected = s.key === active.key;
            return (
              <button
                key={s.key}
                type="button"
                disabled={readOnly}
                onClick={() => onChange?.(ACCENT_KEY, s.key)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                  selected ? "border-foreground/40 bg-muted" : "hover:bg-muted/50",
                  readOnly && "cursor-default opacity-70",
                )}
                aria-pressed={selected}
              >
                <span
                  className="h-4 w-4 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: s.accent }}
                />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {showHeadline && (
        <label className="mt-4 flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={values[COVER_KEY] === "yes"}
            disabled={readOnly}
            onChange={(e) => onChange?.(COVER_KEY, e.target.checked ? "yes" : "")}
            className="h-4 w-4 accent-primary"
          />
          <span className="text-xs font-medium">
            Add a cover page <span className="text-muted-foreground">— title, your name &amp; date on page 1</span>
          </span>
        </label>
      )}
    </div>
  );
}
