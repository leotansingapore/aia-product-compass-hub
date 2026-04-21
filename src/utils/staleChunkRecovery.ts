/**
 * Cache-busting reload helper. When a new deploy lands, the previous dynamic
 * chunks referenced by the currently-loaded `index.html` may 404 or return
 * stale bytes — that throws one of the messages in STALE_CHUNK_PATTERNS. This
 * util clears caches and reloads with a fresh query param. A session-scoped
 * counter caps retries so we never hard-loop.
 */
const STALE_CHUNK_RELOAD_KEY = "stale-chunk-reload-attempts";
const STALE_CHUNK_RELOAD_LIMIT = 2;
const STALE_CHUNK_RELOAD_PARAM = "__app_refresh";

const STALE_CHUNK_PATTERNS = [
  "Failed to fetch dynamically imported module",
  "Importing a module script failed",
  "error loading dynamically imported module",
  "dynamically imported module",
  "module script failed",
];

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message : String(message ?? "");
  }
  return String(error ?? "");
}

async function clearBrowserCaches() {
  if (typeof window === "undefined" || !("caches" in window)) return;
  try {
    const cacheKeys = await window.caches.keys();
    await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
  } catch {
    // Ignore cache-API failures; the cache-busting URL param below is the main
    // recovery path.
  }
}

export function isStaleChunkError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return STALE_CHUNK_PATTERNS.some((pattern) => message.includes(pattern.toLowerCase()));
}

export function recoverFromStaleChunk(): boolean {
  if (typeof window === "undefined") return false;

  const attempts = Number(sessionStorage.getItem(STALE_CHUNK_RELOAD_KEY) ?? "0");
  if (attempts >= STALE_CHUNK_RELOAD_LIMIT) {
    sessionStorage.removeItem(STALE_CHUNK_RELOAD_KEY);
    return false;
  }

  const nextAttempt = attempts + 1;
  sessionStorage.setItem(STALE_CHUNK_RELOAD_KEY, String(nextAttempt));

  const url = new URL(window.location.href);
  url.searchParams.set(STALE_CHUNK_RELOAD_PARAM, `${Date.now()}-${nextAttempt}`);

  void clearBrowserCaches().finally(() => {
    window.location.replace(url.toString());
  });

  return true;
}

export function resetStaleChunkRecovery(): void {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(STALE_CHUNK_RELOAD_KEY);

  const url = new URL(window.location.href);
  if (!url.searchParams.has(STALE_CHUNK_RELOAD_PARAM)) return;

  url.searchParams.delete(STALE_CHUNK_RELOAD_PARAM);
  window.history.replaceState({}, document.title, url.toString());
}
