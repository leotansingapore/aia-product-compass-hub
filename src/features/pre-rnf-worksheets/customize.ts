import type { WorksheetValues } from "./worksheets";

// Personalisation shared by the worksheet builders and their PDF exports. Stored
// inline in the worksheet values under reserved `_`-prefixed keys so they ride
// the same save/load path and never collide with content fields.
export const NAME_KEY = "_name";
export const ACCENT_KEY = "_accent";
export const HEADLINE_KEY = "_headline";
export const COVER_KEY = "_cover";

export type ColorScheme = {
  key: string;
  label: string;
  /** Primary accent (headings, rules, badges). */
  accent: string;
  /** Soft tint for table header fills. */
  tint: string;
  /** Deep shade for accented text on tint. */
  deep: string;
};

export const COLOR_SCHEMES: ColorScheme[] = [
  { key: "red", label: "AIA Red", accent: "#D31145", tint: "#fbe7ec", deep: "#8a0c2e" },
  { key: "crimson", label: "Pledge Red", accent: "#E11D26", tint: "#fde7e8", deep: "#9c1118" },
  { key: "indigo", label: "Indigo", accent: "#4f46e5", tint: "#e8e7fb", deep: "#312c8a" },
  { key: "emerald", label: "Emerald", accent: "#059669", tint: "#dcf5ec", deep: "#075c45" },
  { key: "slate", label: "Slate", accent: "#334155", tint: "#e9edf3", deep: "#1e293b" },
  { key: "amber", label: "Amber", accent: "#b45309", tint: "#fcefda", deep: "#7c3a06" },
];

export const DEFAULT_SCHEME = COLOR_SCHEMES[0];

export function schemeFor(values: WorksheetValues): ColorScheme {
  const key = values[ACCENT_KEY];
  return COLOR_SCHEMES.find((s) => s.key === key) ?? DEFAULT_SCHEME;
}

export function personName(values: WorksheetValues): string {
  return (values[NAME_KEY] ?? "").trim();
}

export function headline(values: WorksheetValues): string {
  return (values[HEADLINE_KEY] ?? "").trim();
}
