import type { Day, Week } from "./types";
import { parseFrontmatter, parseQuiz, parseReflection, stripAppendix } from "./parse";
import { DAY_SUMMARIES, TOTAL_DAYS, type DaySummary } from "./summaries";

// Lazy per-day raw loaders — same pattern as First 60 Days.
const rawLoaders = import.meta.glob<string>("/docs/first-30-days/week-*/day-*.md", {
  query: "?raw",
  import: "default",
});

const weekReadmeLoaders = import.meta.glob<string>(
  "/docs/first-30-days/week-*/README.md",
  { query: "?raw", import: "default" },
);

const PATH_RE = /\/docs\/first-30-days\/week-\d+\/day-(\d+)\.md$/;

const loaderByDay: Record<number, () => Promise<string>> = {};
for (const [path, loader] of Object.entries(rawLoaders)) {
  const m = path.match(PATH_RE);
  if (!m) continue;
  loaderByDay[Number(m[1])] = loader as () => Promise<string>;
}

const dayCache = new Map<number, Day>();

export { TOTAL_DAYS };

export const WEEK_META: Record<number, { title: string; tagline: string }> = {
  1: { title: "Week 1 — Placeholder", tagline: "Replace with real week 1 tagline." },
  2: { title: "Week 2 — Placeholder", tagline: "Replace with real week 2 tagline." },
  3: { title: "Week 3 — Placeholder", tagline: "Replace with real week 3 tagline." },
  4: { title: "Week 4 — Placeholder", tagline: "Replace with real week 4 tagline." },
  5: { title: "Week 5 — Placeholder", tagline: "Replace with real week 5 tagline." },
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
  const key = `/docs/first-30-days/week-${weekNumber}/README.md`;
  const loader = weekReadmeLoaders[key];
  if (!loader) return undefined;
  const raw = await loader();
  const body = raw.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "").trim();
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
    markdown: stripAppendix(body),
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
