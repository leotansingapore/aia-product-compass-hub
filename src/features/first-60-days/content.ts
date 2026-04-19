import type { Day, Week } from "./types";
import { parseFrontmatter, parseQuiz, stripAppendix } from "./parse";

const rawFiles = import.meta.glob("/docs/first-60-days/week-*/day-*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const PATH_RE = /\/docs\/first-60-days\/(week-\d+)\/(day-\d+)\.md$/;

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

function buildDays(): Day[] {
  const days: Day[] = [];
  for (const [absPath, raw] of Object.entries(rawFiles)) {
    const pathMatch = absPath.match(PATH_RE);
    if (!pathMatch) continue;
    const relPath = `${pathMatch[1]}/${pathMatch[2]}.md`;
    const { frontmatter, body } = parseFrontmatter(raw);
    const dayNumber = frontmatter.day;
    const week = frontmatter.week;
    const dayInWeek = ((dayNumber - 1) % 6) + 1;
    const quiz = parseQuiz(body);
    days.push({
      dayNumber,
      week,
      dayInWeek,
      title: frontmatter.title,
      path: relPath,
      frontmatter,
      markdown: stripAppendix(body),
      quiz,
    });
  }
  days.sort((a, b) => a.dayNumber - b.dayNumber);
  return days;
}

const ALL_DAYS: Day[] = buildDays();

export function getAllDays(): Day[] {
  return ALL_DAYS;
}

export function getDay(dayNumber: number): Day | undefined {
  return ALL_DAYS.find((d) => d.dayNumber === dayNumber);
}

export function getWeek(weekNumber: number): Week | undefined {
  const meta = WEEK_META[weekNumber];
  if (!meta) return undefined;
  const days = ALL_DAYS.filter((d) => d.week === weekNumber);
  return { weekNumber, title: meta.title, tagline: meta.tagline, days };
}

export function getAllWeeks(): Week[] {
  return Object.keys(WEEK_META)
    .map((n) => Number(n))
    .sort((a, b) => a - b)
    .map((n) => getWeek(n)!)
    .filter(Boolean);
}

export const TOTAL_DAYS = ALL_DAYS.length;
