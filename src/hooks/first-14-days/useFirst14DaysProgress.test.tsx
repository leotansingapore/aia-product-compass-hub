import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useFirst14DaysProgress } from "./useFirst14DaysProgress";

const STORAGE_KEY = "first-14-days-progress-v1";

beforeEach(() => {
  window.localStorage.removeItem(STORAGE_KEY);
});

describe("useFirst14DaysProgress — unlock gating", () => {
  it("unlocks only Day 1 on first load", () => {
    const { result } = renderHook(() => useFirst14DaysProgress());
    expect(result.current.isUnlocked(1)).toBe(true);
    for (let d = 2; d <= 14; d++) {
      expect(result.current.isUnlocked(d)).toBe(false);
    }
    expect(result.current.completedCount()).toBe(0);
  });

  it("unlocks Day N+1 only after Day N quiz is passed", () => {
    const { result } = renderHook(() => useFirst14DaysProgress());
    expect(result.current.isUnlocked(2)).toBe(false);

    act(() => {
      result.current.recordQuiz(1, 100, true);
    });
    expect(result.current.isDayComplete(1)).toBe(true);
    expect(result.current.isUnlocked(2)).toBe(true);
    expect(result.current.isUnlocked(3)).toBe(false);

    act(() => {
      result.current.recordQuiz(2, 66, false);
    });
    expect(result.current.isDayComplete(2)).toBe(false);
    expect(result.current.isUnlocked(3)).toBe(false);

    act(() => {
      result.current.recordQuiz(2, 100, true);
    });
    expect(result.current.isDayComplete(2)).toBe(true);
    expect(result.current.isUnlocked(3)).toBe(true);
  });

  it("persists progress across hook unmounts via localStorage", () => {
    const first = renderHook(() => useFirst14DaysProgress());
    act(() => {
      first.result.current.recordQuiz(1, 100, true);
    });
    first.unmount();

    const second = renderHook(() => useFirst14DaysProgress());
    expect(second.result.current.isDayComplete(1)).toBe(true);
    expect(second.result.current.isUnlocked(2)).toBe(true);
    expect(second.result.current.completedCount()).toBe(1);
  });

  it("reset() clears all progress", () => {
    const { result } = renderHook(() => useFirst14DaysProgress());
    act(() => {
      result.current.recordQuiz(1, 100, true);
      result.current.recordQuiz(2, 100, true);
    });
    expect(result.current.completedCount()).toBe(2);

    act(() => {
      result.current.reset();
    });
    expect(result.current.completedCount()).toBe(0);
    expect(result.current.isUnlocked(2)).toBe(false);
  });
});
