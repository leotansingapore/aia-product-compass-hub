/**
 * Local-first store for Question Bank practice history and the Review Bank.
 *
 * Modeled on the examprep practice app: attempts and the review bank live in
 * localStorage so they work without a DB migration. Per-question MASTERY still
 * lives in Supabase (`user_question_progress`); this store covers the things
 * that app does not yet persist server-side:
 *   - Simulation / quiz ATTEMPTS (scored sessions with pass/fail + breakdown)
 *   - The REVIEW BANK (questions the learner got wrong, flagged, or marked unsure)
 *
 * A tiny pub/sub lets React hooks re-render when the store changes in the same
 * tab; the native `storage` event covers other tabs.
 */

import { toast } from 'sonner';

const ATTEMPTS_KEY = 'qb-attempts';
const REVIEW_KEY = 'qb-review-bank';
const SIM_SESSION_PREFIX = 'qb-sim-session-';
const MAX_ATTEMPTS = 300;

// Attempts, the review bank, and live exam sessions all persist to localStorage.
// If a write throws (quota exceeded, Safari Private mode, storage disabled by
// policy) the data is silently lost — a finished exam that shows a score but
// saves nothing. Warn the user once so the loss isn't invisible.
let storageWarned = false;
function handleStorageError() {
  if (storageWarned) return;
  storageWarned = true;
  try {
    toast.error("Couldn't save your progress", {
      description: 'Your browser storage is full or disabled — recent results may not be kept.',
    });
  } catch {
    /* toast unavailable outside the app — ignore */
  }
}

export type QuizMode = 'simulation' | 'study' | 'quick';

export interface BankAttempt {
  /** `${productSlug}-${mode}-${timestamp}` */
  id: string;
  productSlug: string;
  bankType: 'study' | 'exam';
  mode: QuizMode;
  /** 0-100 */
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  /** Percent threshold used for pass/fail. */
  passMark: number;
  dateISO: string;
  durationSec: number;
  /** category -> {correct,total} for the per-topic breakdown. */
  categoryBreakdown: Record<string, { correct: number; total: number }>;
}

export type ReviewStatus = 'wrong' | 'unsure' | 'flagged';

export interface ReviewItem {
  /** question_bank_questions.id */
  questionId: string;
  productSlug: string;
  bankType: 'study' | 'exam';
  category: string;
  question: string;
  options: string[];
  /** 0-based index of the correct option. */
  correctAnswer: number;
  explanation: string;
  status: ReviewStatus;
  dateISO: string;
  /** Consecutive correct answers in Review-Bank practice. Clears at 2, matching
   *  the app's "2-in-a-row = mastered" rule. Absent = 0. */
  correctStreak?: number;
}

/** Higher number wins when the same question is added under different statuses. */
const STATUS_PRIORITY: Record<ReviewStatus, number> = { wrong: 3, unsure: 2, flagged: 1 };

// ── pub/sub ───────────────────────────────────────────────────────────────
type Listener = () => void;
const listeners = new Set<Listener>();

/** Subscribe to in-tab store changes. Returns an unsubscribe fn. */
export function subscribeQuestionBankStore(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* ignore listener errors */
    }
  });
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    handleStorageError();
  }
  emit();
}

// ── Attempts ────────────────────────────────────────────────────────────────
export function getAttempts(): BankAttempt[] {
  return readJSON<BankAttempt[]>(ATTEMPTS_KEY, []);
}

export function addAttempt(attempt: BankAttempt): void {
  const next = [attempt, ...getAttempts()].slice(0, MAX_ATTEMPTS);
  writeJSON(ATTEMPTS_KEY, next);
}

export function attemptsForProduct(productSlug: string): BankAttempt[] {
  return getAttempts().filter((a) => a.productSlug === productSlug);
}

/** Best simulation/exam score (percent) for a product, or null if never attempted. */
export function bestExamScore(productSlug: string): number | null {
  const xs = getAttempts().filter((a) => a.productSlug === productSlug && a.bankType === 'exam');
  if (xs.length === 0) return null;
  return Math.max(...xs.map((a) => a.score));
}

export function lastAttempt(): BankAttempt | null {
  return getAttempts()[0] ?? null;
}

// ── Review bank ───────────────────────────────────────────────────────────
export function getReviewBank(): ReviewItem[] {
  return readJSON<ReviewItem[]>(REVIEW_KEY, []);
}

/**
 * Add or upgrade a review item. If the question already exists, keep the
 * higher-priority status (wrong > unsure > flagged) and refresh the timestamp.
 */
export function upsertReviewItem(item: ReviewItem): void {
  const bank = getReviewBank();
  const idx = bank.findIndex((b) => b.questionId === item.questionId);
  if (idx === -1) {
    writeJSON(REVIEW_KEY, [item, ...bank]);
    return;
  }
  const existing = bank[idx];
  const keepStatus =
    STATUS_PRIORITY[existing.status] >= STATUS_PRIORITY[item.status] ? existing.status : item.status;
  bank[idx] = { ...item, status: keepStatus };
  writeJSON(REVIEW_KEY, bank);
}

/** Bulk add (used when a scored session finishes and auto-collects wrong answers). */
export function addReviewItems(items: ReviewItem[]): void {
  if (items.length === 0) return;
  const bank = getReviewBank();
  const byId = new Map(bank.map((b) => [b.questionId, b]));
  for (const item of items) {
    const existing = byId.get(item.questionId);
    if (!existing) {
      byId.set(item.questionId, item);
    } else {
      const keepStatus =
        STATUS_PRIORITY[existing.status] >= STATUS_PRIORITY[item.status]
          ? existing.status
          : item.status;
      byId.set(item.questionId, { ...item, status: keepStatus });
    }
  }
  writeJSON(REVIEW_KEY, Array.from(byId.values()));
}

export function removeReviewItem(questionId: string): void {
  writeJSON(REVIEW_KEY, getReviewBank().filter((b) => b.questionId !== questionId));
}

/** Remove a question from the bank once it has been answered correctly again. */
export function clearReviewItemIfPresent(questionId: string): void {
  const bank = getReviewBank();
  if (bank.some((b) => b.questionId === questionId)) {
    writeJSON(REVIEW_KEY, bank.filter((b) => b.questionId !== questionId));
  }
}

/**
 * Record a Review-Bank practice answer. A question only leaves the bank after
 * TWO consecutive correct answers (matching the "2-in-a-row = mastered" rule) —
 * a single lucky guess on a 4-option MCQ shouldn't retire a question the learner
 * got wrong. A wrong answer resets the streak.
 */
export function recordReviewPractice(questionId: string, correct: boolean): void {
  const bank = getReviewBank();
  const idx = bank.findIndex((b) => b.questionId === questionId);
  if (idx === -1) return;
  if (!correct) {
    if (bank[idx].correctStreak) {
      bank[idx] = { ...bank[idx], correctStreak: 0 };
      writeJSON(REVIEW_KEY, bank);
    }
    return;
  }
  const streak = (bank[idx].correctStreak ?? 0) + 1;
  if (streak >= 2) {
    writeJSON(REVIEW_KEY, bank.filter((b) => b.questionId !== questionId));
  } else {
    bank[idx] = { ...bank[idx], correctStreak: streak };
    writeJSON(REVIEW_KEY, bank);
  }
}

export function reviewItemsForProduct(productSlug: string): ReviewItem[] {
  return getReviewBank().filter((b) => b.productSlug === productSlug);
}

export function reviewCount(): number {
  return getReviewBank().length;
}

// ── Live simulation session ─────────────────────────────────────────────────
/**
 * An in-progress timed simulation, persisted so a refresh, tab crash, or the
 * OS back-gesture does not throw away a paper mid-attempt. `endsAt` is an
 * ABSOLUTE epoch (ms) so the timer keeps counting down correctly across a
 * reload instead of resetting. `signature` pins the session to the exact
 * question set it was built against — if the bank changes the session is
 * discarded rather than mis-graded against a shifted answer key.
 */
export interface SimSession {
  productSlug: string;
  signature: string;
  startedAt: number;
  endsAt: number;
  answers: (number | null)[];
  flagged: number[];
  shuffleMaps: number[][];
  currentIdx: number;
}

export function getSimSession(productSlug: string): SimSession | null {
  return readJSON<SimSession | null>(SIM_SESSION_PREFIX + productSlug, null);
}

/** Persist without pub/sub — this fires on every answer and needs no re-render. */
export function saveSimSession(s: SimSession): void {
  try {
    localStorage.setItem(SIM_SESSION_PREFIX + s.productSlug, JSON.stringify(s));
  } catch {
    handleStorageError();
  }
}

export function clearSimSession(productSlug: string): void {
  try {
    localStorage.removeItem(SIM_SESSION_PREFIX + productSlug);
  } catch {
    /* ignore */
  }
}
