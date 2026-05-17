import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface VideoProgress {
  id: string;
  user_id: string;
  product_id: string;
  video_id: string;
  completed: boolean;
  watch_time_seconds: number;
  completion_percentage: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

/** Stable React Query key — invalidate when a video is completed/un-completed
 * or the user changes. */
function videoProgressQueryKey(productId: string, userId: string | undefined) {
  return ['video-progress', productId, userId] as const;
}

/**
 * useVideoProgress
 *
 * Previously implemented as `useState + useEffect` — every component remount
 * (e.g. switching from Course Content tab to Resources tab) refetched the
 * entire video_progress row set from Supabase. On a product with 50 videos
 * that was 50 rows × the round-trip latency per tab click.
 *
 * Migrated to TanStack Query so the rows are cached for 5 minutes and
 * deduplicated across simultaneous consumers (ProductTrainingVideos +
 * VideoLearningInterface + ProductModuleCourseLayout often run side-by-side).
 * Mutations now invalidate the cache on success rather than mutating local
 * state — TanStack Query's optimistic-update path keeps the UI snappy without
 * the manual `setVideoProgress(prev => ...)` plumbing.
 */
export function useVideoProgress(productId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: videoProgress = [], isLoading } = useQuery({
    queryKey: videoProgressQueryKey(productId, user?.id),
    queryFn: async (): Promise<VideoProgress[]> => {
      if (!user?.id || !productId) return [];
      const { data, error } = await supabase
        .from('video_progress')
        .select(
          'id, user_id, product_id, video_id, completed, watch_time_seconds, completion_percentage, completed_at, created_at, updated_at',
        )
        .eq('product_id', productId)
        .eq('user_id', user.id);
      if (error) throw error;
      return (data || []) as VideoProgress[];
    },
    enabled: !!user && !!productId,
    // Progress changes only on user action (mark complete / scrub video);
    // those mutations invalidate this key directly, so we don't need to
    // refetch on tab switches or window-focus changes.
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Update video progress — server write, then invalidate so the next read
  // gets the fresh row. (Optimistic update could be layered on top if the
  // observed latency is noticeable; mutations are infrequent so the simple
  // invalidate-on-success keeps the code straightforward.)
  const updateVideoProgress = useCallback(
    async (
      videoId: string,
      updates: Partial<
        Pick<VideoProgress, 'completed' | 'watch_time_seconds' | 'completion_percentage'>
      >,
    ) => {
      if (!user) return;
      try {
        const existing = videoProgress.find((p) => p.video_id === videoId);
        const progressData = {
          user_id: user.id,
          product_id: productId,
          video_id: videoId,
          ...updates,
          completed_at: updates.completed ? new Date().toISOString() : null,
        };

        if (existing) {
          const { error } = await supabase
            .from('video_progress')
            .update(progressData)
            .eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('video_progress')
            .insert(progressData);
          if (error) throw error;
        }

        queryClient.invalidateQueries({
          queryKey: videoProgressQueryKey(productId, user.id),
        });

        if (updates.completed) {
          toast({ title: 'Video Completed! 🎉' });
        } else if (updates.completed === false) {
          toast({ title: 'Marked as incomplete' });
        }
      } catch (error) {
        console.error('Error updating video progress:', error);
        toast({
          title: 'Error',
          description: 'Failed to update video progress',
          variant: 'destructive',
        });
      }
    },
    [user, productId, videoProgress, queryClient, toast],
  );

  const markVideoComplete = useCallback(
    async (videoId: string) => {
      await updateVideoProgress(videoId, { completed: true, completion_percentage: 100 });
    },
    [updateVideoProgress],
  );

  const updateWatchTime = useCallback(
    async (videoId: string, watchTime: number, percentage: number) => {
      await updateVideoProgress(videoId, {
        watch_time_seconds: watchTime,
        completion_percentage: percentage,
      });
    },
    [updateVideoProgress],
  );

  const getVideoProgress = useCallback(
    (videoId: string) => videoProgress.find((p) => p.video_id === videoId),
    [videoProgress],
  );

  const getCourseProgress = useCallback(
    (totalVideos: number) => {
      const completedVideos = videoProgress.filter((p) => p.completed).length;
      return totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
    },
    [videoProgress],
  );

  return {
    videoProgress,
    loading: isLoading,
    updateVideoProgress,
    markVideoComplete,
    updateWatchTime,
    getVideoProgress,
    getCourseProgress,
  };
}
