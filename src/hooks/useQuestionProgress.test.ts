import { describe, it, expect } from 'vitest';
import {
  computeNextQuestionProgress,
  type QuestionProgressRow,
} from '@/hooks/useQuestionProgress';

const ctx = {
  userId: 'user-1',
  questionId: 'q-1',
  productSlug: 'pro-achiever',
};

const fixedNow = new Date('2026-04-02T12:00:00.000Z');

describe('computeNextQuestionProgress', () => {
  it('requires two consecutive correct answers before mastered', () => {
    let row = computeNextQuestionProgress(undefined, true, ctx, fixedNow);
    expect(row.consecutive_correct).toBe(1);
    expect(row.mastered).toBe(false);
    expect(row.total_attempts).toBe(1);
    expect(row.total_correct).toBe(1);

    row = computeNextQuestionProgress(row, true, ctx, fixedNow);
    expect(row.consecutive_correct).toBe(2);
    expect(row.mastered).toBe(true);
    expect(row.total_attempts).toBe(2);
    expect(row.total_correct).toBe(2);
  });

  it('resets streak and mastery on wrong answer', () => {
    let row: QuestionProgressRow | undefined = computeNextQuestionProgress(
      undefined,
      true,
      ctx,
      fixedNow,
    );
    row = computeNextQuestionProgress(row, true, ctx, fixedNow);
    expect(row.mastered).toBe(true);

    row = computeNextQuestionProgress(row, false, ctx, fixedNow);
    expect(row.consecutive_correct).toBe(0);
    expect(row.mastered).toBe(false);
    expect(row.total_correct).toBe(2);
    expect(row.total_attempts).toBe(3);
  });

  it('increments mastered count only when crossing threshold (two new questions)', () => {
    const rows: QuestionProgressRow[] = [];
    const push = (r: QuestionProgressRow) => {
      const i = rows.findIndex((x) => x.question_id === r.question_id);
      if (i === -1) rows.push(r);
      else rows[i] = r;
    };
    const mastered = () => rows.filter((r) => r.mastered).length;

    push(
      computeNextQuestionProgress(undefined, true, { ...ctx, questionId: 'a' }, fixedNow),
    );
    push(
      computeNextQuestionProgress(rows.find((r) => r.question_id === 'a'), true, {
        ...ctx,
        questionId: 'a',
      }, fixedNow),
    );
    expect(mastered()).toBe(1);

    push(
      computeNextQuestionProgress(undefined, true, { ...ctx, questionId: 'b' }, fixedNow),
    );
    expect(mastered()).toBe(1);
    push(
      computeNextQuestionProgress(rows.find((r) => r.question_id === 'b'), true, {
        ...ctx,
        questionId: 'b',
      }, fixedNow),
    );
    expect(mastered()).toBe(2);
  });
});
