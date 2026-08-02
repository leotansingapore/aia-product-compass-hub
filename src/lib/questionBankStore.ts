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
import { supabase } from '@/integrations/supabase/client';

const ATTEMPTS_KEY = 'qb-attempts';
const REVIEW_KEY = 'qb-review-bank';
const SIM_SESSION_PREFIX = 'qb-sim-session-';
const MAX_ATTEMPTS = 300;

// Attempts, the review bank, and live exam sessions all persist to localStorage.
// If a write throws (quota exceeded, Safari Private mode, storage disabled by
// policy) the data is silently lost — a finished exam that shows a score but
// saves nothing. Warn the user once so the loss isn't invisible.
let storageWarned = false;
/**
 * Warn ONCE per session that a localStorage write failed. Exported so every
 * quiz surface shares the same one-shot warning instead of each inventing its
 * own (or, worse, letting the throw blank the route).
 */
export function handleStorageError() {
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
  mirrorAttempt(attempt);
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
    mirrorReviewUpsert(item);
    return;
  }
  const existing = bank[idx];
  const keepStatus =
    STATUS_PRIORITY[existing.status] >= STATUS_PRIORITY[item.status] ? existing.status : item.status;
  bank[idx] = { ...item, status: keepStatus };
  writeJSON(REVIEW_KEY, bank);
  mirrorReviewUpsert(bank[idx]);
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
  for (const it of items) mirrorReviewUpsert(byId.get(it.questionId) ?? it);
}

export function removeReviewItem(questionId: string): void {
  writeJSON(REVIEW_KEY, getReviewBank().filter((b) => b.questionId !== questionId));
  mirrorReviewDelete(questionId);
}

/** Remove a question from the bank once it has been answered correctly again. */
export function clearReviewItemIfPresent(questionId: string): void {
  const bank = getReviewBank();
  if (bank.some((b) => b.questionId === questionId)) {
    writeJSON(REVIEW_KEY, bank.filter((b) => b.questionId !== questionId));
    mirrorReviewDelete(questionId);
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
      mirrorReviewUpsert(bank[idx]);
    }
    return;
  }
  const streak = (bank[idx].correctStreak ?? 0) + 1;
  if (streak >= 2) {
    writeJSON(REVIEW_KEY, bank.filter((b) => b.questionId !== questionId));
    mirrorReviewDelete(questionId);
  } else {
    bank[idx] = { ...bank[idx], correctStreak: streak };
    writeJSON(REVIEW_KEY, bank);
    mirrorReviewUpsert(bank[idx]);
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

// ── Server sync ─────────────────────────────────────────────────────────────
// localStorage stays the synchronous source of truth (no consumer changes);
// these mirror writes to Supabase and merge the server copy in on login so
// attempts and the Review Bank follow the user across devices/browsers.
let currentUserId: string | null = null;

/** Set (or clear, on sign-out) the account that store writes mirror to. */
export function setQuestionBankUserId(id: string | null): void {
  currentUserId = id;
}

function mirrorAttempt(a: BankAttempt): void {
  if (!currentUserId) return;
  void (supabase.from as any)('qb_attempts')
    .upsert({
      user_id: currentUserId,
      id: a.id,
      product_slug: a.productSlug,
      bank_type: a.bankType,
      mode: a.mode,
      score: a.score,
      correct: a.correct,
      total: a.total,
      passed: a.passed,
      pass_mark: a.passMark,
      date_iso: a.dateISO,
      duration_sec: a.durationSec,
      category_breakdown: a.categoryBreakdown,
    })
    .then(undefined, () => {});
}

function mirrorReviewUpsert(it: ReviewItem): void {
  if (!currentUserId) return;
  void (supabase.from as any)('qb_review_bank')
    .upsert({
      user_id: currentUserId,
      question_id: it.questionId,
      product_slug: it.productSlug,
      bank_type: it.bankType,
      category: it.category,
      question: it.question,
      options: it.options,
      correct_answer: it.correctAnswer,
      explanation: it.explanation,
      status: it.status,
      date_iso: it.dateISO,
      correct_streak: it.correctStreak ?? 0,
      updated_at: new Date().toISOString(),
    })
    .then(undefined, () => {});
}

function mirrorReviewDelete(questionId: string): void {
  if (!currentUserId) return;
  void (supabase.from as any)('qb_review_bank')
    .delete()
    .eq('user_id', currentUserId)
    .eq('question_id', questionId)
    .then(undefined, () => {});
}

/**
 * Pull the account's attempts + Review Bank from Supabase and merge with the
 * local cache (union; the later `dateISO` wins on conflict), then push any
 * local-only rows up. Safe to call on every login; falls back to localStorage
 * if offline.
 */
export async function syncQuestionBankFromServer(userId: string): Promise<void> {
  currentUserId = userId;
  try {
    const [aRes, rRes] = await Promise.all([
      (supabase.from as any)('qb_attempts').select('*').eq('user_id', userId),
      (supabase.from as any)('qb_review_bank').select('*').eq('user_id', userId),
    ]);

    const aRows = aRes?.data as any[] | null;
    if (Array.isArray(aRows)) {
      const local = getAttempts();
      const byId = new Map<string, BankAttempt>(local.map((a) => [a.id, a]));
      for (const r of aRows) {
        if (byId.has(r.id)) continue;
        byId.set(r.id, {
          id: r.id,
          productSlug: r.product_slug,
          bankType: r.bank_type,
          mode: r.mode,
          score: r.score,
          correct: r.correct,
          total: r.total,
          passed: r.passed,
          passMark: r.pass_mark,
          dateISO: new Date(r.date_iso).toISOString(),
          durationSec: r.duration_sec ?? 0,
          categoryBreakdown: r.category_breakdown ?? {},
        });
      }
      const merged = Array.from(byId.values())
        .sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1))
        .slice(0, MAX_ATTEMPTS);
      writeJSON(ATTEMPTS_KEY, merged);
      const serverIds = new Set(aRows.map((r) => r.id));
      for (const a of local) if (!serverIds.has(a.id)) mirrorAttempt(a);
    }

    const rRows = rRes?.data as any[] | null;
    if (Array.isArray(rRows)) {
      const local = getReviewBank();
      const byQ = new Map<string, ReviewItem>(local.map((it) => [it.questionId, it]));
      for (const r of rRows) {
        const serverItem: ReviewItem = {
          questionId: r.question_id,
          productSlug: r.product_slug,
          bankType: r.bank_type,
          category: r.category,
          question: r.question,
          options: r.options ?? [],
          correctAnswer: r.correct_answer,
          explanation: r.explanation ?? '',
          status: r.status,
          dateISO: new Date(r.date_iso).toISOString(),
          correctStreak: r.correct_streak ?? 0,
        };
        const existing = byQ.get(r.question_id);
        if (!existing || existing.dateISO < serverItem.dateISO) byQ.set(r.question_id, serverItem);
      }
      writeJSON(REVIEW_KEY, Array.from(byQ.values()));
      const serverQ = new Set(rRows.map((r) => r.question_id));
      for (const it of local) if (!serverQ.has(it.questionId)) mirrorReviewUpsert(it);
    }
  } catch {
    /* offline / not signed in — localStorage stays authoritative */
  }
}
