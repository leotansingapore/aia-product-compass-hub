// Search, filter and sort for the AIA Training Directory tab.
//
// Types only from the edge function's data file: an `import type` is erased
// at build time, so the catalogue itself never lands in a browser chunk.
// filter.test.ts fails if anything under src/ imports it as a value.
import type {
  Course,
  Directory,
  ScheduleEntry,
  Section,
} from "../../../supabase/functions/aia-training-directory/directory";

export type { Course, Directory, ScheduleEntry, Section };
export type { Roadmap } from "../../../supabase/functions/aia-training-directory/directory";

export type StageFilter = "all" | Section["stage"];
export type SortKey = "catalogue" | "az" | "cpd" | "next";

export interface Filters {
  query: string;
  stage: StageFilter;
  mandatory: boolean;
  essential: boolean;
  isNew: boolean;
  upcoming: boolean;
  sort: SortKey;
}

export const EMPTY_FILTERS: Filters = {
  query: "",
  stage: "all",
  mandatory: false,
  essential: false,
  isNew: false,
  upcoming: false,
  sort: "catalogue",
};

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The first session still ahead (or a self-paced window still open) as of `today`. */
export function nextSession(course: Course, scheduleYear: number, today: Date): ScheduleEntry | null {
  if (!course.schedule?.length) return null;
  const year = today.getFullYear();
  if (year > scheduleYear) return null;
  if (year < scheduleYear) return course.schedule[0];
  const month = today.getMonth() + 1;
  return course.schedule.find((s) => (s.endMonth ?? s.month) >= month) ?? null;
}

/** Everything a search can match on a course; the Courses tab and the calendar share it. */
export function courseSearchText(course: Course, section: Section | undefined): string {
  return [
    course.title,
    course.summary,
    course.duration,
    course.cpd,
    course.eligibility,
    course.access,
    section?.code,
    section?.title,
    ...(course.outcomes ?? []),
    ...(course.notes ?? []),
    ...(course.topics ?? []).flatMap((t) => [t.heading, ...t.items]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function filterCourses(dir: Directory, f: Filters, today: Date): Course[] {
  const sectionById = new Map(dir.sections.map((s) => [s.id, s]));
  const terms = f.query.toLowerCase().split(/\s+/).filter(Boolean);
  const anyRequirement = f.mandatory || f.essential;

  const kept = dir.courses.filter((c) => {
    const section = sectionById.get(c.section);
    if (f.stage !== "all" && section?.stage !== f.stage) return false;
    if (anyRequirement) {
      const ok = (f.mandatory && c.requirement === "mandatory") || (f.essential && c.requirement === "essential");
      if (!ok) return false;
    }
    if (f.isNew && !c.isNew) return false;
    if (f.upcoming && !nextSession(c, dir.scheduleYear, today)) return false;
    if (terms.length) {
      const text = courseSearchText(c, section);
      if (!terms.every((t) => text.includes(t))) return false;
    }
    return true;
  });

  if (f.sort === "az") return [...kept].sort((a, b) => a.title.localeCompare(b.title));
  if (f.sort === "cpd") {
    // Courses with no published hours sink to the bottom, in catalogue order.
    return [...kept].sort((a, b) => (b.cpdHours ?? -1) - (a.cpdHours ?? -1));
  }
  if (f.sort === "next") {
    // A window that opened earlier and is still open counts as this month.
    const floor = today.getFullYear() === dir.scheduleYear ? today.getMonth() + 1 : 0;
    const key = (c: Course) => {
      const s = nextSession(c, dir.scheduleYear, today);
      return s ? Math.max(s.month, floor) : 99;
    };
    return [...kept].sort((a, b) => key(a) - key(b));
  }
  return kept;
}

export function hasActiveFilters(f: Filters): boolean {
  return Boolean(f.query.trim()) || f.stage !== "all" || f.mandatory || f.essential || f.isNew || f.upcoming;
}
