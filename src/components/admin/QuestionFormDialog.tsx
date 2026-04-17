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
  question?: QuestionBankQuestion | null;
  mode: 'create' | 'edit' | 'duplicate';
  defaultSortOrder?: number;
  onEditComplete?: (previousQuestion: QuestionBankQuestion) => void;
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

function questionToForm(q: QuestionBankQuestion): QuestionInput {
  return {
    product_slug: q.product_slug,
    bank_type: q.bank_type,
    category: q.category,
    question: q.question,
    options: [...q.options, '', '', '', ''].slice(0, 4),
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    sort_order: q.sort_order,
  };
}

export function QuestionFormDialog({
  open,
  onClose,
  productSlug,
  bankType,
  question,
  mode,
  defaultSortOrder = 0,
  onEditComplete,
}: Props) {
  const { createQuestion, updateQuestion } = useQuestionBankAdmin();
  const isEdit = mode === 'edit' && !!question;
  const isDuplicate = mode === 'duplicate' && !!question;

  const [form, setForm] = useState<QuestionInput>(() =>
    question ? questionToForm(question) : emptyForm(productSlug, bankType, defaultSortOrder)
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      if (question && (isEdit || isDuplicate)) {
        const f = questionToForm(question);
        if (isDuplicate) {
          f.question = `${f.question} (copy)`;
          f.sort_order = defaultSortOrder;
        }
        setForm(f);
      } else {
        setForm(emptyForm(productSlug, bankType, defaultSortOrder));
      }
      setTouched({});
    }
  }, [open, question, productSlug, bankType, defaultSortOrder, isEdit, isDuplicate]);

  const updateOption = (i: number, val: string) => {
    const next = [...form.options];
    next[i] = val;
    setForm({ ...form, options: next });
  };

  const markTouched = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  // --- Improvement 7: Per-field validation ---
  const errors: Record<string, string> = {};
  if (touched.question && !form.question.trim()) errors.question = 'Question is required';
  if (touched.explanation && !form.explanation.trim()) errors.explanation = 'Explanation is required';
  form.options.forEach((o, i) => {
    if (touched[`option-${i}`] && !o.trim()) errors[`option-${i}`] = `Option ${String.fromCharCode(65 + i)} is required`;
  });

  const isValid =
    form.question.trim().length > 0 &&
    form.explanation.trim().length > 0 &&
    form.options.every((o) => o.trim().length > 0) &&
    form.correct_answer >= 0 &&
    form.correct_answer < 4;

  // --- Improvement 3: Save & Add Another ---
  const handleSave = async (addAnother: boolean) => {
    // Touch all fields to show validation
    setTouched({
      question: true,
      explanation: true,
      'option-0': true,
      'option-1': true,
      'option-2': true,
      'option-3': true,
    });
    if (!isValid) return;

    if (isEdit && question) {
      await updateQuestion.mutateAsync({ id: question.id, updates: form });
      // --- Improvement 8: Notify parent for undo toast ---
      onEditComplete?.(question);
      onClose();
    } else {
      await createQuestion.mutateAsync(form);
      if (addAnother) {
        // Keep category, reset the rest
        setForm({
          ...emptyForm(productSlug, bankType, defaultSortOrder),
          category: form.category,
        });
        setTouched({});
      } else {
        onClose();
      }
    }
  };

  const saving = createQuestion.isPending || updateQuestion.isPending;

  const title = isEdit ? 'Edit Question' : isDuplicate ? 'Duplicate Question' : 'Add Question';
  const description = isEdit
    ? 'Update this question and its answers.'
    : isDuplicate
      ? 'Create a copy of this question. Modify as needed.'
      : 'Create a new question for this question bank.';

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
            <Label className={errors.question ? 'text-destructive' : ''}>
              Question {errors.question && <span className="font-normal ml-1">-- {errors.question}</span>}
            </Label>
            <Textarea
              rows={3}
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              onBlur={() => markTouched('question')}
              placeholder="Enter the question text..."
              className={errors.question ? 'border-destructive' : ''}
            />
          </div>

          <div>
            <Label>Answer Options (select the correct one)</Label>
            <RadioGroup
              value={String(form.correct_answer)}
              onValueChange={(v) => setForm({ ...form, correct_answer: parseInt(v) })}
              className="space-y-2 mt-1"
            >
              {form.options.map((opt, i) => {
                const fieldKey = `option-${i}`;
                const hasError = !!errors[fieldKey];
                return (
                  <div key={i} className="flex items-center gap-2">
                    <RadioGroupItem value={String(i)} id={`opt-${i}`} />
                    <div className="flex-1">
                      <Input
                        value={opt}
                        onChange={(e) => updateOption(i, e.target.value)}
                        onBlur={() => markTouched(fieldKey)}
                        placeholder={`Option ${String.fromCharCode(65 + i)}${i === form.correct_answer ? ' (correct)' : ''}`}
                        className={`${i === form.correct_answer ? 'border-green-500' : ''} ${hasError ? 'border-destructive' : ''}`}
                      />
                      {hasError && (
                        <p className="text-[11px] text-destructive mt-0.5">{errors[fieldKey]}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <div>
            <Label className={errors.explanation ? 'text-destructive' : ''}>
              Explanation {errors.explanation && <span className="font-normal ml-1">-- {errors.explanation}</span>}
            </Label>
            <Textarea
              rows={3}
              value={form.explanation}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              onBlur={() => markTouched('explanation')}
              placeholder="Why the correct answer is correct..."
              className={errors.explanation ? 'border-destructive' : ''}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          {!isEdit && (
            <Button
              variant="secondary"
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save & Add Another'}
            </Button>
          )}
          <Button onClick={() => handleSave(false)} disabled={saving}>
            {saving
              ? 'Saving...'
              : isEdit
                ? 'Save Changes'
                : isDuplicate
                  ? 'Create Duplicate'
                  : 'Create Question'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
