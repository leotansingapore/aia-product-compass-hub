export type QuizOption = {
  key: string;
  text: string;
  correct: boolean;
};

export type QuizQuestion = {
  index: number;
  question: string;
  options: QuizOption[];
  explanation?: string;
};

export type ReflectionPrompt = {
  index: number;
  question: string;
  hint?: string;
};

export type DayFrontmatter = {
  week: number;
  day: number;
  title: string;
  tags: string[];
  duration_minutes: number;
  primary_source?: string;
  primary_slides?: string;
};

export type Day = {
  dayNumber: number;
  week: number;
  dayInWeek: number;
  title: string;
  path: string;
  frontmatter: DayFrontmatter;
  markdown: string;
  quiz: QuizQuestion[];
  reflection: ReflectionPrompt[];
};

export type Week = {
  weekNumber: number;
  title: string;
  tagline: string;
  days: Day[];
};
