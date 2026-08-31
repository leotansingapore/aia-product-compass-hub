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

/**
 * Routes the welcome tour is allowed to open itself over.
 *
 * The tour is an orientation for the whole platform, and it used to fire on
 * ANY route 600ms after landing. So someone who followed a playbook link a
 * colleague sent them got eight full-screen slides on top of the thing they
 * were sent, and had to dismiss it to reach the page. It now only opens on the
 * app's own landing surfaces: `/`, `/learning-track`, and a track's own home
 * page. Anything deeper is specific content somebody navigated to on purpose.
 *
 * The tour is NOT marked seen when it is held back, so it still runs the next
 * time that user lands on home. `?tour=1` (the replay link) overrides this.
 */
const TRACK_PREFIX = "/learning-track/";

export function isTourLandingPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/" || path === "/learning-track") return true;
  if (path.startsWith(TRACK_PREFIX)) {
    // "/learning-track/first-14-days" is a track home. Anything with a further
    // segment ("/day/3", "/assignments/x", "/week/2") is a specific lesson.
    return !path.slice(TRACK_PREFIX.length).includes("/");
  }
  return false;
}
