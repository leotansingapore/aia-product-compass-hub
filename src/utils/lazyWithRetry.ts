import { lazy, type ComponentType } from "react";
import { isStaleChunkError, recoverFromStaleChunk } from "./staleChunkRecovery";

/**
 * Drop-in replacement for React.lazy that recovers from stale chunk errors.
 *
 * When a deploy lands, the currently-loaded `index.html` references hashed
 * chunk filenames that no longer exist on the server. The next dynamic
 * `import()` then throws "Failed to fetch dynamically imported module" and
 * React Router renders a blank screen.
 *
 * This wrapper catches that specific error and triggers a one-shot,
 * cache-busting reload via `recoverFromStaleChunk` (capped at 2 attempts per
 * session so we never hard-loop). All other errors are re-thrown so real bugs
 * still surface.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(() =>
    factory().catch(async (error) => {
      if (!isStaleChunkError(error)) throw error;
      // Transient network blips throw the same "Failed to fetch dynamically
      // imported module" error as a genuinely-stale chunk after a deploy.
      // Retry once after a short backoff so a one-off CDN hiccup doesn't
      // hard-reload the user's page mid-navigation. Only fall through to
      // `recoverFromStaleChunk` (a `window.location.replace`) when the
      // chunk really is gone.
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return await factory();
      } catch (retryError) {
        if (isStaleChunkError(retryError) && recoverFromStaleChunk()) {
          return new Promise<{ default: T }>(() => {});
        }
        throw retryError;
      }
    })
  );
}
