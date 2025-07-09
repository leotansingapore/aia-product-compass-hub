import { VideoEditForm } from './VideoEditForm';
import { AddVideoForm } from './AddVideoForm';
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
  return (
    <div className="lg:col-span-2 space-y-6">
      {editingIndex !== null && (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Edit Video</h3>
          <VideoEditForm
            video={editVideos[editingIndex]}
            onUpdate={(updatedVideo) => onUpdateVideo(editingIndex, updatedVideo)}
            onSave={() => onEditingIndexChange(null)}
            onCancel={() => onEditingIndexChange(null)}
            existingCategories={existingCategories}
          />
        </div>
      )}

      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4">Add New Video</h3>
        <AddVideoForm
          newVideo={newVideo}
          onUpdate={onNewVideoChange}
          onAdd={onAddVideo}
          disabled={!newVideo.title.trim() || !newVideo.url.trim()}
          existingCategories={existingCategories}
          onCreateCategory={onCreateCategory}
        />
      </div>
    </div>
  );
}