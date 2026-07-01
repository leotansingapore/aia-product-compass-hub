// Shared model for the colour-coded, hour-by-hour weekly timetable used in the
// Business Plan worksheet. Each cell stores a category key in the flat worksheet
// values under `tt_<day>_<hour>` so it rides the same save/load path.

export const TT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

// Start-of-hour slots, 6am–10pm (each row is that hour, e.g. 8 = 08:00–09:00).
export const TT_HOURS: number[] = Array.from({ length: 17 }, (_, i) => i + 6); // 6..22

export type TtCategory = { key: string; label: string; color: string };

// Categories mirror the "prospecting / preparation / me time / learning / study"
// split the assignment calls for, plus appointments and admin.
export const TT_CATEGORIES: TtCategory[] = [
  { key: "prospect", label: "Prospecting", color: "#e11d48" },
  { key: "appt", label: "Appointments", color: "#2563eb" },
  { key: "prep", label: "Preparation", color: "#d97706" },
  { key: "learn", label: "Learning", color: "#16a34a" },
  { key: "study", label: "Study", color: "#7c3aed" },
  { key: "me", label: "Me time", color: "#0d9488" },
  { key: "admin", label: "Admin", color: "#64748b" },
];

const CAT_BY_KEY: Record<string, TtCategory> = Object.fromEntries(
  TT_CATEGORIES.map((c) => [c.key, c]),
);

export function ttCategory(key: string | undefined): TtCategory | null {
  return key ? CAT_BY_KEY[key] ?? null : null;
}

// Learners can add their own colour-coded activities; these live as JSON in the
// worksheet values under `tt_custom` so they save/export with everything else.
export const TT_CUSTOM_KEY = "tt_custom";

// Learners can also rename / recolour the built-in activities; those edits are
// stored as `{ key: { label?, color? } }` under `tt_overrides`.
export const TT_OVERRIDES_KEY = "tt_overrides";

export function parseOverrides(
  values: Record<string, string>,
): Record<string, { label?: string; color?: string }> {
  try {
    const raw = values[TT_OVERRIDES_KEY];
    if (!raw) return {};
    const o = JSON.parse(raw);
    return o && typeof o === "object" && !Array.isArray(o) ? o : {};
  } catch {
    return {};
  }
}

/** Built-in categories with any learner rename/recolour applied. */
export function effectiveBuiltins(
  values: Record<string, string>,
): TtCategory[] {
  const ov = parseOverrides(values);
  return TT_CATEGORIES.map((c) => ({ ...c, ...(ov[c.key] ?? {}) }));
}

export function parseCustomCats(values: Record<string, string>): TtCategory[] {
  try {
    const raw = values[TT_CUSTOM_KEY];
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr)
      ? arr.filter((c) => c && typeof c.key === "string" && typeof c.color === "string")
      : [];
  } catch {
    return [];
  }
}

/** Resolve a cell's category key against a provided list of categories. */
export function resolveCat(
  key: string | undefined,
  cats: TtCategory[],
): TtCategory | null {
  if (!key) return null;
  return cats.find((c) => c.key === key) ?? null;
}

/** Every category (built-ins with overrides applied, then custom). */
export function allCategories(values: Record<string, string>): TtCategory[] {
  return [...effectiveBuiltins(values), ...parseCustomCats(values)];
}

export function ttKey(day: string, hour: number): string {
  return `tt_${day.toLowerCase()}_${String(hour).padStart(2, "0")}`;
}

export function hourLabel(hour: number): string {
  const h12 = ((hour + 11) % 12) + 1;
  return `${h12}${hour < 12 ? "am" : "pm"}`;
}
