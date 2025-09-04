import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getVideoEmbedInfo } from '@/components/video-editing/videoUtils';
import type { TrainingVideo } from '@/hooks/useProducts';

interface UseVideoManagementProps {
  initialVideos: TrainingVideo[];
  onSave: (newVideos: TrainingVideo[]) => Promise<void>;
}

export function useVideoManagement({ initialVideos, onSave }: UseVideoManagementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editVideos, setEditVideos] = useState<TrainingVideo[]>(initialVideos || []);
  const [newVideo, setNewVideo] = useState<TrainingVideo>({ 
    id: '', 
    title: '', 
    url: '', 
    description: '', 
    notes: '',
    transcript: '',
    duration: undefined,
    order: editVideos.length,
    category: ''
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [emptyFolders, setEmptyFolders] = useState<string[]>([]);
  const { toast } = useToast();

  const resetNewVideo = () => {
    setNewVideo({ 
      id: '', 
      title: '', 
      url: '', 
      description: '', 
      notes: '',
      transcript: '',
      duration: undefined,
      order: editVideos.length,
      category: ''
    });
  };

  const handleSave = async () => {
    setSaving(true);
    console.log('🎥 VideoManagement handleSave called with:', editVideos);
    console.log('🎥 Number of videos to save:', editVideos.length);
    console.log('🎥 onSave function:', onSave);
    console.log('🎥 editVideos data:', JSON.stringify(editVideos, null, 2));
    
    try {
      console.log('🎥 Calling onSave function...');
      const result = await onSave(editVideos);
      console.log('🎥 onSave returned:', result);
      
      setIsEditing(false);
      setEditingIndex(null);
      console.log('✅ VideoManagement save successful');
      toast({
        title: "Saved",
        description: "Training videos updated successfully",
      });
    } catch (error) {
      console.error('❌ VideoManagement save failed:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        editVideos: editVideos,
        onSaveFunction: onSave.toString()
      });
      toast({
        title: "Error", 
        description: `Failed to save videos: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      setEditVideos(initialVideos || []);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditVideos(initialVideos || []);
    resetNewVideo();
    setEditingIndex(null);
    setIsEditing(false);
  };

  const addVideo = () => {
    if (newVideo.title.trim() && newVideo.url.trim()) {
      const videoInfo = getVideoEmbedInfo(newVideo.url);
      console.log('🎥 Video info for URL:', newVideo.url, videoInfo);
      if (videoInfo) {
        const videoWithId = {
          ...newVideo,
          id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          order: editVideos.length
        };
        console.log('🎥 Adding video:', videoWithId);
        setEditVideos([...editVideos, videoWithId]);
        resetNewVideo();
        setNewVideo(prev => ({ ...prev, order: editVideos.length + 1 }));
        toast({
          title: "Video Added",
          description: `"${videoWithId.title}" has been added. Don't forget to save!`,
        });
      } else {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid YouTube, Vimeo, Loom, or Wistia URL",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Missing Information",
        description: "Please enter both title and URL for the video",
        variant: "destructive",
      });
    }
  };

  const updateVideo = (index: number, updatedVideo: TrainingVideo) => {
    const updated = [...editVideos];
    updated[index] = updatedVideo;
    setEditVideos(updated);
  };

  const removeVideo = async (index: number) => {
    const updated = editVideos.filter((_, i) => i !== index);
    // Reorder remaining videos
    const reordered = updated.map((video, i) => ({ ...video, order: i }));
    setEditVideos(reordered);
    
    // Auto-save after deletion
    try {
      setSaving(true);
      console.log('🎥 Auto-saving after video deletion:', reordered);
      await onSave(reordered);
      console.log('✅ Auto-save successful after video deletion');
    } catch (error) {
      console.error('❌ Auto-save failed after video deletion:', error);
      toast({
        title: "Auto-save Failed",
        description: "Video was removed locally but not saved. Please save manually.",
        variant: "destructive",
      });
      // Revert the local change if save failed
      setEditVideos(editVideos);
    } finally {
      setSaving(false);
    }
  };

  const moveVideo = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= editVideos.length) return;

    const updated = [...editVideos];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    
    // Update order numbers
    const reordered = updated.map((video, i) => ({ ...video, order: i }));
    setEditVideos(reordered);
  };

  const addEmptyFolder = (folderName: string) => {
    if (!emptyFolders.includes(folderName)) {
      setEmptyFolders(prev => [...prev, folderName]);
    }
  };

  const removeEmptyFolder = (folderName: string) => {
    setEmptyFolders(prev => prev.filter(f => f !== folderName));
  };

  return {
    // State
    isEditing,
    editVideos,
    newVideo,
    editingIndex,
    saving,
    emptyFolders,
    
    // Actions
    setIsEditing,
    setNewVideo,
    setEditingIndex,
    handleSave,
    handleCancel,
    addVideo,
    updateVideo,
    removeVideo,
    moveVideo,
    addEmptyFolder,
    removeEmptyFolder
  };
}