/**
 * Progress tracking for First 30 Days (Post-RNF).
 *
 * Uses localStorage until the `first_30_days_progress` Supabase table is created.
 * Once the table exists, swap localStorage calls for supabase upserts (same
 * pattern as `useFirst60DaysProgress`).
 */
import { useCallback, useMemo, useState, useEffect } from "react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { TOTAL_DAYS, DAY_SUMMARIES, DAYS_WITH_REFLECTION } from "@/features/first-30-days/summaries";

const STORAGE_KEY = "first-30-days-progress-v1";

export type ReflectionAnswers = Record<string, string>;

export type DayProgress = {
  readAt?: string;
  quizPassedAt?: string;
  quizScore?: number;
  quizAttempts?: number;
  reflectionAnswers?: ReflectionAnswers;
  reflectionSubmittedAt?: string;
};

type ProgressMap = Record<number, DayProgress>;

function loadFromStorage(userId: string): ProgressMap {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToStorage(userId: string, data: ProgressMap) {
  localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify(data));
}

export function useFirst30DaysProgress() {
  const { user } = useSimplifiedAuth();
  const { isAdmin, isMasterAdmin } = usePermissions();
  const userId = user?.id ?? null;
  const adminBypass = isAdmin() || isMasterAdmin();

  const [daysMap, setDaysMap] = useState<ProgressMap>({});

  useEffect(() => {
    if (userId) setDaysMap(loadFromStorage(userId));
    else setDaysMap({});
  }, [userId]);

  const persist = useCallback(
    (next: ProgressMap) => {
      setDaysMap(next);
      if (userId) saveToStorage(userId, next);
    },
    [userId],
  );

  const getDay = useCallback((dayNumber: number) => daysMap[dayNumber], [daysMap]);

  const isDayComplete = useCallback(
    (dayNumber: number) => {
      const p = daysMap[dayNumber];
      if (!p) return false;
      if (!p.quizPassedAt) return false;
      if (DAYS_WITH_REFLECTION.has(dayNumber) && !p.reflectionSubmittedAt) return false;
      return true;
    },
    [daysMap],
  );

  const isUnlocked = useCallback(
    (dayNumber: number) => {
      if (adminBypass) return true;
      if (dayNumber <= 1) return true;
      return isDayComplete(dayNumber - 1);
    },
    [isDayComplete, adminBypass],
  );

  const currentDay = useCallback(() => {
    for (let d = 1; d <= TOTAL_DAYS; d++) {
      if (!isDayComplete(d)) return d;
    }
    return TOTAL_DAYS;
  }, [isDayComplete]);

  const completedCount = useCallback(() => {
    let count = 0;
    for (let d = 1; d <= TOTAL_DAYS; d++) {
      if (isDayComplete(d)) count++;
    }
    return count;
  }, [isDayComplete]);

  const markRead = useCallback(
    (dayNumber: number) => {
      const next = { ...daysMap };
      next[dayNumber] = { ...next[dayNumber], readAt: next[dayNumber]?.readAt ?? new Date().toISOString() };
      persist(next);
    },
    [daysMap, persist],
  );

  const recordQuiz = useCallback(
    (dayNumber: number, score: number, passed: boolean) => {
      const existing = daysMap[dayNumber] ?? {};
      const next = { ...daysMap };
      next[dayNumber] = {
        ...existing,
        quizScore: score,
        quizAttempts: (existing.quizAttempts ?? 0) + 1,
        quizPassedAt: passed ? existing.quizPassedAt ?? new Date().toISOString() : existing.quizPassedAt,
      };
      persist(next);
    },
    [daysMap, persist],
  );

  const saveReflection = useCallback(
    (dayNumber: number, answers: ReflectionAnswers, submit: boolean) => {
      const existing = daysMap[dayNumber] ?? {};
      const next = { ...daysMap };
      next[dayNumber] = {
        ...existing,
        reflectionAnswers: answers,
        reflectionSubmittedAt: submit ? new Date().toISOString() : existing.reflectionSubmittedAt,
      };
      persist(next);
    },
    [daysMap, persist],
  );

  const isQuizPassed = useCallback((dayNumber: number) => !!daysMap[dayNumber]?.quizPassedAt, [daysMap]);
  const isReflectionSubmitted = useCallback((dayNumber: number) => !!daysMap[dayNumber]?.reflectionSubmittedAt, [daysMap]);

  return useMemo(
    () => ({
      isLoading: false,
      getDay,
      isDayComplete,
      isQuizPassed,
      isReflectionSubmitted,
      isUnlocked,
      currentDay,
      completedCount,
      markRead,
      recordQuiz,
      saveReflection,
      totalDays: TOTAL_DAYS,
    }),
    [getDay, isDayComplete, isQuizPassed, isReflectionSubmitted, isUnlocked, currentDay, completedCount, markRead, recordQuiz, saveReflection],
  );
}
