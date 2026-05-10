import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useFirst14DaysProgress } from "./useFirst14DaysProgress";

/**
 * These tests originally exercised an older version of the hook that wrote
 * progress to localStorage directly. The hook has since been migrated to
 * Supabase (every write goes through `upsertMutation.mutate` against
 * `first_14_days_progress`, and `if (!userId) return;` short-circuits every
 * mutator when there's no signed-in user — including `recordQuiz`, `saveReflection`,
 * and `reset`).
 *
 * The localStorage key is now only consulted for one-shot legacy migration
 * on first sign-in (see `migrateLegacyIfNeeded`).
 *
 * What the tests below cover today:
 *   - The hook mounts cleanly in a no-auth context (the only case that uses
 *     pure React Query + no network).
 *   - `isUnlocked(1)` defaults to true (Day 1 is always open for prospects).
 *   - All other days are locked until progress data unlocks them, which now
 *     requires a Supabase round-trip we deliberately don't simulate here.
 *
 * A full integration test against a mocked Supabase upsert chain would need
 * to model the optimistic update + query invalidation cycle, which is more
 * useful as an e2e Playwright test than a unit test. Tracked as a follow-up.
 */

vi.mock("@/hooks/useSimplifiedAuth", () => ({
  useSimplifiedAuth: () => ({ user: null }),
}));
vi.mock("@/hooks/useAdmin", () => ({
  useAdmin: () => ({ isActualAdmin: false }),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
      upsert: () => Promise.resolve({ data: null, error: null }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
    }),
  },
}));

const STORAGE_KEY = "first-14-days-progress-v1";

beforeEach(() => {
  window.localStorage.removeItem(STORAGE_KEY);
});

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("useFirst14DaysProgress — unauthenticated boot", () => {
  it("mounts without throwing when there's no signed-in user", () => {
    const { result } = renderHook(() => useFirst14DaysProgress(), { wrapper });
    expect(result.current).toBeTruthy();
    expect(typeof result.current.isUnlocked).toBe("function");
    expect(typeof result.current.isDayComplete).toBe("function");
    expect(typeof result.current.completedCount).toBe("function");
    expect(typeof result.current.recordQuiz).toBe("function");
  });

  it("Day 1 is unlocked by default; days 2–14 are locked until progress comes back from Supabase", () => {
    const { result } = renderHook(() => useFirst14DaysProgress(), { wrapper });
    expect(result.current.isUnlocked(1)).toBe(true);
    for (let d = 2; d <= 14; d++) {
      expect(result.current.isUnlocked(d)).toBe(false);
    }
    expect(result.current.completedCount()).toBe(0);
  });

  it("recordQuiz / reset are no-ops without auth — guards against accidental anonymous writes", () => {
    const { result } = renderHook(() => useFirst14DaysProgress(), { wrapper });
    // Calling these without a user should not throw and should leave state untouched.
    act(() => {
      result.current.recordQuiz(1, 100, true);
      result.current.recordQuiz(2, 100, true);
    });
    expect(result.current.completedCount()).toBe(0);
    expect(result.current.isDayComplete(1)).toBe(false);
    expect(result.current.isUnlocked(2)).toBe(false);
  });
});
