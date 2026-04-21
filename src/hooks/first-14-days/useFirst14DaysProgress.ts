import { useCallback, useEffect, useMemo, useState } from "react";
import { TOTAL_DAYS } from "@/features/first-14-days/summaries";

const STORAGE_KEY = "first-14-days-progress-v1";

export type ReflectionAnswers = Record<string, string>;

export type DayProgress = {
  readAt?: string;
  quizPassedAt?: string;
  quizScore?: number;
  quizAttempts?: number;
  reflectionAnswers?: ReflectionAnswers;
  reflectionSavedAt?: string;
};

type Snapshot = {
  startedAt?: string;
  days: Record<number, DayProgress>;
};

function loadSnapshot(): Snapshot {
  if (typeof window === "undefined") return { days: {} };
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return { days: {} };
  try {
    const parsed = JSON.parse(raw) as Snapshot;
    if (!parsed || typeof parsed !== "object" || !parsed.days) return { days: {} };
    return parsed;
  } catch {
    return { days: {} };
  }
}

function saveSnapshot(snapshot: Snapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

/**
 * Progress hook for Your First 14 Days — prospect-facing course.
 * Stored in localStorage (no unlock gating, no submission — self-paced).
 */
export function useFirst14DaysProgress() {
  const [snapshot, setSnapshot] = useState<Snapshot>(() => loadSnapshot());

  useEffect(() => {
    saveSnapshot(snapshot);
  }, [snapshot]);

  const daysMap = snapshot.days ?? {};

  const getDay = useCallback(
    (dayNumber: number): DayProgress => daysMap[dayNumber] ?? {},
    [daysMap],
  );

  const isQuizPassed = useCallback(
    (dayNumber: number): boolean => Boolean(daysMap[dayNumber]?.quizPassedAt),
    [daysMap],
  );

  const isDayComplete = useCallback(
    (dayNumber: number): boolean => {
      const d = daysMap[dayNumber];
      if (!d) return false;
      // A day is complete when its quiz is passed. Worksheet is self-reflective
      // and doesn't gate progression.
      return Boolean(d.quizPassedAt);
    },
    [daysMap],
  );

  // Gated: Day 1 is always open; Day N unlocks when Day N-1's quiz is passed.
  const isUnlocked = useCallback(
    (dayNumber: number): boolean => {
      if (dayNumber <= 1) return true;
      return isDayComplete(dayNumber - 1);
    },
    [isDayComplete],
  );

  const currentDay = useCallback((): number => {
    for (let d = 1; d <= TOTAL_DAYS; d++) if (!isDayComplete(d)) return d;
    return TOTAL_DAYS;
  }, [isDayComplete]);

  const completedCount = useCallback((): number => {
    let n = 0;
    for (let d = 1; d <= TOTAL_DAYS; d++) if (isDayComplete(d)) n++;
    return n;
  }, [isDayComplete]);

  const updateDay = useCallback(
    (dayNumber: number, patch: Partial<DayProgress>) => {
      setSnapshot((prev) => {
        const prevDays = prev.days ?? {};
        const existing = prevDays[dayNumber] ?? {};
        return {
          startedAt: prev.startedAt ?? new Date().toISOString(),
          days: {
            ...prevDays,
            [dayNumber]: { ...existing, ...patch },
          },
        };
      });
    },
    [],
  );

  const markRead = useCallback(
    (dayNumber: number) => {
      if (daysMap[dayNumber]?.readAt) return;
      updateDay(dayNumber, { readAt: new Date().toISOString() });
    },
    [daysMap, updateDay],
  );

  const recordQuiz = useCallback(
    (dayNumber: number, score: number, passed: boolean) => {
      const existing = daysMap[dayNumber] ?? {};
      updateDay(dayNumber, {
        quizScore: score,
        quizAttempts: (existing.quizAttempts ?? 0) + 1,
        quizPassedAt: passed ? existing.quizPassedAt ?? new Date().toISOString() : existing.quizPassedAt,
      });
    },
    [daysMap, updateDay],
  );

  const saveReflection = useCallback(
    (dayNumber: number, answers: ReflectionAnswers) => {
      updateDay(dayNumber, {
        reflectionAnswers: answers,
        reflectionSavedAt: new Date().toISOString(),
      });
    },
    [updateDay],
  );

  const reset = useCallback(() => {
    setSnapshot({ days: {} });
  }, []);

  const progress = useMemo(() => ({ days: daysMap }), [daysMap]);

  return {
    progress,
    isLoading: false,
    getDay,
    isQuizPassed,
    isDayComplete,
    isUnlocked,
    currentDay,
    completedCount,
    markRead,
    recordQuiz,
    saveReflection,
    reset,
  };
}
