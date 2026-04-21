/**
 * Lightweight day metadata for the hub page — avoids loading full markdown.
 * AUTO-GENERATED placeholder — regenerate from markdown when real content is added.
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

export const DAY_SUMMARIES: DaySummary[] = Array.from({ length: TOTAL_DAYS }, (_, i) => {
  const dayNumber = i + 1;
  const week = Math.ceil(dayNumber / 6);
  const dayInWeek = ((dayNumber - 1) % 6) + 1;
  return {
    dayNumber,
    week,
    dayInWeek,
    title: `Day ${dayNumber} — Placeholder Title`,
    duration: 15,
    hasReflection: true,
  };
});
