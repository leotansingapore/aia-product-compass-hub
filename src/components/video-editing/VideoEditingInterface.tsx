import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { VideoListItem } from './VideoListItem';
import { AddVideoForm } from './AddVideoForm';
import type { TrainingVideo } from '@/hooks/useProducts';

interface VideoEditingInterfaceProps {
  editVideos: TrainingVideo[];
  editingIndex: number | null;
  newVideo: TrainingVideo;
  saving: boolean;
  existingCategories: string[];
  onEditingIndexChange: (index: number | null) => void;
  onUpdateVideo: (index: number, updatedVideo: TrainingVideo) => void;
  onRemoveVideo: (index: number) => void;
  onMoveVideo: (index: number, direction: 'up' | 'down') => void;
  onNewVideoChange: (video: TrainingVideo) => void;
  onAddVideo: () => void;
  onSave: () => void;
  onCancel: () => void;
  onCreateCategory: (categoryName: string) => void;
}

export function VideoEditingInterface({
  editVideos,
  editingIndex,
  newVideo,
  saving,
  existingCategories,
  onEditingIndexChange,
  onUpdateVideo,
  onRemoveVideo,
  onMoveVideo,
  onNewVideoChange,
  onAddVideo,
  onSave,
  onCancel,
  onCreateCategory
}: VideoEditingInterfaceProps) {
  console.log('🎬 VideoEditingInterface: Rendering editing interface');

  // Group videos by category for display
  const videosByCategory = editVideos.reduce((acc, video, index) => {
    const category = video.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ video, index });
    return acc;
  }, {} as Record<string, Array<{ video: TrainingVideo; index: number }>>);

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
                onEdit={() => onEditingIndexChange(index)}
                onUpdate={(updatedVideo) => onUpdateVideo(index, updatedVideo)}
                onSave={() => onEditingIndexChange(null)}
                onCancel={() => onEditingIndexChange(null)}
                onDelete={() => onRemoveVideo(index)}
                onMoveUp={() => onMoveVideo(index, 'up')}
                onMoveDown={() => onMoveVideo(index, 'down')}
                existingCategories={existingCategories}
              />
            ))}
          </div>
        </div>
      ))}

      <AddVideoForm
        newVideo={newVideo}
        onUpdate={onNewVideoChange}
        onAdd={onAddVideo}
        disabled={!newVideo.title.trim() || !newVideo.url.trim()}
        existingCategories={existingCategories}
        onCreateCategory={onCreateCategory}
      />

      <div className="flex gap-2">
        <Button onClick={onSave} disabled={saving}>
          <Check className="h-4 w-4 mr-1" />
          Save Videos
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}