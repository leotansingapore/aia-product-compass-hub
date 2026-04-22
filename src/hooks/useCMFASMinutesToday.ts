import { useCallback, useEffect, useMemo, useState } from 'react';
import { startOfDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { moduleIdToProductId } from '@/data/cmfasModuleData';

const CMFAS_PRODUCT_IDS = Object.values(moduleIdToProductId);

/**
 * Minutes studied today across CMFAS products. Sums
 * `video_progress.watch_time_seconds` for rows whose `product_id` is one of
 * the CMFAS modules AND whose `updated_at` is from today.
 *
 * Refetches on window focus so the hub reflects real progress when the
 * learner tabs back from a lesson page.
 */
export function useCMFASMinutesToday() {
  const { user } = useAuth();
  const [minutes, setMinutes] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchMinutes = useCallback(async () => {
    if (!user) {
      setMinutes(0);
      return;
    }
    setLoading(true);
    try {
      const todayStart = startOfDay(new Date()).toISOString();
      const { data, error } = await supabase
        .from('video_progress')
        .select('watch_time_seconds')
        .eq('user_id', user.id)
        .in('product_id', CMFAS_PRODUCT_IDS)
        .gte('updated_at', todayStart);

      if (error) throw error;
      const totalSeconds = (data ?? []).reduce(
        (sum, row) => sum + (row.watch_time_seconds ?? 0),
        0,
      );
      setMinutes(Math.floor(totalSeconds / 60));
    } catch (err) {
      console.warn('useCMFASMinutesToday: fetch failed', err);
      // Keep the last-known value rather than resetting to 0 on a transient
      // error — the stat strip should not flicker.
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMinutes();
  }, [fetchMinutes]);

  useEffect(() => {
    const onFocus = () => fetchMinutes();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchMinutes]);

  return useMemo(() => ({ minutes, loading, refetch: fetchMinutes }), [minutes, loading, fetchMinutes]);
}
