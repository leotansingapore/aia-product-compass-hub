import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useQuestionBankAdmin, type QuestionInput } from '@/hooks/useQuestionBankAdmin';
import type { QuestionBankQuestion, QuestionCategory, BankType } from '@/types/questionBank';
import { CATEGORY_LABELS } from '@/types/questionBank';

interface Props {
  open: boolean;
  onClose: () => void;
  productSlug: string;
  bankType: BankType;
  question?: QuestionBankQuestion | null; // null = create, set = edit
  defaultSortOrder?: number;
}

const emptyForm = (productSlug: string, bankType: BankType, sortOrder: number): QuestionInput => ({
  product_slug: productSlug,
  bank_type: bankType,
  category: 'product-facts',
  question: '',
  options: ['', '', '', ''],
  correct_answer: 0,
  explanation: '',
  sort_order: sortOrder,
});

export function QuestionFormDialog({ open, onClose, productSlug, bankType, question, defaultSortOrder = 0 }: Props) {
  const { createQuestion, updateQuestion } = useQuestionBankAdmin();
  const isEdit = !!question;
  const [form, setForm] = useState<QuestionInput>(() =>
    question
      ? {
          product_slug: question.product_slug,
          bank_type: question.bank_type,
          category: question.category,
          question: question.question,
          options: [...question.options, '', '', '', ''].slice(0, 4),
          correct_answer: question.correct_answer,
          explanation: question.explanation,
          sort_order: question.sort_order,
        }
      : emptyForm(productSlug, bankType, defaultSortOrder)
  );

  useEffect(() => {
    if (open) {
      setForm(
        question
          ? {
              product_slug: question.product_slug,
              bank_type: question.bank_type,
              category: question.category,
              question: question.question,
              options: [...question.options, '', '', '', ''].slice(0, 4),
              correct_answer: question.correct_answer,
              explanation: question.explanation,
              sort_order: question.sort_order,
            }
          : emptyForm(productSlug, bankType, defaultSortOrder)
      );
    }
  }, [open, question, productSlug, bankType, defaultSortOrder]);

  const updateOption = (i: number, val: string) => {
    const next = [...form.options];
    next[i] = val;
    setForm({ ...form, options: next });
  };

  const isValid =
    form.question.trim().length > 0 &&
    form.explanation.trim().length > 0 &&
    form.options.every((o) => o.trim().length > 0) &&
    form.correct_answer >= 0 &&
    form.correct_answer < 4;

  const handleSubmit = async () => {
    if (!isValid) return;
    if (isEdit && question) {
      await updateQuestion.mutateAsync({ id: question.id, updates: form });
    } else {
      await createQuestion.mutateAsync(form);
    }
    onClose();
  };

  const saving = createQuestion.isPending || updateQuestion.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Question' : 'Add Question'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update this question and its answers.' : 'Create a new question for this question bank.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v as QuestionCategory })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_LABELS) as QuestionCategory[]).map((c) => (
                    <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <Label>Question</Label>
            <Textarea
              rows={3}
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="Enter the question text..."
            />
          </div>

          <div>
            <Label>Answer Options (select the correct one)</Label>
            <RadioGroup
              value={String(form.correct_answer)}
              onValueChange={(v) => setForm({ ...form, correct_answer: parseInt(v) })}
              className="space-y-2 mt-1"
            >
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <RadioGroupItem value={String(i)} id={`opt-${i}`} />
                  <Input
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}${i === form.correct_answer ? ' (correct)' : ''}`}
                    className={i === form.correct_answer ? 'border-green-500' : ''}
                  />
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label>Explanation</Label>
            <Textarea
              rows={3}
              value={form.explanation}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              placeholder="Why the correct answer is correct..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!isValid || saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Question'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
