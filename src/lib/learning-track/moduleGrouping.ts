import type { LearningTrackItem, LearningTrackPhase } from "@/types/learning-track";

/** Persisted on lesson rows that are top-level “pages”, not lessons under a folder. */
export const STANDALONE_PAGE_TAG = "standalone";

/**
 * True when this lesson should always render as a root-level page in the outline,
 * regardless of sort position (uses `hidden_resources`).
 */
export function isStandaloneRootPage(item: LearningTrackItem): boolean {
  return Array.isArray(item.hidden_resources) && item.hidden_resources.includes(STANDALONE_PAGE_TAG);
}

/**
 * An item is a module folder if:
 * 1. It has hidden_resources containing "module" (explicitly marked), OR
 * 2. Its title matches a module-like pattern (e.g., "Module 1:", "Module 2 -")
 *    — handles pre-existing Skool imports that weren't explicitly marked.
 */
export function isModuleFolder(item: LearningTrackItem): boolean {
  if (Array.isArray(item.hidden_resources) && item.hidden_resources.includes("module")) {
    return true;
  }
  // Auto-detect module-like titles from Skool imports
  return /\bmodule\s*\d/i.test(item.title);
}

export type OutlineSegment =
  | { type: "standalone"; item: LearningTrackItem }
  | { type: "module"; module: LearningTrackItem; lessons: LearningTrackItem[] };

/**
 * Builds ordered outline segments from flat `order_index` order.
 * Lessons with `standalone` in `hidden_resources` are always root-level pages, never grouped under the previous module.
 * Legacy: non-folder items before the first module folder with no tag are treated as standalone rows (same as before).
 */
export function buildOutlineSegments(items: LearningTrackItem[]): OutlineSegment[] {
  const ordered = [...items].sort((a, b) => a.order_index - b.order_index);
  const out: OutlineSegment[] = [];
  let mod: LearningTrackItem | null = null;
  let buf: LearningTrackItem[] = [];

  const emitModule = () => {
    if (mod) {
      out.push({ type: "module", module: mod, lessons: [...buf] });
      buf = [];
      mod = null;
    }
  };

  for (const item of ordered) {
    if (isModuleFolder(item)) {
      emitModule();
      mod = item;
      continue;
    }
    if (isStandaloneRootPage(item)) {
      emitModule();
      out.push({ type: "standalone", item });
      continue;
    }
    if (mod) {
      buf.push(item);
    } else {
      out.push({ type: "standalone", item });
    }
  }
  emitModule();
  return out;
}

export function outlineSegmentsToFlat(segments: OutlineSegment[]): LearningTrackItem[] {
  return segments.flatMap((s) => (s.type === "standalone" ? [s.item] : [s.module, ...s.lessons]));
}

/** @deprecated name kept for callers — use buildOutlineSegments + outlineSegmentsToFlat */
export function groupItemsIntoModules(items: LearningTrackItem[]) {
  const segments = buildOutlineSegments(items);
  const groups = segments
    .filter((s): s is Extract<OutlineSegment, { type: "module" }> => s.type === "module")
    .map((s) => ({ module: s.module, lessons: s.lessons }));
  const orphanLessons = segments
    .filter((s): s is Extract<OutlineSegment, { type: "standalone" }> => s.type === "standalone")
    .map((s) => s.item);
  if (!groups.length && orphanLessons.length > 0) {
    return { groups: [], orphanLessons, segments };
  }
  return { groups, orphanLessons, segments };
}

export function nextHiddenResourcesForLesson(
  item: LearningTrackItem,
  asRootStandalonePage: boolean,
): string[] {
  const base = [...(item.hidden_resources ?? [])].filter((h) => h !== STANDALONE_PAGE_TAG);
  if (asRootStandalonePage) base.push(STANDALONE_PAGE_TAG);
  return base;
}
