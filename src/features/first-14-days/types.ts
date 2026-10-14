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
  /** The lesson file's body as written (Obsidian image embeds unconverted): what admins edit. */
  source: string;
};

export type Week = {
  weekNumber: number;
  title: string;
  tagline: string;
  days: Day[];
};
