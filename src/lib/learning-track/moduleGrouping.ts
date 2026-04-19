import type { LearningTrackItem, LearningTrackPhase } from "@/types/learning-track";

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

/** Groups a flat list of items into modules (folders) with their child lessons. */
export function groupItemsIntoModules(items: LearningTrackItem[]) {
  const ordered = [...items].sort((a, b) => a.order_index - b.order_index);
  const groups: { module: LearningTrackItem; lessons: LearningTrackItem[] }[] = [];
  let currentModule: LearningTrackItem | null = null;
  let currentLessons: LearningTrackItem[] = [];

  for (const item of ordered) {
    if (isModuleFolder(item)) {
      if (currentModule) {
        groups.push({ module: currentModule, lessons: currentLessons });
      }
      currentModule = item;
      currentLessons = [];
    } else {
      currentLessons.push(item);
    }
  }
  if (currentModule) {
    groups.push({ module: currentModule, lessons: currentLessons });
  }
  if (!groups.length && currentLessons.length > 0) {
    return { groups: [], orphanLessons: currentLessons };
  }
  const firstModuleIdx = ordered.findIndex(isModuleFolder);
  const orphans = firstModuleIdx > 0 ? ordered.slice(0, firstModuleIdx) : [];
  return { groups, orphanLessons: orphans };
}
