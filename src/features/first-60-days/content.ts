import type { Day, Week } from "./types";
import { convertWikilinks, parseFrontmatter, parseQuiz, parseReflection, stripAppendix } from "./parse";
import { DAY_SUMMARIES, TOTAL_DAYS, type DaySummary } from "./summaries";

// Lazy per-day raw loaders. Each day becomes its own chunk — only the day being
// viewed is downloaded. The hub and navigation use the lightweight DAY_SUMMARIES.
const rawLoaders = import.meta.glob<string>("/docs/first-60-days/week-*/day-*.md", {
  query: "?raw",
  import: "default",
});

// Week README loaders — same lazy pattern. Used to show the week wrap-up on the
// last day of each week.
const weekReadmeLoaders = import.meta.glob<string>(
  "/docs/first-60-days/week-*/README.md",
  { query: "?raw", import: "default" },
);

const PATH_RE = /\/docs\/first-60-days\/week-\d+\/day-(\d+)\.md$/;

const loaderByDay: Record<number, () => Promise<string>> = {};
for (const [path, loader] of Object.entries(rawLoaders)) {
  const m = path.match(PATH_RE);
  if (!m) continue;
  loaderByDay[Number(m[1])] = loader as () => Promise<string>;
}

const dayCache = new Map<number, Day>();

export { TOTAL_DAYS };

export const WEEK_META: Record<number, { title: string; tagline: string }> = {
  1: { title: "Foundation & Identity Shift", tagline: "The career is skill acquisition, not a job." },
  2: { title: "Industry Context & The Freedom Business", tagline: "Freedom as the real product." },
  3: { title: "Wealth Building Principles", tagline: "Assets, liabilities, recurring revenue, the 10X rule." },
  4: { title: "Productivity Principles", tagline: "Your personal operating system." },
  5: { title: "Operating Rhythms & Daily Discipline", tagline: "Rhythms, scorecards, first steps into TVM." },
  6: { title: "Financial Fundamentals", tagline: "TVM, CPF, investments, inflation." },
  7: { title: "The Approach & Digital Prospecting", tagline: "From knowledge to activity." },
  8: { title: "Fact Finding & Reading People", tagline: "From first meeting to knowing what the client needs." },
  9: { title: "Uncovering Needs & Sales Concepts", tagline: "SPIN, CFR, CSTs, concept selling." },
  10: { title: "Product Mastery & Graduation", tagline: "Products, proposals, closes, claims, graduation." },
};

export function getDaySummaries(): DaySummary[] {
  return DAY_SUMMARIES;
}

export function getDaySummary(dayNumber: number): DaySummary | undefined {
  return DAY_SUMMARIES.find((d) => d.dayNumber === dayNumber);
}

const weekReadmeCache = new Map<number, string>();

export async function loadWeekReadme(weekNumber: number): Promise<string | undefined> {
  const cached = weekReadmeCache.get(weekNumber);
  if (cached !== undefined) return cached;
  const key = `/docs/first-60-days/week-${weekNumber}/README.md`;
  const loader = weekReadmeLoaders[key];
  if (!loader) return undefined;
  const raw = await loader();
  // Strip frontmatter before rendering.
  const stripped = raw.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "").trim();
  const body = convertWikilinks(stripped);
  weekReadmeCache.set(weekNumber, body);
  return body;
}

export async function loadDay(dayNumber: number): Promise<Day | undefined> {
  const cached = dayCache.get(dayNumber);
  if (cached) return cached;
  const loader = loaderByDay[dayNumber];
  if (!loader) return undefined;
  const raw = await loader();
  const { frontmatter, body } = parseFrontmatter(raw);
  const day: Day = {
    dayNumber: frontmatter.day,
    week: frontmatter.week,
    dayInWeek: ((frontmatter.day - 1) % 6) + 1,
    title: frontmatter.title,
    path: `week-${frontmatter.week}/day-${String(frontmatter.day).padStart(2, "0")}.md`,
    frontmatter,
    markdown: convertWikilinks(stripAppendix(body)),
    quiz: parseQuiz(body),
    reflection: parseReflection(body),
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
