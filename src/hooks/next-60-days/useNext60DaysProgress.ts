import { useCallback, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { TOTAL_DAYS, DAYS_WITH_REFLECTION } from "@/features/next-60-days/summaries";

const LEGACY_KEY = "next-60-days-progress-v1";
const LEGACY_KEY_OLDER = "first-30-days-progress-v1";
const MIGRATION_FLAG = "next-60-days-migration-done";

export type ReflectionAnswers = Record<string, string>;

export type DayProgress = {
  readAt?: string;
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
    quizPassedAt: row.quiz_passed_at ?? undefined,
    quizScore: row.quiz_score ?? undefined,
    quizAttempts: row.quiz_attempts,
    reflectionAnswers: coerceAnswers(row.reflection_answers),
    reflectionSubmittedAt: row.reflection_submitted_at ?? undefined,
  };
}

async function fetchProgress(userId: string): Promise<Record<number, DayProgress>> {
  const { data, error } = await (supabase.from as any)("next_60_days_progress")
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

type LegacyShape = Record<number, DayProgress>;

async function migrateLegacyIfNeeded(userId: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem(MIGRATION_FLAG) === "1") return false;
  // The localStorage keys were per-user (suffixed) in the older hook. Try both
  // key shapes (and the older `first-30-days-progress-v1` legacy key) so any
  // learner who started on either platform doesn't lose progress.
  const candidates = [
    localStorage.getItem(`${LEGACY_KEY}-${userId}`),
    localStorage.getItem(`${LEGACY_KEY_OLDER}-${userId}`),
    localStorage.getItem(LEGACY_KEY),
    localStorage.getItem(LEGACY_KEY_OLDER),
  ].filter(Boolean) as string[];
  if (candidates.length === 0) {
    localStorage.setItem(MIGRATION_FLAG, "1");
    return false;
  }
  try {
    // Merge across candidates: highest progress per day wins.
    const merged: LegacyShape = {};
    for (const raw of candidates) {
      const parsed = JSON.parse(raw) as LegacyShape;
      for (const [k, v] of Object.entries(parsed ?? {})) {
        const dayNumber = Number(k);
        if (!Number.isFinite(dayNumber) || !v) continue;
        const existing = merged[dayNumber] ?? {};
        merged[dayNumber] = {
          readAt: existing.readAt ?? v.readAt,
          quizPassedAt: existing.quizPassedAt ?? v.quizPassedAt,
          quizScore: existing.quizScore ?? v.quizScore,
          quizAttempts: Math.max(existing.quizAttempts ?? 0, v.quizAttempts ?? 0),
          reflectionAnswers: existing.reflectionAnswers ?? v.reflectionAnswers,
          reflectionSubmittedAt: existing.reflectionSubmittedAt ?? v.reflectionSubmittedAt,
        };
      }
    }
    const rows = Object.entries(merged)
      .filter(([, p]) => p && (p.readAt || p.quizPassedAt || p.quizScore !== undefined || p.reflectionAnswers))
      .map(([dayStr, p]) => ({
        user_id: userId,
        day_number: Number(dayStr),
        read_at: p.readAt ?? null,
        quiz_score: p.quizScore ?? null,
        quiz_attempts: p.quizAttempts ?? 0,
        quiz_passed_at: p.quizPassedAt ?? null,
        reflection_answers: p.reflectionAnswers ?? null,
        reflection_submitted_at: p.reflectionSubmittedAt ?? null,
      }));
    if (rows.length > 0) {
      const { error } = await (supabase.from as any)("next_60_days_progress")
        .upsert(rows, { onConflict: "user_id,day_number" });
      if (error) throw error;
    }
    // Clear the legacy keys so we don't re-read them.
    localStorage.removeItem(`${LEGACY_KEY}-${userId}`);
    localStorage.removeItem(`${LEGACY_KEY_OLDER}-${userId}`);
    localStorage.removeItem(LEGACY_KEY);
    localStorage.removeItem(LEGACY_KEY_OLDER);
    localStorage.setItem(MIGRATION_FLAG, "1");
    return true;
  } catch (err) {
    console.warn("Next 60 Days legacy migration failed; will skip future attempts:", err);
    localStorage.setItem(MIGRATION_FLAG, "1");
    return false;
  }
}

export function useNext60DaysProgress() {
  const { user } = useSimplifiedAuth();
  const { isAdmin, isMasterAdmin } = usePermissions();
  const qc = useQueryClient();
  const userId = user?.id ?? null;
  const adminBypass = isAdmin() || isMasterAdmin();

  const progressQuery = useQuery({
    queryKey: ["next-60-days-progress", userId],
    queryFn: () => (userId ? fetchProgress(userId) : Promise.resolve({} as Record<number, DayProgress>)),
    enabled: Boolean(userId),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (!userId) return;
    migrateLegacyIfNeeded(userId).then((didMigrate) => {
      if (didMigrate) qc.invalidateQueries({ queryKey: ["next-60-days-progress", userId] });
    });
  }, [userId, qc]);

  const daysMap = progressQuery.data ?? {};

  const upsertMutation = useMutation({
    mutationFn: async (input: {
      dayNumber: number;
      patch: Partial<{
        read_at: string | null;
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
        read_at:
          input.patch.read_at !== undefined ? input.patch.read_at : existing.readAt ?? null,
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
      const { error } = await (supabase.from as any)("next_60_days_progress")
        .upsert(row, { onConflict: "user_id,day_number" });
      if (error) throw error;
    },
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ["next-60-days-progress", userId] });
      const prev = qc.getQueryData<Record<number, DayProgress>>(["next-60-days-progress", userId]);
      qc.setQueryData<Record<number, DayProgress>>(["next-60-days-progress", userId], (old) => {
        const base = old ?? {};
        const existing = base[input.dayNumber] ?? {};
        const patched: DayProgress = {
          readAt:
            input.patch.read_at !== undefined ? input.patch.read_at ?? undefined : existing.readAt,
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
      if (ctx?.prev) qc.setQueryData(["next-60-days-progress", userId], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["next-60-days-progress", userId] });
    },
  });

  const getDay = useCallback(
    (dayNumber: number): DayProgress => daysMap[dayNumber] ?? {},
    [daysMap],
  );

  const isQuizPassed = useCallback(
    (dayNumber: number): boolean => Boolean(daysMap[dayNumber]?.quizPassedAt),
    [daysMap],
  );

  const isReflectionSubmitted = useCallback(
    (dayNumber: number): boolean => Boolean(daysMap[dayNumber]?.reflectionSubmittedAt),
    [daysMap],
  );

  const isDayComplete = useCallback(
    (dayNumber: number): boolean => {
      const d = daysMap[dayNumber];
      if (!d) return false;
      if (!d.quizPassedAt) return false;
      if (DAYS_WITH_REFLECTION.has(dayNumber) && !d.reflectionSubmittedAt) return false;
      return true;
    },
    [daysMap],
  );

  const isUnlocked = useCallback(
    (dayNumber: number): boolean => {
      if (adminBypass) return true;
      if (dayNumber <= 1) return true;
      return isDayComplete(dayNumber - 1);
    },
    [adminBypass, isDayComplete],
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

  const markRead = useCallback(
    (dayNumber: number) => {
      if (!userId) return;
      if (daysMap[dayNumber]?.readAt) return;
      upsertMutation.mutate({
        dayNumber,
        patch: { read_at: new Date().toISOString() },
      });
    },
    [userId, daysMap, upsertMutation],
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
    [userId, daysMap, upsertMutation],
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
    [userId, daysMap, upsertMutation],
  );

  const markDayCompleteAsAdmin = useCallback(
    (dayNumber: number) => {
      if (!userId || !adminBypass) return;
      const existing = daysMap[dayNumber] ?? {};
      const now = new Date().toISOString();
      const patch: Parameters<typeof upsertMutation.mutate>[0]["patch"] = {
        quiz_passed_at: existing.quizPassedAt ?? now,
        quiz_score: existing.quizScore ?? 100,
        quiz_attempts: existing.quizAttempts ?? 1,
      };
      if (DAYS_WITH_REFLECTION.has(dayNumber)) {
        patch.reflection_submitted_at = existing.reflectionSubmittedAt ?? now;
      }
      upsertMutation.mutate({ dayNumber, patch });
    },
    [userId, adminBypass, daysMap, upsertMutation],
  );

  const unmarkDayCompleteAsAdmin = useCallback(
    (dayNumber: number) => {
      if (!userId || !adminBypass) return;
      upsertMutation.mutate({
        dayNumber,
        patch: { quiz_passed_at: null, reflection_submitted_at: null },
      });
    },
    [userId, adminBypass, upsertMutation],
  );

  return useMemo(
    () => ({
      isLoading: progressQuery.isLoading,
      isActualAdmin: adminBypass,
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
      markDayCompleteAsAdmin,
      unmarkDayCompleteAsAdmin,
      totalDays: TOTAL_DAYS,
    }),
    [
      progressQuery.isLoading,
      adminBypass,
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
      markDayCompleteAsAdmin,
      unmarkDayCompleteAsAdmin,
    ],
  );
}
