import type { Day, Week } from "./types";
import { parseFrontmatter, parseQuiz, parseReflection, stripAppendix } from "../first-60-days/parse";
import { DAY_SUMMARIES, TOTAL_DAYS, type DaySummary } from "./summaries";

// Lazy per-day raw loaders — only the day being viewed is downloaded.
const rawLoaders = import.meta.glob<string>("/docs/product-mastery-track/week-*/day-*.md", {
  query: "?raw",
  import: "default",
});

const PATH_RE = /\/docs\/product-mastery-track\/week-\d+\/day-(\d+)\.md$/;

const loaderByDay: Record<number, () => Promise<string>> = {};
for (const [path, loader] of Object.entries(rawLoaders)) {
  const m = path.match(PATH_RE);
  if (!m) continue;
  loaderByDay[Number(m[1])] = loader as () => Promise<string>;
}

const dayCache = new Map<number, Day>();

export { TOTAL_DAYS };

// Each week is one of the seven core AIA products. The order is
// pedagogical: foundation savings (Pro Achiever) -> protection lineup
// -> medical -> PA -> PWV as the ILP capstone.
export const WEEK_META: Record<number, { title: string; tagline: string; productSlug: string }> = {
  1: { title: "Pro Achiever 3.0", tagline: "Savings-as-investment foundation. Master the IIP frame.", productSlug: "pro-achiever" },
  2: { title: "Pro Lifetime Protector", tagline: "Whole-life flagship. Lifetime protection with cash value.", productSlug: "pro-lifetime-protector" },
  3: { title: "Guaranteed Protect Plus", tagline: "Term protection with Vitality. Builds the protection muscle.", productSlug: "guaranteed-protect-plus" },
  4: { title: "Ultimate Critical Cover", tagline: "73 CIs across 150 condition-stages. The CI workhorse.", productSlug: "ultimate-critical-cover" },
  5: { title: "HealthShield Gold Max", tagline: "Integrated Shield Plan. Hospital + outpatient cancer.", productSlug: "healthshield-gold-max" },
  6: { title: "Solitaire PA", tagline: "Personal accident at scale. Schedule of indemnity mastery.", productSlug: "solitaire-pa" },
  7: { title: "Platinum Wealth Venture", tagline: "ILP capstone. Brings together the bonus, charge, and dividend mechanics.", productSlug: "platinum-wealth-venture" },
};

export function getDaySummaries(): DaySummary[] {
  return DAY_SUMMARIES;
}

export function getDaySummary(dayNumber: number): DaySummary | undefined {
  return DAY_SUMMARIES.find((d) => d.dayNumber === dayNumber);
}

// Warm the chunk for a day without parsing it. Hover/focus handlers call
// this so navigation feels instant — fetch starts before the route change.
export function prefetchDay(dayNumber: number): void {
  if (dayCache.has(dayNumber)) return;
  const loader = loaderByDay[dayNumber];
  if (!loader) return;
  loader().catch(() => undefined);
}

const RAW_HTML_RE = /<(?:div|span|br|iframe|table|sup|sub|kbd|details|summary|section|figure|video|details)\b/i;

export async function loadDay(dayNumber: number): Promise<Day | undefined> {
  const cached = dayCache.get(dayNumber);
  if (cached) return cached;
  const loader = loaderByDay[dayNumber];
  if (!loader) return undefined;
  const raw = await loader();
  const { frontmatter, body } = parseFrontmatter(raw);
  const markdown = stripAppendix(body);
  const day: Day = {
    dayNumber: frontmatter.day,
    week: frontmatter.week,
    dayInWeek: ((frontmatter.day - 1) % 5) + 1,
    title: frontmatter.title,
    path: `week-${frontmatter.week}/day-${String(frontmatter.day).padStart(2, "0")}.md`,
    frontmatter,
    markdown,
    quiz: parseQuiz(body),
    reflection: parseReflection(body),
    hasRawHtml: RAW_HTML_RE.test(markdown),
  };
  dayCache.set(dayNumber, day);
  return day;
}

export function getWeek(weekNumber: number): Week | undefined {
  const meta = WEEK_META[weekNumber];
  if (!meta) return undefined;
  const weekDays = DAY_SUMMARIES.filter((d) => d.week === weekNumber).map((s) => ({
    dayNumber: s.dayNumber,
    week: s.week,
    dayInWeek: s.dayInWeek,
    title: s.title,
    path: `week-${s.week}/day-${String(s.dayNumber).padStart(2, "0")}.md`,
    frontmatter: {
      week: s.week,
      day: s.dayNumber,
      title: s.title,
      tags: [],
      duration_minutes: s.duration,
    },
    markdown: "",
    quiz: [],
    reflection: [],
    hasRawHtml: false,
  }));
  return { weekNumber, title: meta.title, tagline: meta.tagline, days: weekDays };
}

export function getAllWeeks(): Week[] {
  return Object.keys(WEEK_META)
    .map((n) => Number(n))
    .sort((a, b) => a - b)
    .map((n) => getWeek(n)!)
    .filter(Boolean);
}
