import { useState, useEffect, useRef, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getVideoEmbedInfo } from '@/components/video-editing/videoUtils';
import type { TrainingVideo } from '@/hooks/useProducts';

// Safe JSON stringify that skips DOM nodes and circular references
function safeStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj, (_key, value) => {
      if (value instanceof HTMLElement || value instanceof Node) return undefined;
      if (typeof value === 'object' && value !== null && value.$$typeof) return undefined;
      return value;
    });
  } catch {
    return '{}';
  }
}

interface UseVideoManagementProps {
  initialVideos: TrainingVideo[];
  onSave: (newVideos: TrainingVideo[]) => Promise<void>;
  productId?: string;
}

export function useVideoManagement({ initialVideos, onSave, productId }: UseVideoManagementProps) {
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
    category: '',
    rich_content: undefined,
    legacy_fields: undefined
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [emptyFolders, setEmptyFolders] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Store initial state for comparison to detect changes
  const initialVideosRef = useRef<string>(safeStringify(initialVideos || []));

  // Reset state when product changes (productId switches)
  useEffect(() => {
    console.log('📹 useVideoManagement: Product changed, resetting state', {
      productId,
      count: initialVideos?.length || 0,
    });
    setEditVideos(initialVideos || []);
    initialVideosRef.current = safeStringify(initialVideos || []);
    setEditingIndex(null);
    setEmptyFolders([]);
    setSaveJustCompleted(false);
  }, [productId]);

  // Track whether there are unsaved content changes
  // Use a forced override flag for immediately after save (before React re-renders)
  const [saveJustCompleted, setSaveJustCompleted] = useState(false);

  const hasContentChanges = useMemo(() => {
    if (saveJustCompleted) return false;
    const currentState = safeStringify(editVideos);
    return currentState !== initialVideosRef.current;
  }, [editVideos, saveJustCompleted]);

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
      category: '',
      rich_content: undefined,
      legacy_fields: undefined
    });
  };

  const handleSave = async (videosToSave?: TrainingVideo[]) => {
    setSaving(true);
    // Use provided videos or fall back to current editVideos state
    const videos = videosToSave ?? editVideos;
    console.log('🎥 VideoManagement handleSave called with:', videos);
    console.log('🎥 Number of videos to save:', videos.length);
    console.log('🎥 onSave function:', onSave);
    console.log('🎥 videos data:', JSON.stringify(videos, null, 2));
    
    try {
      console.log('🎥 Calling onSave function...');
      const result = await onSave(videos);
      console.log('🎥 onSave returned:', result);
      
      // Update both the state and the initial ref to reflect the saved state
      setEditVideos(videos);
      initialVideosRef.current = JSON.stringify(videos);
      // Immediately mark save as complete so save bar hides
      setSaveJustCompleted(true);

      setIsEditing(false);
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
        videos: videos,
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
    // Reset to initial state
    const initialState = JSON.parse(initialVideosRef.current);
    setEditVideos(initialState);
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

  const addQuiz = (category?: string) => {
    const quizItem: TrainingVideo = {
      id: `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Quiz',
      url: '',
      type: 'quiz',
      order: editVideos.length,
      category: category || '',
      quiz_config: { questions: [] },
    };
    setEditVideos([...editVideos, quizItem]);
    setEditingIndex(editVideos.length);
    toast({ title: "Quiz Added", description: "Configure quiz questions, then save." });
  };

  const addAssignment = (category?: string) => {
    const assignmentItem: TrainingVideo = {
      id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Assignment',
      url: '',
      type: 'assignment',
      order: editVideos.length,
      category: category || '',
      assignment_config: { submission_type: 'text', prompt: '' },
    };
    setEditVideos([...editVideos, assignmentItem]);
    setEditingIndex(editVideos.length);
    toast({ title: "Assignment Added", description: "Configure the assignment, then save." });
  };

  const updateVideo = (index: number, updatedVideo: TrainingVideo) => {
    const updated = [...editVideos];
    updated[index] = updatedVideo;
    setEditVideos(updated);
    // Clear the save-complete flag so changes are detected again
    if (saveJustCompleted) setSaveJustCompleted(false);
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
      // Revert to the previous state before deletion
      setEditVideos(initialVideos);
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
    hasContentChanges,

    // Actions
    setIsEditing,
    setNewVideo,
    setEditingIndex,
    setEditVideos,
    handleSave,
    handleCancel,
    addVideo,
    addQuiz,
    addAssignment,
    updateVideo,
    removeVideo,
    moveVideo,
    addEmptyFolder,
    removeEmptyFolder
  };
}