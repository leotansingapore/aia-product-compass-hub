import { useCallback, useEffect, useMemo, useState } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { useAuth } from './useAuth';

/**
 * Learner-set personal target exam date. localStorage-backed for v1 — one key
 * per user. Returns parsed Date when set, plus a convenience `daysUntil`
 * signed integer (negative means the date is in the past).
 *
 * Stored as an ISO yyyy-mm-dd string so it's stable across timezones for the
 * purpose of "how many days until that calendar date".
 */
export function useTargetExamDate() {
  const { user } = useAuth();
  const storageKey = useMemo(() => (user ? `cmfas-target-exam-date-${user.id}` : null), [user]);

  const [isoDate, setIsoDate] = useState<string | null>(null);

  useEffect(() => {
    if (!storageKey) {
      setIsoDate(null);
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      setIsoDate(raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null);
    } catch {
      setIsoDate(null);
    }
  }, [storageKey]);

  const setDate = useCallback(
    (iso: string | null) => {
      if (!storageKey) return;
      try {
        if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
          localStorage.setItem(storageKey, iso);
          setIsoDate(iso);
        } else {
          localStorage.removeItem(storageKey);
          setIsoDate(null);
        }
      } catch {
        // Storage unavailable — keep in-memory state so the UI still updates.
        setIsoDate(iso);
      }
    },
    [storageKey],
  );

  const clear = useCallback(() => setDate(null), [setDate]);

  const date = useMemo(() => (isoDate ? new Date(`${isoDate}T00:00:00`) : null), [isoDate]);
  const daysUntil = useMemo(
    () => (date ? differenceInCalendarDays(date, new Date()) : null),
    [date],
  );

  return { isoDate, date, daysUntil, setDate, clear };
}
