// Filtering logic for the /scripts page, extracted so the dropdown counts, the
// result list, the search suggestions and the zero-result recovery all share
// ONE predicate. They used to diverge: the counts helper matched only
// title/content/author while the list also matched tags and category/audience/
// role labels, so searching "cold calling" showed 25 results under a dropdown
// claiming "All (15)".

export interface FilterableScriptVersion {
  author: string;
  content: string;
  title?: string;
}

// Structural subset of hooks/useScripts' ScriptEntry — kept dependency-free so
// tests can run this file without pulling in supabase.
export interface FilterableScript {
  id: string;
  stage: string;
  category: string;
  target_audience: string;
  script_role?: string;
  tags?: string[];
  versions: FilterableScriptVersion[];
}

// Categories with their own home — never listed on the Sales Scripts tab:
// servicing → /servicing · objection-handling + faq → /objections (Objection
// Scripts & FAQ section) · tips → the /scripts/course mini-course.
export const OFFPAGE_CATEGORIES = new Set(["servicing", "objection-handling", "faq", "tips"]);

export const CATEGORY_LABELS: Record<string, string> = {
  "cold-calling": "Cold Calling",
  "initial-text": "Initial Texts",
  "post-call-text": "Post-Call Texts",
  "callback": "Callback Scripts",
  "follow-up": "Follow-Up Messages",
  "ad-campaign": "Ad Campaign / Lead Gen",
  "referral": "Referral Scripts",
  "confirmation": "Appointment Confirmation",
  "faq": "FAQ",
  "fact-finding": "Fact Finding",
  "tips": "Tips & Best Practices",
  "servicing": "Servicing",
  "sales-scripts": "Sales Scripts",
};

export const audienceLabels: Record<string, string> = {
  "warm-market": "Warm Market / Friends & Family",
  general: "General",
  "young-adult": "Young Adults",
  nsf: "NSF / NS",
  "working-adult": "Working Adults",
  parent: "Parents",
  "pre-retiree": "Pre-Retirees (50-65)",
  hnw: "High Net Worth",
  referral: "Referrals",
  "cold-lead": "Cold Leads",
  recruitment: "Recruitment",
  clients: "Clients",
};

export const roleLabels: Record<string, string> = {
  consultant: "Consultant",
  va: "VA",
  telemarketer: "Telemarketer",
};

// Mirrors getCategoryInfo's fallback so search-over-label treats unknown DB
// categories exactly like the UI renders them.
export function categoryLabelText(key: string): string {
  return (
    CATEGORY_LABELS[key] ??
    key
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

/**
 * Strict substring match: the whole query as a phrase, or every word as a
 * substring. Whitespace is trimmed/collapsed first — "cold " must behave like
 * "cold", because trailing spaces are what thumbs type.
 */
export function strictMatch(target: string, query: string): { match: boolean; score: number } {
  if (!target || !query) return { match: false, score: 0 };
  const t = target.toLowerCase();
  const q = query.trim().toLowerCase();
  if (!q) return { match: false, score: 0 };
  if (t.includes(q)) return { match: true, score: 2 };
  const words = q.split(/\s+/).filter((w) => w.length > 0);
  if (words.length > 1 && words.every((w) => t.includes(w))) {
    return { match: true, score: 1.5 };
  }
  return { match: false, score: 0 };
}

export function strictIncludes(target: string, query: string): boolean {
  return strictMatch(target, query).match;
}

/**
 * THE search predicate for /scripts — every surface (list, counts,
 * suggestions, recovery) must call this, never a private variant.
 */
export function matchesScriptSearch(s: FilterableScript, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (strictIncludes(s.stage, q)) return true;
  if (s.versions.some((v) => strictIncludes(v.content, q) || strictIncludes(v.author, q))) return true;
  if ((s.tags || []).some((t) => strictIncludes(t, q))) return true;
  if (strictIncludes(s.category, q) || strictIncludes(categoryLabelText(s.category), q)) return true;
  const audLabel = audienceLabels[s.target_audience || ""] || s.target_audience || "";
  if (strictIncludes(audLabel, q)) return true;
  const rlLabel = roleLabels[s.script_role || "consultant"] || s.script_role || "";
  if (strictIncludes(rlLabel, q)) return true;
  return false;
}

export interface ScriptFilterState {
  q: string;
  category: string; // "all" = inactive
  audience: string;
  role: string;
  tag: string;
  favouritesOnly?: boolean;
}

export type FilterDimension = "q" | "category" | "audience" | "role" | "tag" | "favourites";

/**
 * The full filter pipeline. `exclude` skips one dimension — that is how the
 * dropdown counts ask "how many would each value show?" without the dimension
 * fighting itself.
 */
export function applyScriptFilters<T extends FilterableScript>(
  scripts: T[],
  f: ScriptFilterState,
  favouriteIds?: Set<string>,
  exclude?: FilterDimension
): T[] {
  let result = scripts.filter((s) => !OFFPAGE_CATEGORIES.has(s.category));
  if (exclude !== "category" && f.category !== "all") {
    result = result.filter((s) => s.category === f.category);
  }
  if (exclude !== "audience" && f.audience !== "all") {
    result = result.filter((s) => s.target_audience === f.audience);
  }
  if (exclude !== "role" && f.role !== "all") {
    result = result.filter((s) => (s.script_role || "consultant") === f.role);
  }
  if (exclude !== "tag" && f.tag !== "all") {
    result = result.filter((s) => (s.tags || []).includes(f.tag));
  }
  if (exclude !== "q" && f.q.trim()) {
    result = result.filter((s) => matchesScriptSearch(s, f.q));
  }
  if (exclude !== "favourites" && f.favouritesOnly && favouriteIds) {
    result = result.filter((s) => favouriteIds.has(s.id));
  }
  return result;
}

export interface RecoverySuggestion {
  dimension: FilterDimension;
  count: number;
}

/**
 * For a zero-result state: which single active filter, if removed, would show
 * results — and how many. Sorted by biggest recovery first. Powers the empty
 * state's one-tap fixes so a dead end never requires nuking every filter.
 */
export function zeroResultRecovery(
  scripts: FilterableScript[],
  f: ScriptFilterState,
  favouriteIds?: Set<string>
): RecoverySuggestion[] {
  const active: FilterDimension[] = [];
  if (f.q.trim()) active.push("q");
  if (f.category !== "all") active.push("category");
  if (f.audience !== "all") active.push("audience");
  if (f.role !== "all") active.push("role");
  if (f.tag !== "all") active.push("tag");
  if (f.favouritesOnly) active.push("favourites");
  return active
    .map((dimension) => ({
      dimension,
      count: applyScriptFilters(scripts, f, favouriteIds, dimension).length,
    }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);
}
