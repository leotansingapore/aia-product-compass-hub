/**
 * Read-progress for the Scripts Fundamentals mini-course (the former
 * "Tips & Best Practices" scripts, now a guided read at /scripts/course).
 * localStorage per user — recommended reading, not a graded activity, so no
 * DB table (Lovable owns migrations; same pattern as the question-bank store).
 */

const KEY_PREFIX = "scripts-course-read-";

function storageKey(userId: string | undefined) {
  return `${KEY_PREFIX}${userId ?? "guest"}`;
}

export function getReadLessonIds(userId: string | undefined): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

export function markLessonRead(userId: string | undefined, lessonId: string): Set<string> {
  const read = getReadLessonIds(userId);
  if (!read.has(lessonId)) {
    read.add(lessonId);
    try {
      localStorage.setItem(storageKey(userId), JSON.stringify([...read]));
    } catch {
      /* storage unavailable — progress just won't persist */
    }
  }
  return read;
}
