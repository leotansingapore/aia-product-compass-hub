import type { WorksheetValues } from "./worksheets";

// Personalisation shared by the worksheet builders and their PDF exports. Stored
// inline in the worksheet values under reserved `_`-prefixed keys so they ride
// the same save/load path and never collide with content fields.
export const NAME_KEY = "_name";
export const ACCENT_KEY = "_accent";
export const HEADLINE_KEY = "_headline";
export const COVER_KEY = "_cover";
export const THEME_KEY = "_theme";

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
  // Theme-flavoured palettes (each theme defaults to one of these; all remain
  // freely combinable with any theme).
  { key: "oxblood", label: "Oxblood", accent: "#7f1d1d", tint: "#f4e8e4", deep: "#581414" },
  { key: "gold", label: "Gold", accent: "#a8842c", tint: "#f5eeda", deep: "#6f5518" },
  { key: "charcoal", label: "Charcoal", accent: "#1f2937", tint: "#eceef1", deep: "#0f172a" },
];

export const DEFAULT_SCHEME = COLOR_SCHEMES[0];

export function schemeFor(values: WorksheetValues): ColorScheme {
  const key = values[ACCENT_KEY];
  return COLOR_SCHEMES.find((s) => s.key === key) ?? DEFAULT_SCHEME;
}

// ── Print themes ─────────────────────────────────────────────────────────────
// A theme restyles the exported PDF the way a Canva template would: typography,
// section-heading treatment, table chrome, and field styling. It combines with
// the accent colour scheme above (theme = structure, scheme = colour).
//
// PDF-safety rule (learned the hard way): the rasteriser (html2canvas) renders
// plain block/inline text, table cells, backgrounds and borders exactly — so
// themes only vary those. All fonts here are loaded app-wide (index.html) or
// system stacks, so the rasteriser can draw them.
const MONT = `'Montserrat', 'Helvetica Neue', Arial, sans-serif`;
const RSERIF = `'Roboto Serif', Georgia, 'Times New Roman', serif`;
const HELV = `'Helvetica Neue', Helvetica, Arial, sans-serif`;
const GEORGIA = `Georgia, 'Times New Roman', serif`;

export type PrintTheme = {
  key: string;
  label: string;
  /** One-line descriptor shown in the picker. */
  blurb: string;
  /** Heading + body font stacks. */
  headFont: string;
  bodyFont: string;
  headWeight: number;
  headCase: "uppercase" | "none";
  /** Section-head treatment: accent underline, solid band, or thin hairline. */
  stepStyle: "underline" | "band" | "hairline";
  /** Table header treatment: accent tint fill, solid accent, dark ink, or open. */
  thStyle: "tint" | "solid" | "ink" | "plain";
  /** Full grid borders, or horizontal rules only. */
  tableBorders: "full" | "horizontal";
  tableBorderColor: string;
  /** Border colour for answer boxes / answer lines. */
  boxBorderColor: string;
  ink: string;
  mutedInk: string;
  /** Dark fill used for band headings / dark table headers. */
  bandBg: string;
  /** The colour scheme this theme is designed around — applied when the theme
   *  is picked (the learner can still swap it afterwards). */
  defaultScheme: string;
  /** Full-bleed page colour (e.g. warm paper for Editorial). */
  pageTint: string;
  /** Soft fill on alternating table rows. */
  zebra: boolean;
  /** Covers/slide bars draw from the dark band instead of the accent. */
  darkCover: boolean;
};

export const PRINT_THEMES: PrintTheme[] = [
  {
    key: "classic",
    label: "Classic",
    blurb: "Clean and familiar — the original look",
    headFont: HELV,
    bodyFont: HELV,
    headWeight: 800,
    headCase: "none",
    stepStyle: "underline",
    thStyle: "tint",
    tableBorders: "full",
    tableBorderColor: "#c8c8c8",
    boxBorderColor: "#cfcfcf",
    ink: "#1a1a1a",
    mutedInk: "#666666",
    bandBg: "#111111",
    defaultScheme: "red",
    pageTint: "#ffffff",
    zebra: false,
    darkCover: false,
  },
  {
    key: "editorial",
    label: "Editorial",
    blurb: "Serif headings and fine rules, like a magazine",
    headFont: RSERIF,
    bodyFont: GEORGIA,
    headWeight: 700,
    headCase: "none",
    stepStyle: "hairline",
    thStyle: "plain",
    tableBorders: "horizontal",
    tableBorderColor: "#d9d4cc",
    boxBorderColor: "#d9d4cc",
    ink: "#22201c",
    mutedInk: "#77716a",
    bandBg: "#22201c",
    defaultScheme: "oxblood",
    pageTint: "#fbf7ef",
    zebra: false,
    darkCover: false,
  },
  {
    key: "bold",
    label: "Bold",
    blurb: "Heavy caps and solid colour, pitch-deck energy",
    headFont: MONT,
    bodyFont: HELV,
    headWeight: 800,
    headCase: "uppercase",
    stepStyle: "underline",
    thStyle: "solid",
    tableBorders: "full",
    tableBorderColor: "#b9b9b9",
    boxBorderColor: "#9a9a9a",
    ink: "#111111",
    mutedInk: "#555555",
    bandBg: "#111111",
    defaultScheme: "crimson",
    pageTint: "#ffffff",
    zebra: true,
    darkCover: false,
  },
  {
    key: "minimal",
    label: "Minimal",
    blurb: "Airy and quiet — hairlines and whitespace",
    headFont: HELV,
    bodyFont: HELV,
    headWeight: 700,
    headCase: "none",
    stepStyle: "hairline",
    thStyle: "plain",
    tableBorders: "horizontal",
    tableBorderColor: "#e6e6e6",
    boxBorderColor: "#e6e6e6",
    ink: "#333333",
    mutedInk: "#8a8a8a",
    bandBg: "#3a3a3a",
    defaultScheme: "charcoal",
    pageTint: "#ffffff",
    zebra: false,
    darkCover: false,
  },
  {
    key: "executive",
    label: "Executive",
    blurb: "Dark bands and serif body, boardroom formal",
    headFont: MONT,
    bodyFont: GEORGIA,
    headWeight: 700,
    headCase: "uppercase",
    stepStyle: "band",
    thStyle: "ink",
    tableBorders: "full",
    tableBorderColor: "#c3c9d4",
    boxBorderColor: "#c3c9d4",
    ink: "#1c2432",
    mutedInk: "#5d6675",
    bandBg: "#1c2432",
    defaultScheme: "gold",
    pageTint: "#ffffff",
    zebra: true,
    darkCover: true,
  },
];

export const DEFAULT_THEME = PRINT_THEMES[0];

export function themeFor(values: WorksheetValues): PrintTheme {
  const key = values[THEME_KEY];
  return PRINT_THEMES.find((t) => t.key === key) ?? DEFAULT_THEME;
}

export function personName(values: WorksheetValues): string {
  return (values[NAME_KEY] ?? "").trim();
}

export function headline(values: WorksheetValues): string {
  return (values[HEADLINE_KEY] ?? "").trim();
}
