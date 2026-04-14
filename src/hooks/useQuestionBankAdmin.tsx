import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { QuestionBankQuestion } from '@/types/questionBank';

export type QuestionInput = Omit<QuestionBankQuestion, 'id' | 'created_at' | 'updated_at'>;
export type QuestionUpdate = Partial<Omit<QuestionBankQuestion, 'id' | 'created_at' | 'updated_at'>>;

export function useQuestionBankAdmin() {
  const qc = useQueryClient();

  const invalidate = (productSlug?: string, bankType?: string) => {
    qc.invalidateQueries({ queryKey: ['question-bank'] });
    qc.invalidateQueries({ queryKey: ['question-bank-rows'] });
    if (productSlug && bankType) {
      qc.invalidateQueries({ queryKey: ['question-bank', productSlug, bankType] });
      qc.invalidateQueries({ queryKey: ['question-bank-rows', productSlug, bankType] });
    }
  };

  const createQuestion = useMutation({
    mutationFn: async (input: QuestionInput) => {
      const { data, error } = await supabase
        .from('question_bank_questions' as never)
        .insert(input as never)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as QuestionBankQuestion;
    },
    onSuccess: (q) => {
      invalidate(q.product_slug, q.bank_type);
      toast.success('Question created');
    },
    onError: (e: Error) => toast.error(`Failed to create: ${e.message}`),
  });

  const updateQuestion = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: QuestionUpdate }) => {
      const { data, error } = await supabase
        .from('question_bank_questions' as never)
        .update(updates as never)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as QuestionBankQuestion;
    },
    onSuccess: (q) => {
      invalidate(q.product_slug, q.bank_type);
      toast.success('Question updated');
    },
    onError: (e: Error) => toast.error(`Failed to update: ${e.message}`),
  });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('question_bank_questions' as never)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Question deleted');
    },
    onError: (e: Error) => toast.error(`Failed to delete: ${e.message}`),
  });

  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('question_bank_questions' as never)
        .delete()
        .in('id', ids);
      if (error) throw error;
      return ids;
    },
    onSuccess: (ids) => {
      invalidate();
      toast.success(`Deleted ${ids.length} question${ids.length === 1 ? '' : 's'}`);
    },
    onError: (e: Error) => toast.error(`Failed to delete: ${e.message}`),
  });

  return { createQuestion, updateQuestion, deleteQuestion, bulkDelete };
}
