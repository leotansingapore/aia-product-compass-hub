import { describe, expect, it } from 'vitest';
import { correctDisplayIndex, gradeShuffledQuiz, isGradable } from './quizGrading';

describe('correctDisplayIndex', () => {
  it('maps the correct original index to its shuffled display position', () => {
    // shuffleMap[displayIdx] = originalIdx
    expect(correctDisplayIndex([2, 0, 3, 1], 2)).toBe(0);
    expect(correctDisplayIndex([2, 0, 3, 1], 1)).toBe(3);
  });

  it('returns -1 when correct_answer is past the end of the options', () => {
    expect(correctDisplayIndex([0, 1, 2, 3], 4)).toBe(-1);
    expect(correctDisplayIndex([0, 1], 7)).toBe(-1);
  });

  it('returns -1 for negative, non-integer, or missing values', () => {
    expect(correctDisplayIndex([0, 1, 2], -1)).toBe(-1);
    expect(correctDisplayIndex([0, 1, 2], 1.5)).toBe(-1);
    expect(correctDisplayIndex([0, 1, 2], NaN)).toBe(-1);
    expect(correctDisplayIndex(undefined, 0)).toBe(-1);
    expect(correctDisplayIndex(null, 0)).toBe(-1);
  });

  it('isGradable mirrors the -1 sentinel', () => {
    expect(isGradable([0, 1], 1)).toBe(true);
    expect(isGradable([0, 1], 5)).toBe(false);
  });
});

describe('gradeShuffledQuiz', () => {
  const maps = [
    [0, 1, 2, 3],
    [0, 1, 2, 3],
    [0, 1, 2, 3],
  ];

  it('scores a clean quiz over every question', () => {
    const qs = [{ correct: 0 }, { correct: 1 }, { correct: 2 }];
    const r = gradeShuffledQuiz(qs, maps, [0, 1, 3]);
    expect(r.correct).toBe(2);
    expect(r.gradable).toBe(3);
    expect(r.excluded).toEqual([]);
    expect(r.missed).toEqual([2]);
    expect(r.scorePercent).toBe(67);
  });

  it('excludes an ungradable question from the denominator rather than failing everyone', () => {
    // Q1 has correct_answer = 9 with only 4 options — nobody can match it.
    const qs = [{ correct: 0 }, { correct: 9 }, { correct: 2 }];
    const r = gradeShuffledQuiz(qs, maps, [0, 1, 2]);
    expect(r.excluded).toEqual([1]);
    expect(r.gradable).toBe(2);
    expect(r.correct).toBe(2);
    // Without the guard this would have been 2/3 = 67%.
    expect(r.scorePercent).toBe(100);
  });

  it('never lists an excluded question as missed', () => {
    const qs = [{ correct: 9 }, { correct: 1 }];
    const r = gradeShuffledQuiz(qs, maps, [null, null]);
    expect(r.excluded).toEqual([0]);
    expect(r.missed).toEqual([1]);
  });

  it('keeps excluded questions out of the category breakdown', () => {
    const qs = [
      { correct: 0, category: 'product-facts' },
      { correct: 9, category: 'product-facts' },
      { correct: 2, category: 'closing' },
    ];
    const r = gradeShuffledQuiz(qs, maps, [0, 0, 0]);
    expect(r.categoryBreakdown['product-facts']).toEqual({ correct: 1, total: 1 });
    expect(r.categoryBreakdown.closing).toEqual({ correct: 0, total: 1 });
  });

  it('reports 0% instead of dividing by zero when nothing is gradable', () => {
    const qs = [{ correct: 9 }, { correct: 12 }];
    const r = gradeShuffledQuiz(qs, maps, [0, 1]);
    expect(r.gradable).toBe(0);
    expect(r.scorePercent).toBe(0);
    expect(r.excluded).toEqual([0, 1]);
  });

  it('counts an unanswered question as missed, not excluded', () => {
    const qs = [{ correct: 0 }, { correct: 1 }];
    const r = gradeShuffledQuiz(qs, maps, [null, 1]);
    expect(r.missed).toEqual([0]);
    expect(r.correct).toBe(1);
    expect(r.scorePercent).toBe(50);
  });

  it('respects a genuinely shuffled map', () => {
    const shuffled = [[3, 1, 0, 2]];
    const r = gradeShuffledQuiz([{ correct: 0 }], shuffled, [2]);
    expect(r.correct).toBe(1);
    expect(r.scorePercent).toBe(100);
  });
});
