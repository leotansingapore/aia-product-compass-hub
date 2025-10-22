import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { TrainingVideo } from '@/hooks/useProducts';
import { getCMFASModuleVideos, getProductIdFromModuleId } from '@/data/cmfasModuleData';

interface UseCMFASModuleVideosResult {
  videos: TrainingVideo[];
  loading: boolean;
  error: Error | null;
}

/**
 * Custom hook to load CMFAS module videos from database
 * Falls back to static data if database is empty or fails
 *
 * @param moduleId - The module ID from URL (e.g., 'm9', 'onboarding')
 * @returns videos array, loading state, and error if any
 */
export function useCMFASModuleVideos(moduleId: string): UseCMFASModuleVideosResult {
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the product ID for database lookup
        const productId = getProductIdFromModuleId(moduleId);

        if (!productId) {
          throw new Error(`Invalid module ID: ${moduleId}`);
        }

        // Try to load from database
        const { data, error: dbError } = await supabase
          .from('products')
          .select('training_videos')
          .eq('id', productId)
          .single();

        if (dbError && dbError.code !== 'PGRST116') {
          // PGRST116 = not found, which is OK (will use fallback)
          console.error('Error loading CMFAS module videos from database:', dbError);
        }

        // Use database videos if available, otherwise fall back to static data
        if (data && data.training_videos && Array.isArray(data.training_videos)) {
          const dbVideos = data.training_videos as TrainingVideo[];
          // Sort by order property
          const sortedVideos = dbVideos.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setVideos(sortedVideos);
        } else {
          // Fall back to static data from cmfasModuleData.ts
          const staticVideos = getCMFASModuleVideos(moduleId);
          setVideos(staticVideos);
        }
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Failed to load videos');
        setError(errorObj);
        console.error('Error in useCMFASModuleVideos:', errorObj);

        // Even on error, fall back to static data
        const staticVideos = getCMFASModuleVideos(moduleId);
        setVideos(staticVideos);
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) {
      loadVideos();
    }
  }, [moduleId]);

  return { videos, loading, error };
}
