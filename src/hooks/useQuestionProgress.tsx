import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface QuestionProgressRow {
  user_id: string;
  question_id: string;
  product_slug: string;
  consecutive_correct: number;
  mastered: boolean;
  total_attempts: number;
  total_correct: number;
  last_correct: boolean | null;
  last_answered_at: string;
}

const MASTERY_THRESHOLD = 2;

/**
 * Loads the current user's per-question progress for a given product_slug and
 * exposes recordAnswer() for use inside study sessions.
 *
 * Mastery rule: 2 consecutive correct answers = mastered. A wrong answer resets
 * consecutive_correct to 0 and clears mastered.
 */
export function useQuestionProgress(productSlug: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => ['question-progress', user?.id, productSlug],
    [user?.id, productSlug],
  );

  const { data: rows = [], isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<QuestionProgressRow[]> => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_question_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_slug', productSlug);
      if (error) throw error;
      return (data ?? []) as QuestionProgressRow[];
    },
    enabled: !!user?.id && !!productSlug,
    staleTime: 30_000,
  });

  const progressByQuestion = useMemo(
    () => new Map(rows.map(r => [r.question_id, r])),
    [rows],
  );

  const recordAnswer = useCallback(
    async (questionId: string, isCorrect: boolean) => {
      if (!user?.id || !questionId) return;
      const existing = progressByQuestion.get(questionId);
      const consecutive = isCorrect ? (existing?.consecutive_correct ?? 0) + 1 : 0;
      const payload = {
        user_id: user.id,
        question_id: questionId,
        product_slug: productSlug,
        consecutive_correct: consecutive,
        mastered: consecutive >= MASTERY_THRESHOLD,
        total_attempts: (existing?.total_attempts ?? 0) + 1,
        total_correct: (existing?.total_correct ?? 0) + (isCorrect ? 1 : 0),
        last_correct: isCorrect,
        last_answered_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from('user_question_progress')
        .upsert(payload, { onConflict: 'user_id,question_id' });
      if (error) {
        console.error('recordAnswer failed', error);
        return;
      }
      queryClient.invalidateQueries({ queryKey });
    },
    [user?.id, productSlug, progressByQuestion, queryClient, queryKey],
  );

  return {
    isLoading,
    rows,
    progressByQuestion,
    recordAnswer,
    masteredCount: rows.filter(r => r.mastered).length,
    touchedCount: rows.length,
  };
}
