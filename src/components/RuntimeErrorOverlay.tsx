import { Component, ReactNode, useEffect, useState } from "react";
import { recoverFromStaleChunk, isStaleChunkError } from "@/utils/staleChunkRecovery";

/**
 * Build identifier shown in the overlay. We try (in order):
 *   1. /version.json — written by scripts/generate-version.mjs after vite build
 *   2. The hash segment of the running entry chunk URL (assets/index-XXXX.js)
 *   3. "dev"
 *
 * One-click "Reload latest" clears caches and reloads with a cache-bust query
 * param so the user always gets fresh chunks after a deploy.
 */

type BuildInfo = { buildId: string; builtAt?: string };

async function fetchBuildInfo(): Promise<BuildInfo> {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data?.buildId) return { buildId: String(data.buildId), builtAt: data.builtAt };
    }
  } catch {
    // fall through
  }
  // Fallback: extract hash from current script tag (assets/index-<hash>.js)
  if (typeof document !== "undefined") {
    const scripts = Array.from(document.querySelectorAll("script[src]"));
    for (const s of scripts) {
      const src = (s as HTMLScriptElement).src;
      const m = src.match(/assets\/index-([A-Za-z0-9_-]+)\.js/);
      if (m) return { buildId: m[1] };
    }
  }
  return { buildId: "dev" };
}

function hardReload() {
  try {
    if ("caches" in window) {
      window.caches.keys().then((keys) => Promise.all(keys.map((k) => window.caches.delete(k)))).finally(doReload);
      return;
    }
  } catch {
    // ignore
  }
  doReload();
}

function doReload() {
  const url = new URL(window.location.href);
  url.searchParams.set("__app_refresh", String(Date.now()));
  window.location.replace(url.toString());
}

function OverlayCard({ error }: { error: Error | string }) {
  const [info, setInfo] = useState<BuildInfo>({ buildId: "…" });

  useEffect(() => {
    void fetchBuildInfo().then(setInfo);
  }, []);

  const message = typeof error === "string" ? error : error.message;

  return (
    <div
      role="alertdialog"
      aria-labelledby="rt-err-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        background: "rgba(15, 23, 42, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          maxWidth: 520,
          width: "100%",
          padding: "1.5rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <h2 id="rt-err-title" style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
          Something went wrong
        </h2>
        <p style={{ marginTop: 8, fontSize: 14, color: "#475569" }}>
          The app hit a runtime error. This often happens right after a new version is deployed and your browser is still
          holding the previous chunks. Reload to fetch the latest build.
        </p>
        <pre
          style={{
            marginTop: 12,
            padding: 10,
            background: "#f8fafc",
            borderRadius: 8,
            fontSize: 12,
            color: "#b91c1c",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            maxHeight: 140,
            overflow: "auto",
          }}
        >
          {message}
        </pre>
        <div style={{ marginTop: 12, fontSize: 12, color: "#64748b" }}>
          Build: <code style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace" }}>{info.buildId}</code>
          {info.builtAt && (
            <>
              {" · "}
              <span>{new Date(info.builtAt).toLocaleString()}</span>
            </>
          )}
        </div>
        <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "#fff",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Go back
          </button>
          <button
            onClick={hardReload}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              background: "#2563eb",
              color: "#fff",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Reload latest
          </button>
        </div>
      </div>
    </div>
  );
}

interface BoundaryProps {
  children: ReactNode;
}
interface BoundaryState {
  error: Error | null;
  globalError: string | null;
}

export class RuntimeErrorOverlay extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null, globalError: null };

  private onError = (event: ErrorEvent) => {
    const reason = event.error ?? event.message;
    if (isStaleChunkError(reason)) {
      // staleChunkRecovery handles reload
      recoverFromStaleChunk();
      return;
    }
    this.setState({ globalError: event.message || String(reason) });
  };

  private onRejection = (event: PromiseRejectionEvent) => {
    if (isStaleChunkError(event.reason)) {
      recoverFromStaleChunk();
      return;
    }
    const msg =
      event.reason instanceof Error ? event.reason.message : typeof event.reason === "string" ? event.reason : "Unhandled promise rejection";
    this.setState({ globalError: msg });
  };

  componentDidMount() {
    window.addEventListener("error", this.onError);
    window.addEventListener("unhandledrejection", this.onRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.onError);
    window.removeEventListener("unhandledrejection", this.onRejection);
  }

  static getDerivedStateFromError(error: Error): Partial<BoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error) {
    if (isStaleChunkError(error)) {
      recoverFromStaleChunk();
    }
    // eslint-disable-next-line no-console
    console.error("[RuntimeErrorOverlay]", error);
  }

  render() {
    const active = this.state.error ?? this.state.globalError;
    return (
      <>
        {this.props.children}
        {active && <OverlayCard error={active as Error | string} />}
      </>
    );
  }
}
