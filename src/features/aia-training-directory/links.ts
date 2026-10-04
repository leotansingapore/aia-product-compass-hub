// Deep links for the AIA Training Directory. Every view, course, section and
// roadmap has a URL, and the course filters live in the query string, so any
// state a consultant sees can be shared or bookmarked.
import { EMPTY_FILTERS, type Filters, type SortKey, type StageFilter } from "./filter";

export const BASE = "/learning-track/post-rnf/aia-training";

export const coursesUrl = (search = "") => `${BASE}/courses${search ? `?${search}` : ""}`;
export const courseUrl = (courseId: string) => `${BASE}/courses/${courseId}`;
export const sectionUrl = (sectionId: string) => coursesUrl(`section=${sectionId}`);
export const roadmapUrl = (roadmapId: string) => `${BASE}/roadmaps/${roadmapId}`;
export const UPCOMING_URL = coursesUrl("upcoming=1&sort=next");

const STAGES: StageFilter[] = ["all", "new", "experienced", "leaders"];
const SORTS: SortKey[] = ["catalogue", "az", "cpd", "next"];
const FLAGS = [
  ["mandatory", "mandatory"],
  ["essential", "essential"],
  ["isNew", "new"],
  ["upcoming", "upcoming"],
] as const;

/** Unknown or garbled values fall back to the defaults instead of breaking the page. */
export function filtersFromParams(p: URLSearchParams): Filters {
  const stage = p.get("stage") as StageFilter | null;
  const sort = p.get("sort") as SortKey | null;
  const f: Filters = {
    ...EMPTY_FILTERS,
    query: p.get("q") ?? "",
    stage: stage && STAGES.includes(stage) ? stage : "all",
    sort: sort && SORTS.includes(sort) ? sort : "catalogue",
  };
  for (const [key, param] of FLAGS) f[key] = p.get(param) === "1";
  return f;
}

/** Writes only what differs from the defaults, and keeps any non-filter params (like `section`). */
export function filtersToParams(f: Filters, keep?: URLSearchParams): URLSearchParams {
  const p = new URLSearchParams(keep);
  for (const key of ["q", "stage", "sort", ...FLAGS.map(([, param]) => param)]) p.delete(key);
  if (f.query) p.set("q", f.query);
  if (f.stage !== "all") p.set("stage", f.stage);
  for (const [key, param] of FLAGS) if (f[key]) p.set(param, "1");
  if (f.sort !== "catalogue") p.set("sort", f.sort);
  return p;
}

/** Full, shareable address for a path inside the app. */
export const absolute = (path: string) => new URL(path, window.location.origin).href;
