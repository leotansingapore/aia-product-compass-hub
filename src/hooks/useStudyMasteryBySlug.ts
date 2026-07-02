import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllRows } from '@/lib/fetchAllRows';
import { useAuth } from '@/hooks/useAuth';

/** Must match `QUESTION_MASTERY_STREAK` in `useQuestionProgress.tsx`. */
const MASTERY_STREAK = 2;

/** React Query key — invalidate from `recordAnswer` so Question Banks stays in sync. */
export function studyMasteryBySlugQueryKey(userId: string | undefined) {
  return ['study-mastery-by-slug', userId] as const;
}

export type StudyMasterySummary = {
  /** Study-bank questions with `mastered` in DB (2 consecutive correct). */
  mastered: number;
  /** Same formula as ProductStudyPage: streak points / (study count × streak). */
  progressPercent: number;
};

/**
 * Per-product study-bank mastery for Question Banks cards.
 * Uses only `bank_type = study` question IDs so exam progress does not skew the bar.
 */
export function useStudyMasteryBySlug() {
  const { user } = useAuth();
  return useQuery({
    queryKey: studyMasteryBySlugQueryKey(user?.id),
    queryFn: async (): Promise<Record<string, StudyMasterySummary>> => {
      if (!user?.id) return {};

      // Query user's progress rows directly by product_slug (no question_id join).
      // This is resilient to question bank re-seeding — mastery survives even if
      // question IDs change, because progress rows carry their own product_slug.
      // Both tables can exceed the server's 1,000-row response cap (one
      // progress row per question per user; ~1,400 study questions) — page
      // through instead of a single capped .range(0, 9999).
      const [progressRows, studyCountRows] = await Promise.all([
        fetchAllRows<{ product_slug: string; mastered: boolean; consecutive_correct: number }>((from, to) =>
          supabase
            .from('user_question_progress')
            .select('question_id, product_slug, mastered, consecutive_correct')
            .eq('user_id', user.id)
            .order('question_id')
            .range(from, to),
        ),
        fetchAllRows<{ product_slug: string }>((from, to) =>
          supabase
            .from('question_bank_questions' as never)
            .select('id, product_slug')
            .eq('bank_type', 'study')
            .order('id')
            .range(from, to),
        ),
      ]);

      // Denominator: total study questions per product slug
      const studyTotalBySlug = new Map<string, number>();
      for (const row of studyCountRows) {
        studyTotalBySlug.set(row.product_slug, (studyTotalBySlug.get(row.product_slug) ?? 0) + 1);
      }

      // Aggregate user's progress per slug
      const progressBySlug = new Map<string, { mastered: number; points: number }>();
      for (const row of progressRows) {
        const entry = progressBySlug.get(row.product_slug) ?? { mastered: 0, points: 0 };
        if (row.mastered) entry.mastered += 1;
        entry.points += Math.min(row.consecutive_correct ?? 0, MASTERY_STREAK);
        progressBySlug.set(row.product_slug, entry);
      }

      const out: Record<string, StudyMasterySummary> = {};
      for (const [slug, total] of studyTotalBySlug) {
        const p = progressBySlug.get(slug) ?? { mastered: 0, points: 0 };
        const maxPoints = total * MASTERY_STREAK;
        out[slug] = {
          mastered: p.mastered,
          progressPercent: maxPoints > 0 ? Math.round((p.points / maxPoints) * 100) : 0,
        };
      }

      return out;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });
}
