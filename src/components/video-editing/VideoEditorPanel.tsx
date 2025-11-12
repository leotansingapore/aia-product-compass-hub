import { useState } from 'react';
import { VideoEditForm } from './VideoEditForm';
import { AddVideoForm } from './AddVideoForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import type { TrainingVideo } from '@/hooks/useProducts';

interface VideoEditorPanelProps {
  editVideos: TrainingVideo[];
  editingIndex: number | null;
  newVideo: TrainingVideo;
  existingCategories: string[];
  onEditingIndexChange: (index: number | null) => void;
  onUpdateVideo: (index: number, updatedVideo: TrainingVideo) => void;
  onNewVideoChange: (video: TrainingVideo) => void;
  onAddVideo: () => void;
  onCreateCategory: (categoryName: string) => void;
}

export function VideoEditorPanel({
  editVideos,
  editingIndex,
  newVideo,
  existingCategories,
  onEditingIndexChange,
  onUpdateVideo,
  onNewVideoChange,
  onAddVideo,
  onCreateCategory
}: VideoEditorPanelProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  console.log('🎬 VideoEditorPanel: Rendering', {
    editingIndex,
    hasVideo: editingIndex !== null && editVideos[editingIndex] !== undefined,
    videoTitle: editingIndex !== null ? editVideos[editingIndex]?.title : 'none'
  });

  const handleAddVideo = () => {
    onAddVideo();
    setIsAddDialogOpen(false);
  };

  return (
    <div className="flex-1 h-full">
      {editingIndex !== null ? (
        <div className="border rounded-lg p-6 bg-card h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Edit Video</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditingIndexChange(null)}
            >
              Close
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            <VideoEditForm
              video={editVideos[editingIndex]}
              onUpdate={(updatedVideo) => onUpdateVideo(editingIndex, updatedVideo)}
              existingCategories={existingCategories}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/30 h-full flex items-center justify-center">
          <p className="text-sm">Select a video from the sidebar to edit</p>
        </div>
      )}
    </div>
  );
}