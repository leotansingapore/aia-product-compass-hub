// Layout and counts for the directory's Overview: the career-line map
// (AIA's Tied Distribution roadmap drawn as metro lines) and the 2026 heatmap.
import type { Course, Directory, ScheduleEntry, Section } from "./filter";

/** One metro line per path in AIA's roadmap. Order is the validated colour order (--lane-1..5). */
export const LANES = [
  { id: "foundation", name: "Foundation", sections: ["02a", "02b", "02c", "02d"] },
  { id: "selling", name: "Advanced selling", sections: ["03a", "03b", "03c", "03d", "03e"] },
  { id: "mdrt", name: "MDRT", sections: ["03f"] },
  { id: "specialist", name: "Specialised markets", sections: ["03g", "03h"] },
  { id: "leadership", name: "Leadership", sections: ["04a", "04b", "04c"] },
] as const;

export const laneOf = (sectionId: string) => LANES.findIndex((l) => (l.sections as readonly string[]).includes(sectionId));

export type MapRow =
  | { kind: "stage"; label: string; note: string }
  | { kind: "station"; section: string; lane: number }
  | { kind: "interchange"; label: string; note: string };

const stations = (lane: number) => LANES[lane].sections.map((section) => ({ kind: "station" as const, section, lane }));

export const MAP_ROWS: MapRow[] = [
  { kind: "stage", label: "Month 0", note: "Get licensed and build the foundation" },
  ...stations(0).slice(0, 2),
  { kind: "stage", label: "Month 1 to 2", note: "Mindset, skillset and toolset of an MDRT aspirant" },
  stations(0)[2],
  { kind: "stage", label: "Month 3 to 12", note: "Monthly sessions to stay active and productive" },
  stations(0)[3],
  { kind: "interchange", label: "Month 13 onwards", note: "Step into leadership, deepen your sales expertise, or both" },
  ...stations(1),
  ...stations(2),
  ...stations(3),
  ...stations(4),
];

/**
 * Which half-segments of each lane to draw on each row: `top` runs from the
 * row's top edge to its station level, `bottom` from there to the bottom edge.
 * Foundation runs from its first station into the interchange; every other
 * line leaves the interchange and ends at its last station.
 */
export function laneSegments(rows: MapRow[]): { top: boolean; bottom: boolean }[][] {
  const hub = rows.findIndex((r) => r.kind === "interchange");
  const spans = LANES.map((_, lane) => {
    const own = rows.flatMap((r, i) => (r.kind === "station" && r.lane === lane ? [i] : []));
    return lane === 0 ? { start: own[0], end: hub } : { start: hub, end: own[own.length - 1] };
  });
  return rows.map((_, r) =>
    spans.map(({ start, end }) => ({ top: start < r && r <= end, bottom: start <= r && r < end })),
  );
}

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
