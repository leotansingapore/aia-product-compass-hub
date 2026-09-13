// Deliberately free of any @sentry import: main.tsx pulls this in statically,
// and the SDK (~50kB gzip) is fetched only after the page has loaded,
// from ./sentry. That file says what is and is not collected.
const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

export function bootErrorReporting(): void {
  if (!import.meta.env.PROD || !dsn) return;

  // Anything that throws before the SDK is in would otherwise go unreported.
  // Hold up to five here and replay them once init has run.
  const pending: unknown[] = [];
  let ready = false;
  const record = (error: unknown) => {
    if (!ready && pending.length < 5) pending.push(error);
  };
  window.addEventListener('unhandledrejection', (event) => record(event.reason));
  window.addEventListener('error', (event) => record(event.error ?? event.message));

  const start = () => {
    void import('./sentry').then((m) => {
      m.initSentry(pending);
      ready = true;
      pending.length = 0;
    });
  };
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
}
