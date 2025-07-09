import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { VideoDisplay } from './video-editing/VideoDisplay';
import { VideoListItem } from './video-editing/VideoListItem';
import { AddVideoForm } from './video-editing/AddVideoForm';
import { AdminVideoPreview } from './video-editing/AdminVideoPreview';
import { getVideoEmbedInfo, fetchVideoDuration } from './video-editing/videoUtils';
import type { TrainingVideo } from '@/hooks/useProducts';

interface EditableVideosProps {
  videos: TrainingVideo[];
  onSave: (newVideos: TrainingVideo[]) => Promise<void>;
  className?: string;
}

export function EditableVideos({ videos, onSave, className = "" }: EditableVideosProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editVideos, setEditVideos] = useState<TrainingVideo[]>(videos || []);
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
  const { isAdminMode } = useAdmin();
  const { toast } = useToast();

  // Debug logging
  console.log('🎬 EditableVideos render:', {
    videosCount: videos?.length || 0,
    isAdminMode,
    isEditing,
    className,
    editVideosCount: editVideos.length
  });

  const handleSave = async () => {
    setSaving(true);
    console.log('🎥 EditableVideos handleSave called with:', editVideos);
    console.log('🎥 Number of videos to save:', editVideos.length);
    
    try {
      await onSave(editVideos);
      setIsEditing(false);
      setEditingIndex(null);
      console.log('✅ EditableVideos save successful');
      toast({
        title: "Saved",
        description: "Training videos updated successfully",
      });
    } catch (error) {
      console.error('❌ EditableVideos save failed:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        editVideos: editVideos
      });
      toast({
        title: "Error", 
        description: `Failed to save videos: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      setEditVideos(videos);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditVideos(videos);
    setNewVideo({ 
      id: '', 
      title: '', 
      url: '', 
      description: '', 
      notes: '',
      transcript: '',
      duration: undefined,
      order: videos.length,
      category: ''
    });
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
        setNewVideo({ 
          id: '', 
          title: '', 
          url: '', 
          description: '', 
          notes: '',
          transcript: '',
          duration: undefined,
          order: editVideos.length + 1,
          category: ''
        });
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

  const removeVideo = (index: number) => {
    const updated = editVideos.filter((_, i) => i !== index);
    // Reorder remaining videos
    const reordered = updated.map((video, i) => ({ ...video, order: i }));
    setEditVideos(reordered);
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

  // Non-admin view
  if (!isAdminMode) {
    console.log('🎬 EditableVideos: Rendering VideoDisplay (non-admin)');
    return <VideoDisplay videos={videos || []} className={className} />;
  }

  console.log('🎬 EditableVideos: Admin mode detected, rendering admin interface');

  // Get existing categories from videos
  const existingCategories = Array.from(new Set(
    editVideos.map(video => video.category).filter(Boolean)
  )).sort();

  const handleCreateCategory = (categoryName: string) => {
    // Category will be added when video is saved
  };

  // Group videos by category for display
  const videosByCategory = editVideos.reduce((acc, video, index) => {
    const category = video.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ video, index });
    return acc;
  }, {} as Record<string, Array<{ video: TrainingVideo; index: number }>>);

  // Admin editing mode
  if (isEditing) {
    console.log('🎬 EditableVideos: Rendering editing interface');
    return (
      <div className="space-y-6">
        {Object.entries(videosByCategory).map(([category, videoItems]) => (
          <div key={category} className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground border-b pb-1">
              {category} ({videoItems.length} video{videoItems.length !== 1 ? 's' : ''})
            </h4>
            <div className="space-y-3 pl-4 border-l-2 border-muted">
              {videoItems.map(({ video, index }) => (
                <VideoListItem
                  key={index}
                  video={video}
                  index={index}
                  isEditing={editingIndex === index}
                  canMoveUp={index > 0}
                  canMoveDown={index < editVideos.length - 1}
                  onEdit={() => setEditingIndex(index)}
                  onUpdate={(updatedVideo) => updateVideo(index, updatedVideo)}
                  onSave={() => setEditingIndex(null)}
                  onCancel={() => setEditingIndex(null)}
                  onDelete={() => removeVideo(index)}
                  onMoveUp={() => moveVideo(index, 'up')}
                  onMoveDown={() => moveVideo(index, 'down')}
                  existingCategories={existingCategories}
                />
              ))}
            </div>
          </div>
        ))}

        <AddVideoForm
          newVideo={newVideo}
          onUpdate={setNewVideo}
          onAdd={addVideo}
          disabled={!newVideo.title.trim() || !newVideo.url.trim()}
          existingCategories={existingCategories}
          onCreateCategory={handleCreateCategory}
        />

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            <Check className="h-4 w-4 mr-1" />
            Save Videos
          </Button>
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Admin preview mode
  console.log('🎬 EditableVideos: Rendering AdminVideoPreview');
  return (
    <AdminVideoPreview
      videos={videos || []}
      className={className}
      onClick={() => {
        console.log('🎬 EditableVideos: AdminVideoPreview clicked, entering edit mode');
        setIsEditing(true);
      }}
    />
  );
}