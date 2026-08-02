/**
 * Grading helpers shared by the study and simulation quiz runners.
 *
 * Both runners shuffle a question's options and keep a `shuffleMap` where
 * `shuffleMap[displayIdx] = originalIdx`. To grade, they need the DISPLAY
 * position of the stored correct option.
 *
 * The failure this guards against: `question_bank_questions.correct_answer` is
 * a plain integer with no constraint tying it to `options`, so an editing
 * mistake can leave it pointing past the end of the option list. `indexOf`
 * then returns -1, no answer can ever match, and the whole cohort is marked
 * wrong on that question — a silent 0% on an otherwise good paper, with no
 * option highlighted as correct in review either. A question we cannot grade
 * is excluded from the denominator instead of being counted against everyone.
 */

export interface GradableQuestion {
  /** 0-based index into `options` of the correct answer. */
  correct: number;
  category?: string;
}

export interface GradeSummary {
  /** Correctly answered questions. */
  correct: number;
  /** Questions that could actually be graded — the score denominator. */
  gradable: number;
  /** Indices of questions excluded because their correct answer is unusable. */
  excluded: number[];
  /** Indices answered wrongly. Never includes an excluded question. */
  missed: number[];
  /** 0-100 over `gradable`. 0 when nothing is gradable. */
  scorePercent: number;
  /** category -> {correct,total}; excluded questions are left out entirely. */
  categoryBreakdown: Record<string, { correct: number; total: number }>;
}

/**
 * Where the correct option landed after shuffling, or -1 when the question's
 * stored correct answer is unusable (out of range, non-integer, missing map).
 */
export function correctDisplayIndex(
  shuffleMap: readonly number[] | undefined | null,
  correctOriginalIdx: number,
): number {
  if (!Array.isArray(shuffleMap)) return -1;
  if (!Number.isInteger(correctOriginalIdx)) return -1;
  return shuffleMap.indexOf(correctOriginalIdx);
}

/** True when the question can be graded at all. */
export function isGradable(
  shuffleMap: readonly number[] | undefined | null,
  correctOriginalIdx: number,
): boolean {
  return correctDisplayIndex(shuffleMap, correctOriginalIdx) >= 0;
}

/**
 * Score a shuffled quiz, excluding any question whose correct answer cannot be
 * resolved. `answers[i]` is the DISPLAY index the learner picked, or null.
 */
export function gradeShuffledQuiz(
  questions: readonly GradableQuestion[],
  shuffleMaps: readonly (readonly number[] | undefined)[],
  answers: readonly (number | null)[],
): GradeSummary {
  let correct = 0;
  let gradable = 0;
  const excluded: number[] = [];
  const missed: number[] = [];
  const categoryBreakdown: Record<string, { correct: number; total: number }> = {};

  questions.forEach((q, i) => {
    const display = correctDisplayIndex(shuffleMaps[i], q.correct);
    if (display < 0) {
      excluded.push(i);
      return;
    }
    gradable++;
    const cat = q.category;
    if (cat !== undefined) {
      categoryBreakdown[cat] ??= { correct: 0, total: 0 };
      categoryBreakdown[cat].total++;
    }
    if (answers[i] === display) {
      correct++;
      if (cat !== undefined) categoryBreakdown[cat].correct++;
    } else {
      missed.push(i);
    }
  });

  return {
    correct,
    gradable,
    excluded,
    missed,
    scorePercent: gradable === 0 ? 0 : Math.round((correct / gradable) * 100),
    categoryBreakdown,
  };
}

/** One-line copy for the review screen, so an excluded question isn't a mystery. */
export const EXCLUDED_QUESTION_NOTE =
  'This question had a data error and was excluded from your score — it was not counted for or against you.';
