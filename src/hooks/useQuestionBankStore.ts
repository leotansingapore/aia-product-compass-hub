import { useSyncExternalStore } from 'react';
import {
  getAttempts,
  getReviewBank,
  subscribeQuestionBankStore,
  type BankAttempt,
  type ReviewItem,
} from '@/lib/questionBankStore';

/**
 * React bindings for the localStorage-backed Question Bank store.
 * `useSyncExternalStore` keeps every mounted consumer in sync after any
 * mutation (in-tab via pub/sub, cross-tab via the native storage event).
 */

function subscribe(onChange: () => void): () => void {
  const unsub = subscribeQuestionBankStore(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === 'qb-attempts' || e.key === 'qb-review-bank') onChange();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    unsub();
    window.removeEventListener('storage', onStorage);
  };
}

// Cache the snapshots so useSyncExternalStore sees a stable reference until a
// mutation actually changes the underlying JSON (avoids infinite re-renders).
let attemptsCache: { json: string; value: BankAttempt[] } | null = null;
function attemptsSnapshot(): BankAttempt[] {
  const value = getAttempts();
  const json = JSON.stringify(value);
  if (!attemptsCache || attemptsCache.json !== json) attemptsCache = { json, value };
  return attemptsCache.value;
}

let reviewCache: { json: string; value: ReviewItem[] } | null = null;
function reviewSnapshot(): ReviewItem[] {
  const value = getReviewBank();
  const json = JSON.stringify(value);
  if (!reviewCache || reviewCache.json !== json) reviewCache = { json, value };
  return reviewCache.value;
}

export function useBankAttempts(): BankAttempt[] {
  return useSyncExternalStore(subscribe, attemptsSnapshot, () => []);
}

export function useReviewBank(): ReviewItem[] {
  return useSyncExternalStore(subscribe, reviewSnapshot, () => []);
}
