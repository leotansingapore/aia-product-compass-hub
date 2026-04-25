import { useEffect, useState, useSyncExternalStore } from "react";
import {
  clearRoutes,
  getRoutes,
  getVitals,
  initVitalsObservers,
  isPerfEnabled,
  rateVital,
  subscribe,
  VITAL_BUDGETS,
  type WebVitals,
} from "@/lib/perf/measure";

/**
 * In-app performance overlay — opt-in, zero-cost when disabled.
 *
 * Enable: append `?perf=1` to any URL (persists via localStorage), or run
 *   `localStorage.perfOverlay = '1'` in the console.
 * Disable: `?perf=0` or `localStorage.removeItem('perfOverlay')`.
 *
 * Shows live Core Web Vitals (TTFB / FCP / LCP / CLS / INP) plus the rolling
 * route-change history captured by `useRouteChangeTiming`. Color-coded against
 * the standard Google "good" budgets so you can spot regressions per page.
 */
export function PerfOverlay() {
  const enabled = useEnabled();

  // Subscribe to the perf store via useSyncExternalStore so the overlay
  // re-renders the moment a vital lands or a route is recorded.
  const vitals = useSyncExternalStore(subscribe, getVitals, getVitals);
  const routes = useSyncExternalStore(subscribe, getRoutes, getRoutes);

  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (enabled) initVitalsObservers();
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] w-[320px] max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-background/95 backdrop-blur shadow-xl text-xs font-mono"
      role="complementary"
      aria-label="Performance metrics overlay"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 border-b border-border hover:bg-muted/50 rounded-t-lg"
      >
        <span className="font-semibold">⚡ Perf</span>
        <span className="text-muted-foreground">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="p-3 space-y-3 max-h-[60vh] overflow-y-auto">
          <VitalsGrid vitals={vitals} />

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold">Route changes</span>
              <button
                type="button"
                onClick={clearRoutes}
                className="text-muted-foreground hover:text-foreground"
              >
                clear
              </button>
            </div>
            {routes.length === 0 ? (
              <p className="text-muted-foreground">Navigate to record timings…</p>
            ) : (
              <ul className="space-y-0.5">
                {routes
                  .slice()
                  .reverse()
                  .slice(0, 12)
                  .map((r, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Dot rating={rateVital("route", r.durationMs)} />
                      <span className="flex-1 truncate" title={r.path}>
                        {r.path}
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {Math.round(r.durationMs)}ms
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <p className="text-[10px] text-muted-foreground leading-snug">
            Budgets: LCP&nbsp;≤{VITAL_BUDGETS.lcp}ms · FCP&nbsp;≤{VITAL_BUDGETS.fcp}ms ·
            CLS&nbsp;≤{VITAL_BUDGETS.cls} · INP&nbsp;≤{VITAL_BUDGETS.inp}ms ·
            Route&nbsp;≤{VITAL_BUDGETS.route}ms
          </p>
        </div>
      )}
    </div>
  );
}

function VitalsGrid({ vitals }: { vitals: WebVitals }) {
  const cells: Array<{ label: string; key: keyof WebVitals; format: (v: number) => string; metric: keyof typeof VITAL_BUDGETS }> = [
    { label: "TTFB", key: "ttfb", format: (v) => `${Math.round(v)}ms`, metric: "ttfb" },
    { label: "FCP", key: "fcp", format: (v) => `${Math.round(v)}ms`, metric: "fcp" },
    { label: "LCP", key: "lcp", format: (v) => `${Math.round(v)}ms`, metric: "lcp" },
    { label: "CLS", key: "cls", format: (v) => v.toFixed(3), metric: "cls" },
    { label: "INP", key: "inp", format: (v) => `${Math.round(v)}ms`, metric: "inp" },
  ];

  return (
    <div className="grid grid-cols-5 gap-1">
      {cells.map((c) => {
        const value = vitals[c.key];
        const rating = rateVital(c.metric, value);
        return (
          <div
            key={c.key}
            className="flex flex-col items-center rounded border border-border px-1 py-1.5"
          >
            <span className="text-[10px] uppercase text-muted-foreground">{c.label}</span>
            <span className="flex items-center gap-1 tabular-nums">
              <Dot rating={rating} />
              <span>{value == null ? "—" : c.format(value)}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Dot({ rating }: { rating: "good" | "warn" | "poor" | "unknown" }) {
  const color =
    rating === "good"
      ? "bg-emerald-500"
      : rating === "warn"
        ? "bg-amber-500"
        : rating === "poor"
          ? "bg-rose-500"
          : "bg-muted-foreground/40";
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} aria-hidden />;
}

/** React to ?perf=1 / localStorage changes without a full reload. */
function useEnabled(): boolean {
  const [enabled, setEnabled] = useState(() => isPerfEnabled());
  useEffect(() => {
    setEnabled(isPerfEnabled());
    const onStorage = () => setEnabled(isPerfEnabled());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return enabled;
}
