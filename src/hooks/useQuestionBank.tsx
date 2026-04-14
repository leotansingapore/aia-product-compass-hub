import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BankType, QuestionBankQuestion, QuizQuestion } from '@/types/questionBank';
import { dbRowToQuizQuestion } from '@/types/questionBank';

interface UseQuestionBankParams {
  productSlug: string;
  bankType: BankType;
  enabled?: boolean;
}

/**
 * Fetch questions for a product bank (study or exam) from Supabase.
 * Returns questions in the legacy QuizQuestion shape expected by quiz components.
 */
export function useQuestionBank({ productSlug, bankType, enabled = true }: UseQuestionBankParams) {
  return useQuery({
    queryKey: ['question-bank', productSlug, bankType],
    queryFn: async (): Promise<QuizQuestion[]> => {
      const { data, error } = await supabase
        .from('question_bank_questions' as never)
        .select('*')
        .eq('product_slug', productSlug)
        .eq('bank_type', bankType)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return ((data ?? []) as unknown as QuestionBankQuestion[]).map(dbRowToQuizQuestion);
    },
    enabled: enabled && !!productSlug && !!bankType,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch raw rows (including ids) for admin management.
 */
export function useQuestionBankRows({ productSlug, bankType, enabled = true }: UseQuestionBankParams) {
  return useQuery({
    queryKey: ['question-bank-rows', productSlug, bankType],
    queryFn: async (): Promise<QuestionBankQuestion[]> => {
      const { data, error } = await supabase
        .from('question_bank_questions' as never)
        .select('*')
        .eq('product_slug', productSlug)
        .eq('bank_type', bankType)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data ?? []) as unknown as QuestionBankQuestion[];
    },
    enabled: enabled && !!productSlug && !!bankType,
  });
}
