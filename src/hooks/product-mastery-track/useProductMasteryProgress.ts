import { useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useAdmin } from "@/hooks/useAdmin";
import type { DayProgress } from "@/hooks/first-60-days/useFirst60DaysProgress";

// Supabase-backed progress for the Product Mastery Track. Mirrors the
// useFirst60DaysProgress shape (DayProgress map keyed by dayNumber) but
// without reflection or video fields — this track is read + quiz only.

const QUERY_KEY_PREFIX = "product-mastery-progress";
const LEGACY_LOCALSTORAGE_PREFIX = "product-mastery-track-progress-";
const MIGRATION_FLAG = "product-mastery-track-migration-done";
const PROGRESS_CACHE_PREFIX = "product-mastery-progress-cache-";

// Hydrating from localStorage lets the hub render lock/completion state on the
// first paint, before the Supabase round-trip resolves. Without this the day
// page momentarily believes the user has no progress and renders the lock
// screen pointing them back to the previous day.
function readCachedProgress(userId: string): Record<number, DayProgress> | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(PROGRESS_CACHE_PREFIX + userId);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return undefined;
    return parsed as Record<number, DayProgress>;
  } catch {
    return undefined;
  }
}

function writeCachedProgress(userId: string, data: Record<number, DayProgress>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROGRESS_CACHE_PREFIX + userId, JSON.stringify(data));
  } catch {
    // Quota / private-mode failures are non-fatal — server state is the truth.
  }
}

type Row = {
  user_id: string;
  day_number: number;
  read_at: string | null;
  quiz_score: number | null;
  quiz_attempts: number;
  quiz_passed_at: string | null;
  updated_at: string;
};

function rowToDayProgress(row: Row): DayProgress {
  return {
    readAt: row.read_at ?? undefined,
    quizScore: row.quiz_score ?? undefined,
    quizAttempts: row.quiz_attempts,
    quizPassedAt: row.quiz_passed_at ?? undefined,
  };
}

async function fetchProgress(userId: string): Promise<Record<number, DayProgress>> {
  const { data, error } = await supabase
    .from("product_mastery_progress")
    .select("user_id,day_number,read_at,quiz_score,quiz_attempts,quiz_passed_at,updated_at")
    .eq("user_id", userId);
  if (error) throw error;
  const out: Record<number, DayProgress> = {};
  for (const row of (data ?? []) as Row[]) {
    out[row.day_number] = rowToDayProgress(row);
  }
  return out;
}

// Migrate v1 localStorage progress into Supabase on first authenticated
// load. Only runs once per user/device — gated by MIGRATION_FLAG.
async function migrateLegacyIfNeeded(userId: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem(MIGRATION_FLAG) === "1") return false;
  const raw = localStorage.getItem(LEGACY_LOCALSTORAGE_PREFIX + userId);
  if (!raw) {
    localStorage.setItem(MIGRATION_FLAG, "1");
    return false;
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, DayProgress>;
    const rows = Object.entries(parsed)
      .filter(([, p]) => p && (p.readAt || p.quizPassedAt || p.quizScore !== undefined))
      .map(([dayStr, p]) => ({
        user_id: userId,
        day_number: Number(dayStr),
        read_at: p.readAt ?? null,
        quiz_score: p.quizScore ?? null,
        quiz_attempts: p.quizAttempts ?? 0,
        quiz_passed_at: p.quizPassedAt ?? null,
      }));
    if (rows.length > 0) {
      const { error } = await supabase
        .from("product_mastery_progress")
        .upsert(rows, { onConflict: "user_id,day_number" });
      if (error) throw error;
    }
    localStorage.removeItem(LEGACY_LOCALSTORAGE_PREFIX + userId);
    localStorage.setItem(MIGRATION_FLAG, "1");
    return true;
  } catch (err) {
    console.warn("Product Mastery legacy migration failed; will skip future attempts:", err);
    localStorage.setItem(MIGRATION_FLAG, "1");
    return false;
  }
}

export function useProductMasteryProgress() {
  const { user } = useSimplifiedAuth();
  const { isAdmin } = useAdmin();
  const isAdminUser = Boolean(isAdmin);
  const qc = useQueryClient();
  const userId = user?.id ?? null;

  const progressQuery = useQuery({
    queryKey: [QUERY_KEY_PREFIX, userId],
    queryFn: async () => {
      if (!userId) return {} as Record<number, DayProgress>;
      const data = await fetchProgress(userId);
      writeCachedProgress(userId, data);
      return data;
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    // Paint the hub immediately on revisits using the last-seen progress
    // snapshot, then let the refetch reconcile with Supabase.
    placeholderData: userId ? readCachedProgress(userId) : undefined,
  });

  useEffect(() => {
    if (!userId) return;
    migrateLegacyIfNeeded(userId).then((didMigrate) => {
      if (didMigrate) qc.invalidateQueries({ queryKey: [QUERY_KEY_PREFIX, userId] });
    });
  }, [userId, qc]);

  const daysMap = progressQuery.data ?? {};

  const upsertMutation = useMutation({
    // One retry covers the common Supabase token-rotation 401 window without
    // hammering on a real RLS/network failure.
    retry: 1,
    mutationFn: async (input: {
      dayNumber: number;
      patch: Partial<{
        read_at: string | null;
        quiz_score: number | null;
        quiz_attempts: number;
        quiz_passed_at: string | null;
      }>;
    }) => {
      if (!userId) throw new Error("Not signed in");
      const existing = daysMap[input.dayNumber] ?? {};
      const row = {
        user_id: userId,
        day_number: input.dayNumber,
        read_at: input.patch.read_at !== undefined ? input.patch.read_at : existing.readAt ?? null,
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
      };
      const { error } = await supabase
        .from("product_mastery_progress")
        .upsert(row, { onConflict: "user_id,day_number" });
      if (error) throw error;
      return row;
    },
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: [QUERY_KEY_PREFIX, userId] });
      const previous = qc.getQueryData<Record<number, DayProgress>>([QUERY_KEY_PREFIX, userId]);
      qc.setQueryData<Record<number, DayProgress>>([QUERY_KEY_PREFIX, userId], (old) => {
        const existing = old?.[input.dayNumber] ?? {};
        const next: DayProgress = {
          readAt:
            input.patch.read_at !== undefined ? input.patch.read_at ?? undefined : existing.readAt,
          quizScore:
            input.patch.quiz_score !== undefined
              ? input.patch.quiz_score ?? undefined
              : existing.quizScore,
          quizAttempts:
            input.patch.quiz_attempts !== undefined ? input.patch.quiz_attempts : existing.quizAttempts ?? 0,
          quizPassedAt:
            input.patch.quiz_passed_at !== undefined
              ? input.patch.quiz_passed_at ?? undefined
              : existing.quizPassedAt,
        };
        return { ...(old ?? {}), [input.dayNumber]: next };
      });
      return { previous };
    },
    onError: (err, _input, ctx) => {
      if (ctx?.previous) qc.setQueryData([QUERY_KEY_PREFIX, userId], ctx.previous);
      // Silent rollback would make the user think they'd passed, then the next
      // day shows locked. Surface it.
      const message = err instanceof Error ? err.message : "Couldn't save your progress";
      toast.error("Progress didn't save", {
        description: `${message}. Check your connection and try the quiz again — your last answer wasn't recorded.`,
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY_PREFIX, userId] });
      // Leaderboard pulls from the same RPC so re-fetch when progress changes.
      qc.invalidateQueries({ queryKey: ["learner-leaderboard"] });
      // Keep the localStorage snapshot in sync with the optimistic state so
      // the next cold load paints the right icons.
      if (userId) {
        const latest = qc.getQueryData<Record<number, DayProgress>>([
          QUERY_KEY_PREFIX,
          userId,
        ]);
        if (latest) writeCachedProgress(userId, latest);
      }
    },
  });

  const recordQuiz = useCallback(
    (dayNumber: number, score: number, passed: boolean) => {
      const existing = daysMap[dayNumber] ?? {};
      const nextAttempts = (existing.quizAttempts ?? 0) + 1;
      // Once a day is marked passed, keep the original passed-at timestamp.
      const passedAt = passed ? existing.quizPassedAt ?? new Date().toISOString() : existing.quizPassedAt ?? null;
      upsertMutation.mutate({
        dayNumber,
        patch: {
          quiz_score: score,
          quiz_attempts: nextAttempts,
          quiz_passed_at: passedAt,
        },
      });
    },
    [daysMap, upsertMutation],
  );

  const markRead = useCallback(
    (dayNumber: number) => {
      const existing = daysMap[dayNumber];
      if (existing?.readAt) return; // idempotent
      upsertMutation.mutate({
        dayNumber,
        patch: { read_at: new Date().toISOString() },
      });
    },
    [daysMap, upsertMutation],
  );

  const getDay = useCallback((dayNumber: number) => daysMap[dayNumber], [daysMap]);
  const isQuizPassed = useCallback(
    (dayNumber: number) => Boolean(daysMap[dayNumber]?.quizPassedAt),
    [daysMap],
  );
  const isDayComplete = isQuizPassed; // No reflection on this track.

  // Admins see everything. For everyone else: Day 1 of each week (1, 6, 11,
  // 16, 21, 26, 31) is always open so learners can sample any product
  // without grinding through prior weeks. Within a week, each subsequent
  // day still requires the previous day's quiz to be passed.
  const isUnlocked = useCallback(
    (dayNumber: number) => {
      if (isAdminUser) return true;
      if (dayNumber <= 1) return true;
      if (dayNumber % 5 === 1) return true; // first day of any week
      return Boolean(daysMap[dayNumber - 1]?.quizPassedAt);
    },
    [daysMap, isAdminUser],
  );

  return {
    recordQuiz,
    markRead,
    getDay,
    isQuizPassed,
    isDayComplete,
    isUnlocked,
    isAdminUser,
    isLoading: progressQuery.isLoading,
  };
}
