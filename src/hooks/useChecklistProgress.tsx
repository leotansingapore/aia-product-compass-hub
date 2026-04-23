import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Checklist progress — currently used by the CMFAS study-desk Ready ticks
 * and anywhere else the app needs a per-user, per-item tick.
 *
 * Source of truth is the Supabase table `user_checklist_progress` (see
 * SUPABASE.md). localStorage is only used for:
 *   1. Reading the legacy `checklist-progress-<userId>` key once, so ticks
 *      made before this migration aren't lost.
 *   2. A tiny `checklist-migration-done-<userId>` flag that records whether
 *      the one-time migration has already run for this user on this device.
 *
 * Signed-out users get pure in-memory state.
 *
 * When Supabase is unreachable (pre-migration window, offline, etc.) the
 * hook silently degrades to in-memory behaviour (seeded from legacy
 * localStorage) — no user-visible error, at most a single `console.warn`.
 */

interface ChecklistContextType {
  completedItems: Set<string>;
  completeItem: (itemId: string) => void;
  isItemCompleted: (itemId: string) => boolean;
  getCompletedCount: () => number;
  resetProgress: () => void;
}

const ChecklistContext = createContext<ChecklistContextType>({
  completedItems: new Set(),
  completeItem: () => {},
  isItemCompleted: () => false,
  getCompletedCount: () => 0,
  resetProgress: () => {},
});

const LEGACY_KEY = (userId: string) => `checklist-progress-${userId}`;
const MIGRATION_FLAG = (userId: string) => `checklist-migration-done-${userId}`;

function readLegacyLocalStorage(userId: string): string[] {
  try {
    const raw = localStorage.getItem(LEGACY_KEY(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === 'string');
  } catch {
    return [];
  }
}

function hasRunLegacyMigration(userId: string): boolean {
  try {
    return localStorage.getItem(MIGRATION_FLAG(userId)) === 'true';
  } catch {
    return false;
  }
}

function markLegacyMigrationDone(userId: string): void {
  try {
    localStorage.setItem(MIGRATION_FLAG(userId), 'true');
  } catch {
    // Storage unavailable (private mode, quota). Non-fatal.
  }
}

export function ChecklistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const hydrationRanForUser = useRef<string | null>(null);

  // Hydrate on sign-in: fetch Supabase, migrate legacy localStorage ticks.
  useEffect(() => {
    if (!user) {
      setCompletedItems(new Set());
      hydrationRanForUser.current = null;
      return;
    }
    // Guard against double-running (React Strict Mode).
    if (hydrationRanForUser.current === user.id) return;
    hydrationRanForUser.current = user.id;

    let cancelled = false;

    (async () => {
      // Paint-first: seed from legacy localStorage so the UI doesn't flicker.
      const legacy = readLegacyLocalStorage(user.id);
      if (legacy.length > 0) {
        setCompletedItems(new Set(legacy));
      }

      // Authoritative fetch from Supabase.
      let supabaseItems: string[] = [];
      let supabaseReachable = true;
      try {
        const { data, error } = await supabase
          .from('user_checklist_progress' as never)
          .select('item_id')
          .eq('user_id', user.id);

        if (error) throw error;
        supabaseItems = ((data as Array<{ item_id: string }> | null) ?? []).map(
          (row) => row.item_id,
        );
      } catch (err) {
        supabaseReachable = false;
        console.warn(
          '[useChecklistProgress] Supabase read failed, falling back to localStorage only.',
          err,
        );
      }

      if (cancelled) return;

      if (!supabaseReachable) {
        // Degrade gracefully — localStorage already seeded above.
        return;
      }

      // One-time legacy migration: push any localStorage ticks that Supabase
      // doesn't have yet so no completions are lost from before this refactor.
      const supabaseSet = new Set(supabaseItems);
      if (!hasRunLegacyMigration(user.id) && legacy.length > 0) {
        const missing = legacy.filter((id) => !supabaseSet.has(id));
        if (missing.length > 0) {
          const rows = missing.map((item_id) => ({ user_id: user.id, item_id }));
          try {
            const { error } = await supabase
              .from('user_checklist_progress' as never)
              .upsert(rows as never, {
                onConflict: 'user_id,item_id',
                ignoreDuplicates: true,
              });
            if (error) throw error;
            missing.forEach((id) => supabaseSet.add(id));
          } catch (err) {
            console.warn('[useChecklistProgress] Legacy migration upsert failed.', err);
          }
        }
        markLegacyMigrationDone(user.id);
      }

      setCompletedItems(supabaseSet);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const completeItem = useCallback(
    (itemId: string) => {
      // Optimistic local update.
      setCompletedItems((prev) => {
        if (prev.has(itemId)) return prev;
        const next = new Set(prev);
        next.add(itemId);
        return next;
      });

      if (!user) return;

      // Fire-and-forget upsert. A failed write doesn't rollback state —
      // a later mount/refetch re-syncs truth from Supabase.
      void (async () => {
        try {
          const { error } = await supabase
            .from('user_checklist_progress' as never)
            .upsert(
              { user_id: user.id, item_id: itemId } as never,
              { onConflict: 'user_id,item_id', ignoreDuplicates: true },
            );
          if (error) throw error;
        } catch (err) {
          console.warn(
            '[useChecklistProgress] Supabase write failed — optimistic state retained.',
            err,
          );
        }
      })();
    },
    [user],
  );

  const isItemCompleted = useCallback(
    (itemId: string) => completedItems.has(itemId),
    [completedItems],
  );

  const getCompletedCount = useCallback(
    () => completedItems.size,
    [completedItems],
  );

  const resetProgress = useCallback(() => {
    setCompletedItems(new Set());
    if (!user) return;

    try {
      localStorage.removeItem(LEGACY_KEY(user.id));
      localStorage.removeItem(MIGRATION_FLAG(user.id));
    } catch {
      // Non-fatal.
    }

    void (async () => {
      try {
        const { error } = await supabase
          .from('user_checklist_progress' as never)
          .delete()
          .eq('user_id', user.id);
        if (error) throw error;
      } catch (err) {
        console.warn('[useChecklistProgress] Supabase reset failed.', err);
      }
    })();
  }, [user]);

  const value = useMemo(
    () => ({
      completedItems,
      completeItem,
      isItemCompleted,
      getCompletedCount,
      resetProgress,
    }),
    [completedItems, completeItem, isItemCompleted, getCompletedCount, resetProgress],
  );

  return <ChecklistContext.Provider value={value}>{children}</ChecklistContext.Provider>;
}

export const useChecklistProgress = () => {
  const context = useContext(ChecklistContext);
  if (!context) {
    throw new Error('useChecklistProgress must be used within a ChecklistProvider');
  }
  return context;
};
