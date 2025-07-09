import { CourseStructurePanel } from './CourseStructurePanel';
import { VideoEditorPanel } from './VideoEditorPanel';
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
      <CourseStructurePanel
        videos={editVideos}
        emptyFolders={emptyFolders}
        expandedFolders={expandedFolders}
        onExpandedChange={onExpandedChange}
        onVideoSelect={(index) => onEditingIndexChange(index)}
        onCreateFolder={onCreateFolder}
        onEditFolder={onEditFolder}
        onDeleteFolder={onDeleteFolder}
        onMoveVideoToFolder={onMoveVideoToFolder}
        onEditVideo={(index) => onEditingIndexChange(index)}
        onDeleteVideo={onRemoveVideo}
        onAddVideoToFolder={onAddVideoToFolder}
      />

      <VideoEditorPanel
        editVideos={editVideos}
        editingIndex={editingIndex}
        newVideo={newVideo}
        existingCategories={existingCategories}
        onEditingIndexChange={onEditingIndexChange}
        onUpdateVideo={onUpdateVideo}
        onNewVideoChange={onNewVideoChange}
        onAddVideo={onAddVideo}
        onCreateCategory={onCreateCategory}
      />

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