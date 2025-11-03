import { useState, useEffect, useCallback, useMemo } from 'react';
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

export function useVideoProgress(productId: string) {
  const [videoProgress, setVideoProgress] = useState<VideoProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's video progress for this product
  useEffect(() => {
    if (!user || !productId) return;

    async function fetchVideoProgress() {
      try {
        const { data, error } = await supabase
          .from('video_progress')
          .select('*')
          .eq('product_id', productId)
          .eq('user_id', user.id);

        if (error) throw error;
        setVideoProgress(data || []);
      } catch (error) {
        console.error('Error fetching video progress:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVideoProgress();
  }, [user, productId]);

  // Update video progress
  const updateVideoProgress = async (
    videoId: string,
    updates: Partial<Pick<VideoProgress, 'completed' | 'watch_time_seconds' | 'completion_percentage'>>
  ) => {
    // Require authenticated user
    if (!user) return;

    try {
      const existingProgress = videoProgress.find(p => p.video_id === videoId);
      
      const progressData = {
        user_id: user.id,
        product_id: productId,
        video_id: videoId,
        ...updates,
        completed_at: updates.completed ? new Date().toISOString() : null,
      };

      if (existingProgress) {
        const { data, error } = await supabase
          .from('video_progress')
          .update(progressData)
          .eq('id', existingProgress.id)
          .select()
          .single();

        if (error) throw error;
        
        setVideoProgress(prev => 
          prev.map(p => p.id === existingProgress.id ? data : p)
        );
      } else {
        const { data, error } = await supabase
          .from('video_progress')
          .insert(progressData)
          .select()
          .single();

        if (error) throw error;
        setVideoProgress(prev => [...prev, data]);
      }

      // Award XP for completion (only if user is authenticated)
      if (updates.completed && user) {
        await supabase.from('learning_progress').insert({
          user_id: user.id,
          category_id: productId,
          product_id: productId,
          progress_type: 'video_completed',
          xp_earned: 10
        });

        toast({
          title: "Video Completed! 🎉",
          description: "+10 XP earned",
        });
      } else if (updates.completed) {
        toast({
          title: "Video Completed! 🎉",
          description: "Great job on finishing this video!",
        });
      }
    } catch (error) {
      console.error('Error updating video progress:', error);
      toast({
        title: "Error",
        description: "Failed to update video progress",
        variant: "destructive",
      });
    }
  };

  // Mark video as complete
  const markVideoComplete = useCallback(async (videoId: string) => {
    await updateVideoProgress(videoId, {
      completed: true,
      completion_percentage: 100
    });
  }, [updateVideoProgress]);

  // Update watch time
  const updateWatchTime = useCallback(async (videoId: string, watchTime: number, percentage: number) => {
    await updateVideoProgress(videoId, {
      watch_time_seconds: watchTime,
      completion_percentage: percentage
    });
  }, [updateVideoProgress]);

  // Get progress for specific video
  const getVideoProgress = useCallback((videoId: string) => {
    return videoProgress.find(p => p.video_id === videoId);
  }, [videoProgress]);

  // Calculate overall course progress
  const getCourseProgress = useCallback((totalVideos: number) => {
    const completedVideos = videoProgress.filter(p => p.completed).length;
    return totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
  }, [videoProgress]);

  return {
    videoProgress,
    loading,
    updateVideoProgress,
    markVideoComplete,
    updateWatchTime,
    getVideoProgress,
    getCourseProgress
  };
}