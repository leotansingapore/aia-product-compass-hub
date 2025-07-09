import { VideoEditForm } from './VideoEditForm';
import { AddVideoForm } from './AddVideoForm';
import { FolderTreeView } from './FolderTreeView';
import { FolderManagementDialog } from './FolderManagementDialog';
import type { TrainingVideo } from '@/hooks/useProducts';

interface VideoEditingLayoutProps {
  editVideos: TrainingVideo[];
  editingIndex: number | null;
  newVideo: TrainingVideo;
  existingCategories: string[];
  emptyFolders: string[];
  expandedFolders: Set<string>;
  folderDialogOpen: boolean;
  folderDialogMode: 'create' | 'edit';
  editingFolderName: string;
  onEditingIndexChange: (index: number | null) => void;
  onUpdateVideo: (index: number, updatedVideo: TrainingVideo) => void;
  onRemoveVideo: (index: number) => void;
  onMoveVideo: (index: number, direction: 'up' | 'down') => void;
  onNewVideoChange: (video: TrainingVideo) => void;
  onAddVideo: () => void;
  onCreateCategory: (categoryName: string) => void;
  onCreateFolder: () => void;
  onEditFolder: (folderName: string) => void;
  onDeleteFolder: (folderName: string) => void;
  onMoveVideoToFolder: (videoIndex: number, targetFolder: string) => void;
  onAddVideoToFolder: (folderName: string) => void;
  onExpandedChange: (expanded: Set<string>) => void;
  onFolderDialogOpenChange: (open: boolean) => void;
  onFolderSave: (folderName: string) => void;
}

export function VideoEditingLayout({
  editVideos,
  editingIndex,
  newVideo,
  existingCategories,
  emptyFolders,
  expandedFolders,
  folderDialogOpen,
  folderDialogMode,
  editingFolderName,
  onEditingIndexChange,
  onUpdateVideo,
  onRemoveVideo,
  onMoveVideo,
  onNewVideoChange,
  onAddVideo,
  onCreateCategory,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onMoveVideoToFolder,
  onAddVideoToFolder,
  onExpandedChange,
  onFolderDialogOpenChange,
  onFolderSave
}: VideoEditingLayoutProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Folder Tree */}
      <div className="lg:col-span-1 space-y-4">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Course Structure</h3>
          <FolderTreeView
            videos={editVideos}
            emptyFolders={emptyFolders}
            expandedFolders={expandedFolders}
            onExpandedChange={onExpandedChange}
            onVideoSelect={(index) => onEditingIndexChange(index)}
            onCreateFolder={onCreateFolder}
            onEditFolder={onEditFolder}
            onDeleteFolder={onDeleteFolder}
            onMoveVideo={onMoveVideoToFolder}
            onEditVideo={(index) => onEditingIndexChange(index)}
            onDeleteVideo={onRemoveVideo}
            onAddVideoToFolder={onAddVideoToFolder}
          />
        </div>
      </div>

      {/* Right Panel - Video Editor */}
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

      {/* Folder Management Dialog */}
      <FolderManagementDialog
        open={folderDialogOpen}
        onOpenChange={onFolderDialogOpenChange}
        mode={folderDialogMode}
        initialName={editingFolderName}
        onSave={onFolderSave}
      />
    </div>
  );
}