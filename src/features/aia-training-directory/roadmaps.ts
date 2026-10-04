// Presentation for the six AIA roadmaps: a short picker name, a colour per
// stage (the overview's path colours), whether the stages run in order, and
// which roadmap labels point at a course or section in the catalogue.
import { courseUrl, sectionUrl } from "./links";

export const ROADMAP_META: Record<string, { short: string; lanes: number[]; sequential: boolean }> = {
  "tied-distribution": { short: "Your whole career", lanes: [0, 1, 4], sequential: true },
  "new-consultant": { short: "New consultants", lanes: [0, 0, 0], sequential: true },
  "experienced-consultant": { short: "Experienced consultants", lanes: [1, 2, 3], sequential: false },
  "health-academy": { short: "Health Academy", lanes: [1, 1, 1, 1], sequential: true },
  "affluent-hnw": { short: "Affluent and HNW", lanes: [3, 3], sequential: false },
  leaders: { short: "Leaders", lanes: [4, 4, 4], sequential: true },
};

/**
 * The in-app address a roadmap label links to, or null when it names nothing
 * in the catalogue. The label map ships with the catalogue from the edge
 * function (`dir.roadmapLinks`): its keys are AIA's own labels, so it must
 * not live in browser code.
 */
export function roadmapTarget(label: string, links: Record<string, string>): string | null {
  const t = links[label];
  if (!t) return null;
  const [kind, id] = t.split(":");
  return kind === "course" ? courseUrl(id) : sectionUrl(id);
}

export type Tag = "new" | "essential" | "mandatory";
const TAGS: Tag[] = ["new", "essential", "mandatory"];

/**
 * Splits AIA's trailing "(new, essential)" style notes off a label so they can
 * render as badges. Anything else in the brackets (TBC, IBF Level 1, LIMRA)
 * stays in the text, because it is part of the name.
 */
export function splitTags(label: string): { text: string; tags: Tag[] } {
  const m = label.match(/^(.*?)\s*\(([^()]*)\)$/);
  if (!m) return { text: label, tags: [] };
  const parts = m[2].split(",").map((s) => s.trim());
  const tags = parts.filter((s): s is Tag => (TAGS as string[]).includes(s));
  if (!tags.length) return { text: label, tags: [] };
  const rest = parts.filter((s) => !(TAGS as string[]).includes(s));
  return { text: rest.length ? `${m[1]} (${rest.join(", ")})` : m[1], tags };
}
