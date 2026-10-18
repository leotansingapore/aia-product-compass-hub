/**
 * Schedule `cb` when the browser is idle, with a safe fallback for engines
 * (Safari) that don't implement requestIdleCallback. Returns a cancel fn.
 *
 * Providers use this to defer Supabase hydration queries that aren't needed
 * for first paint — the learning-track hub has its own critical-path queries
 * and shouldn't compete with CMFAS-only providers for network + main thread.
 */
export function scheduleIdle(cb: () => void, timeoutMs = 1500): () => void {
  if (typeof window === 'undefined') {
    cb();
    return () => undefined;
  }
  type IdleWin = Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (handle: number) => void;
  };
  const w = window as IdleWin;
  if (typeof w.requestIdleCallback === 'function') {
    const handle = w.requestIdleCallback(cb, { timeout: timeoutMs });
    return () => w.cancelIdleCallback?.(handle);
  }
  const handle = window.setTimeout(cb, 200);
  return () => window.clearTimeout(handle);
}

/**
 * After the load event, then `ms`, then the next idle moment. requestIdleCallback's
 * timeout is a deadline, not a delay: while a page waits on the network the thread
 * is idle, so scheduleIdle alone fires at once and competes with that page's
 * requests. In this app `load` fires long before a lesson shows, hence the wait.
 */
export function scheduleAfterLoad(ms: number, cb: () => void): void {
  const go = () => window.setTimeout(() => scheduleIdle(cb), ms);
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });
}
