import { VideoEditingLayout } from './VideoEditingLayout';
import { VideoEditingActions } from './VideoEditingActions';
import { useFolderManagement } from '@/hooks/useFolderManagement';
import { useVideoActions } from '@/hooks/useVideoActions';
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

  const folderManagement = useFolderManagement({
    editVideos,
    onUpdateVideo,
    onCreateCategory
  });

  const videoActions = useVideoActions({
    newVideo,
    onNewVideoChange
  });

  return (
    <>
      <VideoEditingLayout
        editVideos={editVideos}
        editingIndex={editingIndex}
        newVideo={newVideo}
        existingCategories={existingCategories}
        emptyFolders={folderManagement.emptyFolders}
        expandedFolders={folderManagement.expandedFolders}
        folderDialogOpen={folderManagement.folderDialogOpen}
        folderDialogMode={folderManagement.folderDialogMode}
        editingFolderName={folderManagement.editingFolderName}
        onEditingIndexChange={onEditingIndexChange}
        onUpdateVideo={onUpdateVideo}
        onRemoveVideo={onRemoveVideo}
        onMoveVideo={onMoveVideo}
        onNewVideoChange={onNewVideoChange}
        onAddVideo={onAddVideo}
        onCreateCategory={onCreateCategory}
        onCreateFolder={folderManagement.handleCreateFolder}
        onEditFolder={folderManagement.handleEditFolder}
        onDeleteFolder={folderManagement.handleDeleteFolder}
        onMoveVideoToFolder={folderManagement.handleMoveVideoToFolder}
        onAddVideoToFolder={videoActions.handleAddVideoToFolder}
        onExpandedChange={folderManagement.setExpandedFolders}
        onFolderDialogOpenChange={folderManagement.setFolderDialogOpen}
        onFolderSave={folderManagement.handleFolderSave}
      />
      <VideoEditingActions
        saving={saving}
        onSave={onSave}
        onCancel={onCancel}
      />
    </>
  );
}