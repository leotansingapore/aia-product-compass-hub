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
    factory().catch((error) => {
      if (isStaleChunkError(error) && recoverFromStaleChunk()) {
        // Reload is in flight — return a never-resolving promise so React
        // suspends instead of bubbling the error to the boundary.
        return new Promise<{ default: T }>(() => {});
      }
      throw error;
    })
  );
}
