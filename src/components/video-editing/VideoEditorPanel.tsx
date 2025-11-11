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
    <div className="space-y-6">
      {editingIndex !== null ? (
        <div className="border rounded-lg p-6 bg-card">
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
          <VideoEditForm
            video={editVideos[editingIndex]}
            onUpdate={(updatedVideo) => onUpdateVideo(editingIndex, updatedVideo)}
            onSave={() => onEditingIndexChange(null)}
            onCancel={() => onEditingIndexChange(null)}
            existingCategories={existingCategories}
          />
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/30">
          <p className="text-sm">Select a video from the sidebar to edit</p>
          <p className="text-xs mt-1">or add a new video with the button below</p>
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full" size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add New Video
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Video</DialogTitle>
          </DialogHeader>
          <AddVideoForm
            newVideo={newVideo}
            onUpdate={onNewVideoChange}
            onAdd={handleAddVideo}
            disabled={!newVideo.title.trim() || !newVideo.url.trim()}
            existingCategories={existingCategories}
            onCreateCategory={onCreateCategory}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}