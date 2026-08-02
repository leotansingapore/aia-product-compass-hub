import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BankType, QuestionBankQuestion, QuizQuestion } from '@/types/questionBank';
import { dbRowToQuizQuestion } from '@/types/questionBank';
import { fetchAllRows } from '@/lib/fetchAllRows';

interface UseQuestionBankParams {
  productSlug: string;
  bankType: BankType;
  enabled?: boolean;
}

/**
 * Fetch questions for a product bank (study or exam) from Supabase.
 * Returns questions in the legacy QuizQuestion shape expected by quiz components.
 *
 * ORDER STABILITY IS A CORRECTNESS REQUIREMENT, NOT A NICETY.
 * `sort_order` is `not null default 0` and is NOT unique, so ordering by it
 * alone leaves row order undefined between fetches. A live exam must not
 * reorder underneath the candidate: `answers` and `shuffleMaps` are indexed
 * positionally against the question array, so a reshuffled fetch grades
 * answer i against a different question, and ProductExam's id signature would
 * change and bin a paper the learner is 40 minutes into. Hence:
 *   - `.order('id')` as a unique tiebreaker (same fix ReviewAll already uses)
 *   - `refetchOnWindowFocus: false` so tabbing away and back never re-fetches
 *     the bank mid-paper.
 */
export function useQuestionBank({ productSlug, bankType, enabled = true }: UseQuestionBankParams) {
  return useQuery({
    queryKey: ['question-bank', productSlug, bankType],
    queryFn: async (): Promise<QuizQuestion[]> => {
      // Paged: PostgREST caps a bare select at 1,000 rows, so a large bank
      // would silently hand the learner a truncated paper.
      const rows = await fetchAllRows<QuestionBankQuestion>((from, to) =>
        supabase
          .from('question_bank_questions' as never)
          .select('*')
          .eq('product_slug', productSlug)
          .eq('bank_type', bankType)
          .order('sort_order', { ascending: true })
          .order('id', { ascending: true })
          .range(from, to),
      );
      return rows.map(dbRowToQuizQuestion);
    },
    enabled: enabled && !!productSlug && !!bankType,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch raw rows (including ids) for admin management.
 */
export function useQuestionBankRows({ productSlug, bankType, enabled = true }: UseQuestionBankParams) {
  return useQuery({
    queryKey: ['question-bank-rows', productSlug, bankType],
    queryFn: async (): Promise<QuestionBankQuestion[]> => {
      return await fetchAllRows<QuestionBankQuestion>((from, to) =>
        supabase
          .from('question_bank_questions' as never)
          .select('*')
          .eq('product_slug', productSlug)
          .eq('bank_type', bankType)
          .order('sort_order', { ascending: true })
          // Same unique tiebreaker: without it the admin list silently reorders
          // between refetches, so "row 3" is not the row you just edited — and
          // paging needs a stable order or pages overlap.
          .order('id', { ascending: true })
          .range(from, to),
      );
    },
    enabled: enabled && !!productSlug && !!bankType,
  });
}
