import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ProductProgress {
  completedCount: number;
  totalCount: number;
  percentage: number;
}

/**
 * Fetches video completion progress for multiple products in a single query.
 * Used on category pages to show % completion on product cards.
 */
export function useBatchVideoProgress(productIds: string[], videoCountsByProduct: Record<string, number>) {
  const [progressMap, setProgressMap] = useState<Record<string, ProductProgress>>({});
  const { user } = useAuth();

  const stableIds = useMemo(() => productIds.sort().join(','), [productIds]);

  useEffect(() => {
    if (!user || productIds.length === 0) return;

    async function fetchBatchProgress() {
      try {
        const { data, error } = await supabase
          .from('video_progress')
          .select('product_id, video_id, completed')
          .eq('user_id', user!.id)
          .eq('completed', true)
          .in('product_id', productIds);

        if (error) throw error;

        // Count completed videos per product
        const completedByProduct: Record<string, number> = {};
        (data || []).forEach(row => {
          completedByProduct[row.product_id] = (completedByProduct[row.product_id] || 0) + 1;
        });

        // Build progress map
        const map: Record<string, ProductProgress> = {};
        productIds.forEach(id => {
          const total = videoCountsByProduct[id] || 0;
          const completed = completedByProduct[id] || 0;
          map[id] = {
            completedCount: completed,
            totalCount: total,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
          };
        });

        setProgressMap(map);
      } catch (error) {
        console.error('Error fetching batch video progress:', error);
      }
    }

    fetchBatchProgress();
  }, [user, stableIds]);

  return progressMap;
}
