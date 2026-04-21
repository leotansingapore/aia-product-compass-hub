/**
 * Lightweight day metadata for the hub page — avoids loading full markdown.
 * Week 1 has real titles from the ported Skool content.
 * Weeks 2–5 are placeholders until content is added.
 */
export const TOTAL_DAYS = 30;

export interface DaySummary {
  dayNumber: number;
  week: number;
  dayInWeek: number;
  title: string;
  duration: number;
  hasReflection: boolean;
}

const WEEK_1_TITLES: Record<number, { title: string; duration: number }> = {
  1: { title: "Introduction", duration: 15 },
  2: { title: "Income Structure", duration: 30 },
  3: { title: "Tech Stack & CRM Setup", duration: 45 },
  4: { title: "Business Plan & Vision Board", duration: 60 },
  5: { title: "Pledge Sheet & Project 100", duration: 45 },
  6: { title: "Practical — Familiarity, Prospecting & Marketing", duration: 60 },
};

export const DAY_SUMMARIES: DaySummary[] = Array.from({ length: TOTAL_DAYS }, (_, i) => {
  const dayNumber = i + 1;
  const week = Math.ceil(dayNumber / 6);
  const dayInWeek = ((dayNumber - 1) % 6) + 1;
  const real = WEEK_1_TITLES[dayNumber];
  return {
    dayNumber,
    week,
    dayInWeek,
    title: real?.title ?? `Day ${dayNumber} — Placeholder`,
    duration: real?.duration ?? 15,
    hasReflection: true,
  };
});

export const DAYS_WITH_REFLECTION: ReadonlySet<number> = new Set(
  DAY_SUMMARIES.filter((d) => d.hasReflection).map((d) => d.dayNumber),
);
