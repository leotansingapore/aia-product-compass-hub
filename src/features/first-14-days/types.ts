export type DayFrontmatter = {
  week: number;
  day: number;
  title: string;
  tags: string[];
  duration_minutes: number;
  big_idea?: string;
  author?: string;
};

export type Day = {
  dayNumber: number;
  week: number;
  dayInWeek: number;
  title: string;
  path: string;
  frontmatter: DayFrontmatter;
  markdown: string;
};

export type Week = {
  weekNumber: number;
  title: string;
  tagline: string;
  days: Day[];
};
