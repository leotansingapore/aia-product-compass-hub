// Layout and counts for the directory's Overview: the career line (AIA's Tied
// Distribution roadmap as one Foundation line that forks into four paths) and the 2026 heatmap.
import type { Course, Directory, ScheduleEntry, Section } from "./filter";

/** One path per line in AIA's roadmap. Order is the validated colour order (--lane-1..5). */
export const LANES = [
  { id: "foundation", name: "Foundation", blurb: "Get licensed, then build your habits and skills in year one", sections: ["02a", "02b", "02c", "02d"] },
  { id: "selling", name: "Advanced selling", blurb: "Find, advise and keep clients with more confidence", sections: ["03a", "03b", "03c", "03d", "03e"] },
  { id: "mdrt", name: "MDRT", blurb: "Reach MDRT, then requalify year after year", sections: ["03f"] },
  { id: "specialist", name: "Specialised markets", blurb: "Serve affluent, high net worth, business and group clients", sections: ["03g", "03h"] },
  { id: "leadership", name: "Leadership", blurb: "Grow from leading yourself to running an agency", sections: ["04a", "04b", "04c"] },
] as const;

export const laneOf = (sectionId: string) => LANES.findIndex((l) => (l.sections as readonly string[]).includes(sectionId));

/** The Foundation line, top to bottom, with AIA's month markers between its stations. */
export type TrunkRow = { kind: "stage"; label: string; note: string } | { kind: "station"; section: string };

export const TRUNK: TrunkRow[] = [
  { kind: "stage", label: "Month 0", note: "Get licensed and build your foundation" },
  { kind: "station", section: "02a" },
  { kind: "station", section: "02b" },
  { kind: "stage", label: "Months 1 and 2", note: "The mindset, skills and tools of an MDRT aspirant" },
  { kind: "station", section: "02c" },
  { kind: "stage", label: "Months 3 to 12", note: "Monthly sessions that keep you active and productive" },
  { kind: "station", section: "02d" },
];

/** Where the Foundation line ends and the other four paths begin. */
export const JUNCTION = { label: "Month 13 onwards", title: "Choose your path", note: "Step into leadership, deepen your sales expertise, or both" };

const runsIn = (s: ScheduleEntry, month: number) => month >= s.month && month <= (s.endMonth ?? s.month);

/** Courses with a session (or an open self-paced window) in each month, per section that has any dates. */
export function monthMatrix(dir: Directory): { section: Section; lane: number; months: Course[][] }[] {
  return dir.sections
    .map((section) => {
      const courses = dir.courses.filter((c) => c.section === section.id && c.schedule?.length);
      const months = Array.from({ length: 12 }, (_, m) => courses.filter((c) => c.schedule!.some((s) => runsIn(s, m + 1))));
      return { section, lane: laneOf(section.id), months };
    })
    .filter((row) => row.months.some((m) => m.length > 0));
}

/** Every course running in a month, with the matching schedule line, in catalogue order. */
export function sessionsInMonth(dir: Directory, month: number): { course: Course; entry: ScheduleEntry }[] {
  return dir.courses.flatMap((course) => {
    const entry = course.schedule?.find((s) => runsIn(s, month));
    return entry ? [{ course, entry }] : [];
  });
}

/** Sum of published CPD hours, rounded down to the nearest 50 so the "+" is never an overstatement. */
export function cpdFloor(dir: Directory): number {
  const total = dir.courses.reduce((sum, c) => sum + (c.cpdHours ?? 0), 0);
  return Math.floor(total / 50) * 50;
}
