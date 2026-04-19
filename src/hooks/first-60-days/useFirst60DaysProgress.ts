import { useCallback, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";

const LEGACY_KEY = "first-60-days-progress-v1";
const MIGRATION_FLAG = "first-60-days-migration-done";

export type ReflectionAnswers = Record<string, string>;

export type DayProgress = {
  readAt?: string;
  slidesViewedAt?: string;
  videoWatchedAt?: string;
  quizPassedAt?: string;
  quizScore?: number;
  quizAttempts?: number;
  reflectionAnswers?: ReflectionAnswers;
  reflectionSubmittedAt?: string;
};

type Row = {
  user_id: string;
  day_number: number;
  read_at: string | null;
  slides_viewed_at: string | null;
  video_watched_at: string | null;
  quiz_score: number | null;
  quiz_attempts: number;
  quiz_passed_at: string | null;
  reflection_answers: unknown;
  reflection_submitted_at: string | null;
  updated_at: string;
};

function coerceAnswers(raw: unknown): ReflectionAnswers | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: ReflectionAnswers = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function rowToDayProgress(row: Row): DayProgress {
  return {
    readAt: row.read_at ?? undefined,
    slidesViewedAt: row.slides_viewed_at ?? undefined,
    videoWatchedAt: row.video_watched_at ?? undefined,
    quizPassedAt: row.quiz_passed_at ?? undefined,
    quizScore: row.quiz_score ?? undefined,
    quizAttempts: row.quiz_attempts,
    reflectionAnswers: coerceAnswers(row.reflection_answers),
    reflectionSubmittedAt: row.reflection_submitted_at ?? undefined,
  };
}

async function fetchProgress(userId: string): Promise<Record<number, DayProgress>> {
  const { data, error } = await supabase
    .from("first_60_days_progress")
    .select("*")
    .eq("user_id", userId)
    .range(0, 99);
  if (error) throw error;
  const out: Record<number, DayProgress> = {};
  for (const row of (data ?? []) as Row[]) {
    out[row.day_number] = rowToDayProgress(row);
  }
  return out;
}

type LegacyShape = {
  startedAt?: string;
  days?: Record<number, Omit<DayProgress, "reflectionAnswers" | "reflectionSubmittedAt">>;
};

async function migrateLegacyIfNeeded(userId: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem(MIGRATION_FLAG) === "1") return false;
  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) {
    localStorage.setItem(MIGRATION_FLAG, "1");
    return false;
  }
  try {
    const parsed = JSON.parse(raw) as LegacyShape;
    const days = parsed.days ?? {};
    const rows = Object.entries(days)
      .filter(([, p]) => p && (p.readAt || p.quizPassedAt || p.quizScore !== undefined))
      .map(([dayStr, p]) => ({
        user_id: userId,
        day_number: Number(dayStr),
        read_at: p.readAt ?? null,
        slides_viewed_at: p.slidesViewedAt ?? null,
        video_watched_at: p.videoWatchedAt ?? null,
        quiz_score: p.quizScore ?? null,
        quiz_attempts: p.quizAttempts ?? 0,
        quiz_passed_at: p.quizPassedAt ?? null,
      }));
    if (rows.length > 0) {
      const { error } = await supabase
        .from("first_60_days_progress")
        .upsert(rows, { onConflict: "user_id,day_number" });
      if (error) throw error;
    }
    localStorage.removeItem(LEGACY_KEY);
    localStorage.setItem(MIGRATION_FLAG, "1");
    return true;
  } catch (err) {
    console.warn("First 60 Days legacy migration failed; will skip future attempts:", err);
    localStorage.setItem(MIGRATION_FLAG, "1");
    return false;
  }
}

export function useFirst60DaysProgress() {
  const { user } = useSimplifiedAuth();
  const qc = useQueryClient();
  const userId = user?.id ?? null;

  const progressQuery = useQuery({
    queryKey: ["first-60-days-progress", userId],
    queryFn: () => (userId ? fetchProgress(userId) : Promise.resolve({} as Record<number, DayProgress>)),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!userId) return;
    migrateLegacyIfNeeded(userId).then((didMigrate) => {
      if (didMigrate) qc.invalidateQueries({ queryKey: ["first-60-days-progress", userId] });
    });
  }, [userId, qc]);

  const daysMap = progressQuery.data ?? {};

  const upsertMutation = useMutation({
    mutationFn: async (input: {
      dayNumber: number;
      patch: Partial<{
        read_at: string | null;
        slides_viewed_at: string | null;
        video_watched_at: string | null;
        quiz_score: number | null;
        quiz_attempts: number;
        quiz_passed_at: string | null;
        reflection_answers: ReflectionAnswers | null;
        reflection_submitted_at: string | null;
      }>;
    }) => {
      if (!userId) throw new Error("Not signed in");
      const existing = daysMap[input.dayNumber] ?? {};
      const row = {
        user_id: userId,
        day_number: input.dayNumber,
        read_at: input.patch.read_at !== undefined ? input.patch.read_at : existing.readAt ?? null,
        slides_viewed_at:
          input.patch.slides_viewed_at !== undefined
            ? input.patch.slides_viewed_at
            : existing.slidesViewedAt ?? null,
        video_watched_at:
          input.patch.video_watched_at !== undefined
            ? input.patch.video_watched_at
            : existing.videoWatchedAt ?? null,
        quiz_score:
          input.patch.quiz_score !== undefined ? input.patch.quiz_score : existing.quizScore ?? null,
        quiz_attempts:
          input.patch.quiz_attempts !== undefined
            ? input.patch.quiz_attempts
            : existing.quizAttempts ?? 0,
        quiz_passed_at:
          input.patch.quiz_passed_at !== undefined
            ? input.patch.quiz_passed_at
            : existing.quizPassedAt ?? null,
        reflection_answers:
          input.patch.reflection_answers !== undefined
            ? input.patch.reflection_answers
            : existing.reflectionAnswers ?? null,
        reflection_submitted_at:
          input.patch.reflection_submitted_at !== undefined
            ? input.patch.reflection_submitted_at
            : existing.reflectionSubmittedAt ?? null,
      };
      const { error } = await supabase
        .from("first_60_days_progress")
        .upsert(row, { onConflict: "user_id,day_number" });
      if (error) throw error;
    },
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ["first-60-days-progress", userId] });
      const prev = qc.getQueryData<Record<number, DayProgress>>(["first-60-days-progress", userId]);
      qc.setQueryData<Record<number, DayProgress>>(["first-60-days-progress", userId], (old) => {
        const base = old ?? {};
        const existing = base[input.dayNumber] ?? {};
        const patched: DayProgress = {
          readAt:
            input.patch.read_at !== undefined
              ? input.patch.read_at ?? undefined
              : existing.readAt,
          slidesViewedAt:
            input.patch.slides_viewed_at !== undefined
              ? input.patch.slides_viewed_at ?? undefined
              : existing.slidesViewedAt,
          videoWatchedAt:
            input.patch.video_watched_at !== undefined
              ? input.patch.video_watched_at ?? undefined
              : existing.videoWatchedAt,
          quizPassedAt:
            input.patch.quiz_passed_at !== undefined
              ? input.patch.quiz_passed_at ?? undefined
              : existing.quizPassedAt,
          quizScore:
            input.patch.quiz_score !== undefined
              ? input.patch.quiz_score ?? undefined
              : existing.quizScore,
          quizAttempts:
            input.patch.quiz_attempts !== undefined
              ? input.patch.quiz_attempts
              : existing.quizAttempts,
          reflectionAnswers:
            input.patch.reflection_answers !== undefined
              ? input.patch.reflection_answers ?? undefined
              : existing.reflectionAnswers,
          reflectionSubmittedAt:
            input.patch.reflection_submitted_at !== undefined
              ? input.patch.reflection_submitted_at ?? undefined
              : existing.reflectionSubmittedAt,
        };
        return { ...base, [input.dayNumber]: patched };
      });
      return { prev };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.prev) qc.setQueryData(["first-60-days-progress", userId], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["first-60-days-progress", userId] });
    },
  });

  const getDay = useCallback(
    (dayNumber: number): DayProgress => daysMap[dayNumber] ?? {},
    [daysMap]
  );

  const isQuizPassed = useCallback(
    (dayNumber: number): boolean => Boolean(daysMap[dayNumber]?.quizPassedAt),
    [daysMap]
  );

  const isDayComplete = useCallback(
    (dayNumber: number): boolean => {
      const d = daysMap[dayNumber];
      if (!d) return false;
      return Boolean(d.quizPassedAt && d.reflectionSubmittedAt);
    },
    [daysMap]
  );

  const isUnlocked = useCallback(
    (dayNumber: number): boolean => {
      if (dayNumber <= 1) return true;
      return isDayComplete(dayNumber - 1);
    },
    [isDayComplete]
  );

  const currentDay = useCallback((): number => {
    for (let d = 1; d <= 60; d++) if (!isDayComplete(d)) return d;
    return 60;
  }, [isDayComplete]);

  const completedCount = useCallback((): number => {
    let n = 0;
    for (let d = 1; d <= 60; d++) if (isDayComplete(d)) n++;
    return n;
  }, [isDayComplete]);

  const markRead = useCallback(
    (dayNumber: number) => {
      if (!userId) return;
      if (daysMap[dayNumber]?.readAt) return;
      upsertMutation.mutate({
        dayNumber,
        patch: { read_at: new Date().toISOString() },
      });
    },
    [userId, daysMap, upsertMutation]
  );

  const saveReflection = useCallback(
    (dayNumber: number, answers: ReflectionAnswers, submit: boolean) => {
      if (!userId) return;
      const existing = daysMap[dayNumber] ?? {};
      upsertMutation.mutate({
        dayNumber,
        patch: {
          reflection_answers: answers,
          reflection_submitted_at: submit
            ? existing.reflectionSubmittedAt ?? new Date().toISOString()
            : existing.reflectionSubmittedAt ?? null,
        },
      });
    },
    [userId, daysMap, upsertMutation]
  );

  const isReflectionSubmitted = useCallback(
    (dayNumber: number): boolean => Boolean(daysMap[dayNumber]?.reflectionSubmittedAt),
    [daysMap]
  );

  const recordQuiz = useCallback(
    (dayNumber: number, score: number, passed: boolean) => {
      if (!userId) return;
      const existing = daysMap[dayNumber] ?? {};
      upsertMutation.mutate({
        dayNumber,
        patch: {
          quiz_score: score,
          quiz_attempts: (existing.quizAttempts ?? 0) + 1,
          quiz_passed_at: passed ? existing.quizPassedAt ?? new Date().toISOString() : existing.quizPassedAt ?? null,
        },
      });
    },
    [userId, daysMap, upsertMutation]
  );

  const reset = useCallback(async () => {
    if (!userId) return;
    const { error } = await supabase
      .from("first_60_days_progress")
      .delete()
      .eq("user_id", userId);
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ["first-60-days-progress", userId] });
  }, [userId, qc]);

  const progress = useMemo(() => ({ days: daysMap }), [daysMap]);

  return {
    progress,
    isLoading: progressQuery.isLoading,
    getDay,
    isQuizPassed,
    isReflectionSubmitted,
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
