import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

/**
 * TEMPLATE DOM TEST — copy this shape for future component tests.
 *
 * Why this component: ErrorBoundary needs NO providers (no Supabase client,
 * no auth session, no QueryClient, no Router), so it exercises the RTL setup
 * end to end without any deep mocking. Components that need
 * SimplifiedAuthProvider / QueryClientProvider / Supabase session should be
 * tested at their logic core instead (see playbookItemContent.test.ts) until
 * a shared test-provider wrapper exists.
 *
 * Pattern demonstrated:
 *   1. render(<Component />)
 *   2. assert the user-visible state by ROLE + accessible name, not by class
 *   3. drive the interaction with fireEvent (RTL ships it; @testing-library/
 *      user-event is deliberately NOT a dependency of this repo)
 *   4. assert the state actually changed
 *
 * Locks the E1 error-state expectation: a crashed section shows an error card
 * with a working "Try again" affordance instead of a blank screen.
 */

/** A child that throws on demand, then stops after a retry. */
function Boom({ throwNow }: { throwNow: boolean }) {
  if (throwNow) throw new Error("Kaboom from the child");
  return <div>Child rendered fine</div>;
}

/** Lets a test flip the child from throwing to healthy before clicking Retry. */
function Harness() {
  const [broken, setBroken] = useState(true);
  return (
    <>
      <button onClick={() => setBroken(false)}>Heal child</button>
      <ErrorBoundary>
        <Boom throwNow={broken} />
      </ErrorBoundary>
    </>
  );
}

describe("ErrorBoundary (DOM template)", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;
  // React 18 rethrows a caught render error as a window "error" event, which
  // jsdom's virtual console then dumps to stderr. Swallow it so a PASSING
  // test doesn't print a wall of red. Reuse this pair in any test that
  // deliberately throws during render.
  const swallow = (e: ErrorEvent) => e.preventDefault();

  beforeEach(() => {
    // React logs caught render errors; componentDidCatch logs too.
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    window.addEventListener("error", swallow);
  });

  afterEach(() => {
    window.removeEventListener("error", swallow);
    consoleError.mockRestore();
  });

  it("renders children untouched when nothing throws", () => {
    render(
      <ErrorBoundary>
        <Boom throwNow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Child rendered fine")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /try again/i })).not.toBeInTheDocument();
  });

  it("shows an error card with the thrown message and a Try again / Reload page pair", () => {
    render(
      <ErrorBoundary>
        <Boom throwNow />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Kaboom from the child")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reload page/i })).toBeInTheDocument();
    // The broken subtree must be gone, not left half-rendered.
    expect(screen.queryByText("Child rendered fine")).not.toBeInTheDocument();
  });

  it("names the failing section when sectionName is given", () => {
    render(
      <ErrorBoundary sectionName="Sales Flows">
        <Boom throwNow />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Error in Sales Flows")).toBeInTheDocument();
  });

  it("falls back to a generic message when the error has none", () => {
    function Silent(): never {
      throw new Error("");
    }
    render(
      <ErrorBoundary>
        <Silent />
      </ErrorBoundary>,
    );
    expect(screen.getByText("An unexpected error occurred.")).toBeInTheDocument();
  });

  it("Try again re-renders the children once the underlying cause is gone", () => {
    render(<Harness />);

    expect(screen.getByText("Kaboom from the child")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /heal child/i }));
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(screen.getByText("Child rendered fine")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /try again/i })).not.toBeInTheDocument();
  });

  it("calls onError with the thrown error so callers can report it", () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <Boom throwNow />
      </ErrorBoundary>,
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect((onError.mock.calls[0][0] as Error).message).toBe("Kaboom from the child");
  });

  it("renders a custom fallback instead of the default card when one is provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <Boom throwNow />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Custom fallback")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });
});
