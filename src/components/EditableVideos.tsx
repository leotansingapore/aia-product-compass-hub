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
  const [editVideos, setEditVideos] = useState<TrainingVideo[]>(videos);
  const [newVideo, setNewVideo] = useState<TrainingVideo>({ 
    id: '', 
    title: '', 
    url: '', 
    description: '', 
    notes: '',
    transcript: '',
    duration: undefined,
    order: editVideos.length
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const { isAdminMode } = useAdmin();
  const { toast } = useToast();

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
      order: videos.length
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
          order: editVideos.length + 1
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
    return <VideoDisplay videos={videos} className={className} />;
  }

  // Admin editing mode
  if (isEditing) {
    return (
      <div className="space-y-6">
        {editVideos.map((video, index) => (
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
          />
        ))}

        <AddVideoForm
          newVideo={newVideo}
          onUpdate={setNewVideo}
          onAdd={addVideo}
          disabled={!newVideo.title.trim() || !newVideo.url.trim()}
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
  return (
    <AdminVideoPreview
      videos={videos}
      className={className}
      onClick={() => setIsEditing(true)}
    />
  );
}