import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isChunkNamespaceError, isStaleChunkError } from "./staleChunkRecovery";

/**
 * Regression: production crash on /learning-track/pre-rnf/assignments —
 * "Cannot read properties of undefined (reading 'WelcomeModal')".
 *
 * A stale chunk after a deploy does not always reject. When the request for a
 * missing hashed asset falls through the SPA rewrite it returns index.html, and
 * when the chunk resolves without the expected export the caller's
 * `.then(m => ({ default: m.WelcomeModal }))` dereferences an undefined
 * namespace. Neither shape matched the fetch-only patterns, so
 * `lazyWithRetry` re-threw and the user was parked on the error boundary with
 * no automatic recovery.
 *
 * Found by /qa on 2026-08-05.
 * Report: .gstack/qa-reports/qa-report-academy-finternship-com-2026-08-05.md
 */
describe("stale chunk classification", () => {
  it("recognises the undefined-namespace TypeError as a chunk failure (Chrome)", () => {
    const err = new TypeError(
      "Cannot read properties of undefined (reading 'WelcomeModal')",
    );
    expect(isChunkNamespaceError(err)).toBe(true);
  });

  it("recognises the Safari phrasing of the same failure", () => {
    const err = new TypeError(
      "undefined is not an object (evaluating 't.WelcomeModal')",
    );
    expect(isChunkNamespaceError(err)).toBe(true);
  });

  it("recognises a null namespace as well as undefined", () => {
    const err = new TypeError("Cannot read properties of null (reading 'Foo')");
    expect(isChunkNamespaceError(err)).toBe(true);
  });

  it("treats an SPA-rewritten HTML asset (MIME refusal) as a stale chunk", () => {
    const err = new TypeError(
      "Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of text/html.",
    );
    expect(isStaleChunkError(err)).toBe(true);
  });

  it("still recognises the original fetch failure", () => {
    expect(
      isStaleChunkError(
        new TypeError("Failed to fetch dynamically imported module: /assets/x.js"),
      ),
    ).toBe(true);
  });

  it("does not classify an ordinary null-reference bug as a stale chunk", () => {
    // The global error listener calls isStaleChunkError on EVERY window error.
    // If this ever returned true, any null-reference bug in the app would
    // trigger a full page reload instead of surfacing.
    const err = new TypeError("Cannot read properties of undefined (reading 'id')");
    expect(isStaleChunkError(err)).toBe(false);
  });

  it("ignores unrelated rejections containing the word module", () => {
    expect(isStaleChunkError(new Error("module federation config invalid"))).toBe(false);
    expect(isChunkNamespaceError(new Error("module federation config invalid"))).toBe(false);
  });
});

describe("lazyWithRetry recovery path", () => {
  beforeEach(() => {
    vi.resetModules();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("retries the import when the namespace came back undefined, and succeeds", async () => {
    const { lazyWithRetry } = await import("./lazyWithRetry");
    const Component = () => null;
    let calls = 0;
    // Mirrors the real call site: import(...).then(m => ({ default: m.Foo }))
    const factory = () => {
      calls += 1;
      const ns: { Foo?: typeof Component } | undefined =
        calls === 1 ? undefined : { Foo: Component };
      return Promise.resolve().then(() => ({ default: ns!.Foo! }));
    };

    const Lazy = lazyWithRetry(factory) as unknown as {
      _payload: { _result: unknown };
      _init: (p: unknown) => unknown;
    };
    // React.lazy defers the factory until render; invoke the initializer the
    // same way React does, then wait for the retry to settle.
    try {
      Lazy._init(Lazy._payload);
    } catch (thenable) {
      await (thenable as Promise<unknown>).catch(() => {});
    }
    await new Promise((r) => setTimeout(r, 900));

    expect(calls).toBe(2);
  });
});
