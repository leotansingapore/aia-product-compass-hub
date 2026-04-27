import { useCallback, useEffect, useState } from "react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import type { DayProgress } from "@/hooks/first-60-days/useFirst60DaysProgress";

// LocalStorage-only v1 progress for Product Mastery Track. No DB round-trip,
// no unlock gating — every day is open. Quiz pass-state is tracked so the
// hub can show progress and the DayQuiz component receives a working
// QuizProgressAdapter without lifting the heavier first-60-days hook.

const STORAGE_PREFIX = "product-mastery-track-progress-";
const ANON_USER_KEY = "anon";

type Store = Record<number, DayProgress>;

function loadStore(userId: string): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + userId);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveStore(userId: string, store: Store) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + userId, JSON.stringify(store));
  } catch {
    // Quota or private-mode failures are non-fatal.
  }
}

export function useProductMasteryProgress() {
  const { user } = useSimplifiedAuth();
  const userId = user?.id ?? ANON_USER_KEY;
  const [store, setStore] = useState<Store>(() => loadStore(userId));

  useEffect(() => {
    setStore(loadStore(userId));
  }, [userId]);

  const recordQuiz = useCallback(
    (dayNumber: number, score: number, passed: boolean) => {
      setStore((prev) => {
        const existing = prev[dayNumber] ?? {};
        const updated: DayProgress = {
          ...existing,
          quizScore: score,
          quizAttempts: (existing.quizAttempts ?? 0) + 1,
          quizPassedAt: passed ? existing.quizPassedAt ?? new Date().toISOString() : existing.quizPassedAt,
        };
        const next = { ...prev, [dayNumber]: updated };
        saveStore(userId, next);
        return next;
      });
    },
    [userId],
  );

  const markRead = useCallback(
    (dayNumber: number) => {
      setStore((prev) => {
        const existing = prev[dayNumber] ?? {};
        if (existing.readAt) return prev;
        const updated: DayProgress = { ...existing, readAt: new Date().toISOString() };
        const next = { ...prev, [dayNumber]: updated };
        saveStore(userId, next);
        return next;
      });
    },
    [userId],
  );

  const getDay = useCallback((dayNumber: number) => store[dayNumber], [store]);
  const isQuizPassed = useCallback(
    (dayNumber: number) => Boolean(store[dayNumber]?.quizPassedAt),
    [store],
  );
  const isDayComplete = isQuizPassed; // No reflection on this track.

  return {
    recordQuiz,
    markRead,
    getDay,
    isQuizPassed,
    isDayComplete,
  };
}
