import { useState, useEffect } from 'react';
import { fetchVideoDuration } from '@/components/video-editing/videoUtils';
import type { TrainingVideo } from '@/hooks/useProducts';

interface UseVideoFormProps {
  initialVideo: TrainingVideo;
  onUpdate: (updatedVideo: TrainingVideo) => void;
}

export function useVideoForm({ initialVideo, onUpdate }: UseVideoFormProps) {
  const [editVideo, setEditVideo] = useState<TrainingVideo>(initialVideo);
  const [isDetectingDuration, setIsDetectingDuration] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  // Sync editVideo state when initialVideo prop changes (when switching between videos)
  useEffect(() => {
    setEditVideo(initialVideo);
  }, [initialVideo]);

  // Auto-detect duration when URL changes
  useEffect(() => {
    const detectDuration = async () => {
      if (editVideo.url.trim() && editVideo.url !== initialVideo.url) {
        setIsDetectingDuration(true);
        try {
          const duration = await fetchVideoDuration(editVideo.url);
          if (duration) {
            const updated = { ...editVideo, duration };
            setEditVideo(updated);
            onUpdate(updated);
          }
        } catch (error) {
          console.warn('Failed to detect video duration:', error);
        } finally {
          setIsDetectingDuration(false);
        }
      }
    };

    const timeoutId = setTimeout(detectDuration, 500); // Debounce URL changes
    return () => clearTimeout(timeoutId);
  }, [editVideo.url, initialVideo.url, onUpdate]);

  const handleChange = (field: keyof TrainingVideo, value: any) => {
    const updated = { ...editVideo, [field]: value };
    setEditVideo(updated);
    onUpdate(updated);
  };

  const resetForm = () => {
    setEditVideo(initialVideo);
  };

  return {
    editVideo,
    isDetectingDuration,
    newCategoryName,
    showNewCategoryInput,
    setNewCategoryName,
    setShowNewCategoryInput,
    handleChange,
    resetForm
  };
}