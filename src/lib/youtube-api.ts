/**
 * youtube-api.ts
 *
 * Singleton loader for YouTube's iframe_api script. The previous setup —
 * inline inside ProductModuleCourseLayout's useEffect — appended the script
 * tag once but rebuilt `window.onYouTubeIframeAPIReady` on every effect run,
 * stacking callbacks that previous mounts had registered. With multiple
 * components consuming the API (product layout + admin video editor + future
 * roleplay surfaces) this caused subtle "did the callback fire twice" bugs.
 *
 * Now there's one Promise per page session that resolves with the global YT
 * namespace. Callers `await ensureYouTubeAPI()` then construct their Player.
 */

// Augment the window typing for the YT namespace + the API-ready hook.
declare global {
  interface Window {
    YT?: { Player?: unknown };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const SCRIPT_URL = "https://www.youtube.com/iframe_api";

let ytPromise: Promise<Window["YT"]> | null = null;

export function ensureYouTubeAPI(): Promise<Window["YT"]> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube API requires a browser"));
  }
  // Already loaded — return the cached resolution.
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }
  // Load in flight — share the same promise.
  if (ytPromise) return ytPromise;

  ytPromise = new Promise<Window["YT"]>((resolve) => {
    const finish = () => {
      if (window.YT?.Player) resolve(window.YT);
    };

    // Insert the script if it's not already on the page (covers SSR-warmed
    // pages or earlier non-singleton mounts that injected it the old way).
    if (!document.querySelector(`script[src="${SCRIPT_URL}"]`)) {
      const tag = document.createElement("script");
      tag.src = SCRIPT_URL;
      tag.async = true;
      document.head.appendChild(tag);
    }

    // Chain onto any existing onYouTubeIframeAPIReady so we don't clobber
    // someone else's setup. The previous handler is invoked first; we then
    // resolve our promise.
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      try {
        prev?.();
      } catch {
        /* ignore */
      }
      finish();
    };

    // Hot-path: maybe the script is already loaded and `window.YT.Player`
    // exists — finish() will resolve immediately.
    finish();
  });

  return ytPromise;
}
