import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "first-60-days-progress-v1";

export type DayProgress = {
  readAt?: string;
  slidesViewedAt?: string;
  videoWatchedAt?: string;
  quizPassedAt?: string;
  quizScore?: number;
  quizAttempts?: number;
};

export type Progress = {
  startedAt?: string;
  days: Record<number, DayProgress>;
};

const EMPTY: Progress = { days: {} };

function load(): Progress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Progress;
    return { startedAt: parsed.startedAt, days: parsed.days ?? {} };
  } catch {
    return EMPTY;
  }
}

function save(progress: Progress) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // quota exceeded or private mode — progress is best-effort
  }
}

export function useFirst60DaysProgress() {
  const [progress, setProgress] = useState<Progress>(() => load());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setProgress(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((next: Progress) => {
    setProgress(next);
    save(next);
  }, []);

  const getDay = useCallback(
    (dayNumber: number): DayProgress => progress.days[dayNumber] ?? {},
    [progress]
  );

  const isQuizPassed = useCallback(
    (dayNumber: number): boolean => Boolean(progress.days[dayNumber]?.quizPassedAt),
    [progress]
  );

  const isUnlocked = useCallback(
    (dayNumber: number): boolean => {
      if (dayNumber <= 1) return true;
      return isQuizPassed(dayNumber - 1);
    },
    [isQuizPassed]
  );

  const currentDay = useCallback((): number => {
    for (let d = 1; d <= 60; d++) {
      if (!isQuizPassed(d)) return d;
    }
    return 60;
  }, [isQuizPassed]);

  const completedCount = useCallback((): number => {
    let n = 0;
    for (let d = 1; d <= 60; d++) if (isQuizPassed(d)) n++;
    return n;
  }, [isQuizPassed]);

  const markRead = useCallback(
    (dayNumber: number) => {
      const day = progress.days[dayNumber] ?? {};
      if (day.readAt) return;
      const next: Progress = {
        ...progress,
        startedAt: progress.startedAt ?? new Date().toISOString(),
        days: { ...progress.days, [dayNumber]: { ...day, readAt: new Date().toISOString() } },
      };
      update(next);
    },
    [progress, update]
  );

  const recordQuiz = useCallback(
    (dayNumber: number, score: number, passed: boolean) => {
      const day = progress.days[dayNumber] ?? {};
      const next: Progress = {
        ...progress,
        startedAt: progress.startedAt ?? new Date().toISOString(),
        days: {
          ...progress.days,
          [dayNumber]: {
            ...day,
            quizScore: score,
            quizAttempts: (day.quizAttempts ?? 0) + 1,
            quizPassedAt: passed ? day.quizPassedAt ?? new Date().toISOString() : day.quizPassedAt,
          },
        },
      };
      update(next);
    },
    [progress, update]
  );

  const reset = useCallback(() => {
    update(EMPTY);
  }, [update]);

  return {
    progress,
    getDay,
    isQuizPassed,
    isUnlocked,
    currentDay,
    completedCount,
    markRead,
    recordQuiz,
    reset,
  };
}
