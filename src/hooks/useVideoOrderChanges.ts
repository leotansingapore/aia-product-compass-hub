import { useState, useCallback, useEffect } from 'react';
import type { TrainingVideo } from '@/hooks/useProducts';

interface VideoOrderChange {
  id: string;
  originalOrder: number;
  newOrder: number;
  originalCategory?: string;
  newCategory?: string;
}

interface UseVideoOrderChangesProps {
  videos: TrainingVideo[];
  onSave: (updatedVideos: TrainingVideo[]) => Promise<void>;
}

export function useVideoOrderChanges({ videos, onSave }: UseVideoOrderChangesProps) {
  const [pendingVideos, setPendingVideos] = useState<TrainingVideo[]>(videos);
  const [changes, setChanges] = useState<Map<string, VideoOrderChange>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  // Sync pendingVideos when videos prop changes (external updates)
  useEffect(() => {
    if (changes.size === 0) {
      setPendingVideos(videos);
    }
  }, [videos, changes.size]);

  const hasPendingChanges = changes.size > 0;

  const trackChange = useCallback((videoId: string, originalVideo: TrainingVideo, newVideo: TrainingVideo) => {
    setChanges(prev => {
      const newChanges = new Map(prev);
      const existingChange = newChanges.get(videoId);

      const change: VideoOrderChange = {
        id: videoId,
        originalOrder: existingChange?.originalOrder ?? originalVideo.order,
        newOrder: newVideo.order,
        originalCategory: existingChange?.originalCategory ?? originalVideo.category,
        newCategory: newVideo.category,
      };

      // If back to original state, remove the change
      if (
        change.originalOrder === change.newOrder &&
        change.originalCategory === change.newCategory
      ) {
        newChanges.delete(videoId);
      } else {
        newChanges.set(videoId, change);
      }

      return newChanges;
    });
  }, []);

  const updatePendingVideos = useCallback((updatedVideos: TrainingVideo[]) => {
    console.log('🔄 useVideoOrderChanges: Updating pending videos', {
      count: updatedVideos.length,
      firstVideo: updatedVideos[0]?.title,
      lastVideo: updatedVideos[updatedVideos.length - 1]?.title
    });

    setPendingVideos(prevPending => {
      // Track changes for all modified videos
      updatedVideos.forEach(newVideo => {
        const originalVideo = videos.find(v => v.id === newVideo.id);
        if (originalVideo) {
          if (
            originalVideo.order !== newVideo.order ||
            originalVideo.category !== newVideo.category
          ) {
            trackChange(newVideo.id, originalVideo, newVideo);
          }
        }
      });

      return updatedVideos;
    });
  }, [videos, trackChange]);

  const saveChanges = useCallback(async () => {
    if (!hasPendingChanges) return;

    console.log('💾 useVideoOrderChanges: Saving changes', {
      changeCount: changes.size,
      totalVideos: pendingVideos.length
    });

    setIsSaving(true);
    try {
      await onSave(pendingVideos);
      setChanges(new Map()); // Clear changes on successful save
      console.log('✅ useVideoOrderChanges: Changes saved successfully');
    } catch (error) {
      console.error('❌ useVideoOrderChanges: Failed to save video order changes:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [hasPendingChanges, pendingVideos, onSave, changes.size]);

  const discardChanges = useCallback(() => {
    setPendingVideos(videos);
    setChanges(new Map());
  }, [videos]);

  // Clear change tracking without resetting pendingVideos (used after successful save)
  const clearChangeTracking = useCallback(() => {
    setChanges(new Map());
  }, []);

  const getChangeCount = useCallback(() => {
    return changes.size;
  }, [changes]);

  const getChangeSummary = useCallback(() => {
    const summary = {
      reordered: 0,
      moved: 0,
      both: 0,
    };

    changes.forEach(change => {
      const orderChanged = change.originalOrder !== change.newOrder;
      const categoryChanged = change.originalCategory !== change.newCategory;

      if (orderChanged && categoryChanged) {
        summary.both++;
      } else if (orderChanged) {
        summary.reordered++;
      } else if (categoryChanged) {
        summary.moved++;
      }
    });

    return summary;
  }, [changes]);

  return {
    pendingVideos,
    updatePendingVideos,
    hasPendingChanges,
    saveChanges,
    discardChanges,
    clearChangeTracking,
    isSaving,
    getChangeCount,
    getChangeSummary,
  };
}
