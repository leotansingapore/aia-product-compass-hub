// Day shape mirrors first-60-days. Re-exported so callers can import from
// this feature module without leaking knowledge of which track owns the type.
export type {
  Day,
  DayFrontmatter,
  QuizOption,
  QuizQuestion,
  ReflectionPrompt,
  Week,
} from "../first-60-days/types";
