/**
 * Lightweight, dependency-free performance instrumentation.
 *
 * Captures Core Web Vitals from the browser's PerformanceObserver and route-
 * change timings from React Router (recorded by `useRouteChangeTiming`). All
 * data lives in-memory + localStorage so the overlay can render it without a
 * network round-trip. Disabled by default — enable per-session by visiting
 * any page with `?perf=1`, or persistently via `localStorage.perfOverlay=1`.
 *
 * Numbers are intentionally raw (ms / unitless CLS); the overlay handles
 * formatting + thresholds against the standard Web Vitals "good" budgets:
 *   LCP <= 2500ms, FCP <= 1800ms, CLS <= 0.1, INP <= 200ms, TTFB <= 800ms.
 */

export type RouteTiming = {
  path: string;
  /** ms from navigation start (route change) to first paint after commit */
  durationMs: number;
  timestamp: number;
};

export type WebVitals = {
  ttfb?: number;
  fcp?: number;
  lcp?: number;
  cls?: number;
  inp?: number;
};

const ROUTE_HISTORY_KEY = "perf:route-history";
const MAX_HISTORY = 50;

const state: {
  vitals: WebVitals;
  routes: RouteTiming[];
  listeners: Set<() => void>;
} = {
  vitals: {},
  routes: [],
  listeners: new Set(),
};

// Hydrate route history so the overlay survives reloads.
try {
  const raw = localStorage.getItem(ROUTE_HISTORY_KEY);
  if (raw) state.routes = JSON.parse(raw);
} catch {
  // ignore
}

function notify() {
  state.listeners.forEach((cb) => cb());
}

function persistRoutes() {
  try {
    localStorage.setItem(
      ROUTE_HISTORY_KEY,
      JSON.stringify(state.routes.slice(-MAX_HISTORY))
    );
  } catch {
    // ignore quota errors
  }
}

export function isPerfEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (new URLSearchParams(window.location.search).get("perf") === "1") {
      localStorage.setItem("perfOverlay", "1");
      return true;
    }
    if (new URLSearchParams(window.location.search).get("perf") === "0") {
      localStorage.removeItem("perfOverlay");
      return false;
    }
    return localStorage.getItem("perfOverlay") === "1";
  } catch {
    return false;
  }
}

export function getVitals(): WebVitals {
  return { ...state.vitals };
}

export function getRoutes(): RouteTiming[] {
  return state.routes.slice();
}

export function clearRoutes() {
  state.routes = [];
  persistRoutes();
  notify();
}

export function recordRoute(timing: RouteTiming) {
  state.routes.push(timing);
  if (state.routes.length > MAX_HISTORY) {
    state.routes = state.routes.slice(-MAX_HISTORY);
  }
  persistRoutes();
  notify();
}

export function subscribe(cb: () => void): () => void {
  state.listeners.add(cb);
  return () => state.listeners.delete(cb);
}

let initialized = false;

/**
 * Wire up PerformanceObservers for the standard vitals. Idempotent — safe to
 * call from multiple entry points.
 */
export function initVitalsObservers(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  // TTFB from navigation timing — synchronous, available immediately.
  try {
    const nav = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming | undefined;
    if (nav) {
      state.vitals.ttfb = Math.max(0, nav.responseStart - nav.requestStart);
      notify();
    }
  } catch {
    // ignore
  }

  const safeObserve = (
    type: string,
    cb: (entries: PerformanceEntryList) => void,
    opts: PerformanceObserverInit = { type, buffered: true } as PerformanceObserverInit
  ) => {
    try {
      const obs = new PerformanceObserver((list) => cb(list.getEntries()));
      obs.observe(opts);
    } catch {
      // type unsupported in this engine — silently skip
    }
  };

  // FCP — paint entry
  safeObserve("paint", (entries) => {
    const fcp = entries.find((e) => e.name === "first-contentful-paint");
    if (fcp) {
      state.vitals.fcp = fcp.startTime;
      notify();
    }
  });

  // LCP — keep the latest, biggest candidate
  safeObserve("largest-contentful-paint", (entries) => {
    const last = entries[entries.length - 1] as PerformanceEntry & {
      renderTime?: number;
      loadTime?: number;
    };
    if (last) {
      state.vitals.lcp = last.startTime || last.renderTime || last.loadTime;
      notify();
    }
  });

  // CLS — accumulate session window of unexpected layout shifts
  let clsValue = 0;
  safeObserve("layout-shift", (entries) => {
    for (const entry of entries as Array<PerformanceEntry & { value: number; hadRecentInput?: boolean }>) {
      if (!entry.hadRecentInput) clsValue += entry.value;
    }
    state.vitals.cls = clsValue;
    notify();
  });

  // INP — closest available proxy via event timing
  safeObserve("event", (entries) => {
    let max = state.vitals.inp ?? 0;
    for (const entry of entries as Array<PerformanceEntry & { duration: number; interactionId?: number }>) {
      if (entry.interactionId && entry.duration > max) max = entry.duration;
    }
    if (max !== state.vitals.inp) {
      state.vitals.inp = max;
      notify();
    }
  }, { type: "event", buffered: true, durationThreshold: 16 } as PerformanceObserverInit);
}

// Threshold helpers used by the overlay — Google "good" budgets.
export const VITAL_BUDGETS = {
  ttfb: 800,
  fcp: 1800,
  lcp: 2500,
  cls: 0.1,
  inp: 200,
  route: 300, // in-app navigation budget for a "snappy" feel
} as const;

export function rateVital(
  metric: keyof typeof VITAL_BUDGETS,
  value: number | undefined
): "good" | "warn" | "poor" | "unknown" {
  if (value == null) return "unknown";
  const budget = VITAL_BUDGETS[metric];
  if (value <= budget) return "good";
  if (value <= budget * 1.6) return "warn";
  return "poor";
}
