import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';

/**
 * Tracks which action-step ids a learner has ticked off for a specific lesson.
 *
 * Persistence is localStorage for v1 — swap to Supabase's `video_progress.
 * completed_action_step_ids text[]` once Lovable ships the column (see
 * SUPABASE.md). Matches the pattern in `useChecklistProgress`.
 *
 * Keying: `lesson-action-steps-<userId>-<productId>-<videoId>` → JSON array
 * of completed step ids. Scoped per user so admin-preview-as-user doesn't
 * leak across accounts.
 */
export function useLessonActionStepProgress(productId: string, videoId: string) {
  const { user } = useAuth();
  const storageKey = useMemo(() => {
    if (!user || !productId || !videoId) return null;
    return `lesson-action-steps-${user.id}-${productId}-${videoId}`;
  }, [user, productId, videoId]);

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  // Hydrate from localStorage whenever the key changes (user login, switching
  // lessons, etc.).
  useEffect(() => {
    if (!storageKey) {
      setCompletedIds(new Set());
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCompletedIds(new Set(parsed.filter((x): x is string => typeof x === 'string')));
          return;
        }
      }
    } catch {
      // Malformed JSON — reset silently rather than blowing up the lesson.
    }
    setCompletedIds(new Set());
  }, [storageKey]);

  // Persist on every change (no-op if unauthenticated or keys missing).
  const persist = useCallback(
    (next: Set<string>) => {
      if (!storageKey) return;
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      } catch {
        // Quota errors, privacy mode, etc. — fall through; state stays in
        // memory for this session even if we can't persist.
      }
    },
    [storageKey],
  );

  const toggleStep = useCallback(
    (stepId: string) => {
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (next.has(stepId)) next.delete(stepId);
        else next.add(stepId);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const isStepCompleted = useCallback(
    (stepId: string) => completedIds.has(stepId),
    [completedIds],
  );

  const allCompleted = useCallback(
    (stepIds: string[]) => stepIds.length === 0 || stepIds.every((id) => completedIds.has(id)),
    [completedIds],
  );

  const completedCount = completedIds.size;

  return {
    isStepCompleted,
    toggleStep,
    allCompleted,
    completedCount,
  };
}
