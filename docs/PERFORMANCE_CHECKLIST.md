# Performance Checklist

A repeatable, page-by-page playbook for hitting our load + navigation budgets.
Pair this with the in-app **Perf Overlay** (`?perf=1` on any URL, or
`localStorage.perfOverlay = '1'`) which records live Core Web Vitals and
route-change timings as you click around.

## Budgets (Google "good" thresholds)

| Metric | Budget | What it measures |
|---|---|---|
| **TTFB** | ≤ 800 ms | Server response latency |
| **FCP** | ≤ 1800 ms | First pixel painted |
| **LCP** | ≤ 2500 ms | Hero element rendered |
| **CLS** | ≤ 0.1 | Cumulative layout shift |
| **INP** | ≤ 200 ms | Interaction responsiveness |
| **Route change** | ≤ 300 ms | In-app navigation snappiness |

The overlay color-codes each cell: green ≤ budget, amber ≤ 1.6× budget, red beyond.

## How to measure

1. **Per page:** open `/<route>?perf=1`, hard-refresh, note initial LCP/FCP. Then
   navigate around the app — every route change is recorded with timestamp + ms.
2. **Persistent:** the overlay rolls over the last 50 route changes; keep it
   open while doing real work to catch slow pages organically.
3. **Compare deploys:** before/after a perf PR, capture the overlay screenshot
   on the same set of routes (Dashboard, Learning Track, Scripts, Roleplay).
4. **Production sanity:** run Lighthouse mobile on the published URL once per
   release for a third-party reference number.

## Initial load — checklist

- [ ] **Route is lazy-loaded** in `src/App.tsx` via `lazyWithRetry(() => import('...'))`. No new pages added as eager imports.
- [ ] **No heavy library is imported synchronously** in code that runs on app boot. Audit with:
      `rg "from '(recharts\|mermaid\|cytoscape\|katex\|@tiptap\|html2canvas\|emoji-picker-react)'" src` — every hit must be inside a lazy chunk.
- [ ] **Above-the-fold images use `loading="eager"` + `fetchpriority="high"`**; everything else is `loading="lazy"` with explicit `width`/`height` to prevent CLS.
- [ ] **No blocking data waterfalls.** Parallelize independent Supabase queries (`Promise.all` or sibling `useQuery` calls). Avoid "fetch user → fetch profile → fetch progress" chains.
- [ ] **TanStack Query `staleTime` is set** for any data that doesn't need realtime freshness. Default in `App.tsx` is 2 min; bump to 5 min for static lookups.
- [ ] **Provider tree stays lean.** New providers added at the root should be lazy-mounted (e.g. CMFAS, Pomodoro) so non-consumers don't pay for hydration queries.
- [ ] **Suspense fallback is a real `SkeletonLoader`** (matches the page's layout) so LCP swaps in place instead of triggering a layout shift.
- [ ] **Fonts use `font-display: swap`** and are preloaded only if used above the fold.

## Route change — checklist

- [ ] **Route renders ≤ 300 ms** in the overlay on a warm cache. If not:
  - [ ] Confirm the chunk is small (`bun run build` and inspect `dist/assets`). Anything > 200 KB on a learner-facing route needs further splitting.
  - [ ] Check if the page mounts a heavy editor / diagram / chart synchronously — wrap in `Suspense + lazy()` and key the editor by route.
  - [ ] Confirm the page doesn't re-fetch data that another page already loaded into the Query cache (use the same `queryKey` shape).
- [ ] **`prefetchCommonRoutes` (in `src/utils/prefetchRoutes.ts`) lists this page** if it's a high-traffic destination (top learner pages). Idle-prefetched chunks render instantly on first visit too.
- [ ] **No layout shift on transition.** Header/sidebar widths stable; spinner/skeleton occupies the final layout's box.
- [ ] **Scroll position is reset / preserved deliberately** (don't rely on browser default — React Router doesn't reset by default).

## Per-page audit template

Copy this into a tracking issue when running a perf pass on a route.

```
Page: /<route>
Tester: <name>  Date: <date>  Build: <git sha>

Initial load (cold cache, mobile profile)
  TTFB: ___ ms       FCP: ___ ms       LCP: ___ ms
  CLS:  ___          INP: ___ ms
  Bundle size for this route's chunk: ___ KB

Route change (warm cache, average of 5 visits)
  ___ ms

Issues found:
  -

Fixes applied:
  -
```

## When the overlay shows red

| Metric red | First thing to check |
|---|---|
| **TTFB** | Edge function cold start? Check Supabase logs. |
| **FCP / LCP** | Big synchronous chunk on the critical path; lazy-split the heaviest dependency. |
| **CLS** | Image without `width`/`height`, font swap reflow, or skeleton size mismatch. |
| **INP** | Long task during interaction — profile with DevTools, look for unmemoized re-renders or sync JSON parsing. |
| **Route change** | Suspense fallback flashing → preload the chunk in `prefetchRoutes`, or fold the next page's data into the previous page's Query cache. |

## Files involved

- `src/lib/perf/measure.ts` — vitals + route history store
- `src/lib/perf/useRouteChangeTiming.ts` — records every route transition
- `src/components/PerfOverlay.tsx` — the floating panel (only renders when enabled)
- `src/components/RouteTracker.tsx` — wires the timing hook into the router
- `src/utils/prefetchRoutes.ts` — idle-time chunk warming for common routes
