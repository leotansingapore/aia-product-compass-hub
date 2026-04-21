import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { recoverFromStaleChunk } from "@/utils/staleChunkRecovery";

/**
 * Polls /version.json (written by scripts/generate-version.mjs after each
 * build) and prompts the user to refresh when the buildId changes — i.e. a
 * new deploy has landed. Uses the first-load fetch as the baseline so we
 * don't need a build-time `__APP_BUILD_ID__` constant (keeps vite.config.ts
 * untouched per the Lovable split).
 *
 * Safe to mount once at the app root. Skipped in dev.
 */

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const INITIAL_DELAY_MS = 10_000;

async function fetchBuildId(): Promise<string | null> {
  try {
    const res = await fetch("/version.json", { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { buildId?: string };
    return typeof body.buildId === "string" ? body.buildId : null;
  } catch {
    return null;
  }
}

export function useVersionCheck() {
  const baselineRef = useRef<string | null>(null);
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    if (import.meta.env.DEV) return;

    let cancelled = false;

    const establishBaseline = async () => {
      const first = await fetchBuildId();
      if (cancelled) return;
      baselineRef.current = first;
    };

    const checkVersion = async () => {
      if (hasNotifiedRef.current || !baselineRef.current) return;
      const latest = await fetchBuildId();
      if (cancelled || !latest) return;
      if (latest !== baselineRef.current) {
        hasNotifiedRef.current = true;
        toast("A new version is available", {
          description: "Refresh to get the latest features and fixes.",
          duration: Infinity,
          action: {
            label: "Refresh",
            onClick: () => recoverFromStaleChunk(),
          },
        });
      }
    };

    void establishBaseline();

    const interval = setInterval(checkVersion, POLL_INTERVAL_MS);
    const firstCheck = setTimeout(checkVersion, INITIAL_DELAY_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") void checkVersion();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(firstCheck);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
}
