import type { Day, Week } from "./types";
import { convertWikilinks, parseFrontmatter, parseQuiz, parseReflection, stripAppendix } from "./parse";
import { DAY_SUMMARIES, TOTAL_DAYS, type DaySummary } from "./summaries";

// Feature folder name is kept as "first-30-days" for historical stability,
// but it now serves the Next 60 Days module (10 weeks × 6 days = 60 days).
// Content lives at /docs/next-60-days/.
const rawLoaders = import.meta.glob<string>("/docs/next-60-days/week-*/day-*.md", {
  query: "?raw",
  import: "default",
});

const weekReadmeLoaders = import.meta.glob<string>(
  "/docs/next-60-days/week-*/README.md",
  { query: "?raw", import: "default" },
);

const PATH_RE = /\/docs\/next-60-days\/week-\d+\/day-(\d+)\.md$/;

const loaderByDay: Record<number, () => Promise<string>> = {};
for (const [path, loader] of Object.entries(rawLoaders)) {
  const m = path.match(PATH_RE);
  if (!m) continue;
  loaderByDay[Number(m[1])] = loader as () => Promise<string>;
}

const dayCache = new Map<number, Day>();

export { TOTAL_DAYS };

export const WEEK_META: Record<number, { title: string; tagline: string }> = {
  1: { title: "Reset & Activate", tagline: "Who you are now the licence is real." },
  2: { title: "Your Voice I — Intent & Positioning", tagline: "The 90-second intent statement, delivered live." },
  3: { title: "Your Voice II — Content & Digital Trust", tagline: "Posts, DMs, and the 5 silent questions." },
  4: { title: "Prospecting at Volume", tagline: "30 real outreaches in a week. Reps beat cleverness." },
  5: { title: "Referrals From Day One", tagline: "Asking is ritual, not ambush — FACT + the flywheel." },
  6: { title: "Reading People — DISC Complete", tagline: "4 profiles, 4 tailored openers, 4 matched closes." },
  7: { title: "Hot Buttons + Pitch Mechanics", tagline: "Make it about them, then land the close they're wired for." },
  8: { title: "The Pitch", tagline: "Questions, silence, sales angles, feature-to-benefit integration." },
  9: { title: "The Close", tagline: "Closing techniques, top-10 objection drills, first case closed." },
  10: { title: "After the Close + Graduation", tagline: "Onboarding, moments, review, signed Year-1 plan." },
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
  const key = `/docs/next-60-days/week-${weekNumber}/README.md`;
  const loader = weekReadmeLoaders[key];
  if (!loader) return undefined;
  const raw = await loader();
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
