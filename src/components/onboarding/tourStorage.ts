const STORAGE_KEY_PREFIX = "animated-tour-seen-";

function getSeenKey(userId: string | undefined) {
  return `${STORAGE_KEY_PREFIX}${userId ?? "guest"}`;
}

export function hasSeenAnimatedTour(
  userId: string | undefined,
  globalResetAt?: Date | null
) {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(getSeenKey(userId));
    if (!raw) return false;
    const seenAt = new Date(raw);
    if (Number.isNaN(seenAt.getTime())) return true;
    if (globalResetAt && globalResetAt.getTime() > seenAt.getTime()) return false;
    return true;
  } catch {
    return true;
  }
}

export function markAnimatedTourSeen(userId: string | undefined) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getSeenKey(userId), new Date().toISOString());
  } catch {
    /* ignore */
  }
}

export function clearAnimatedTourSeen(userId: string | undefined) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getSeenKey(userId));
  } catch {
    /* ignore */
  }
}
