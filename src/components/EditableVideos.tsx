import { useAdmin } from '@/hooks/useAdmin';
import { useVideoManagement } from '@/hooks/useVideoManagement';
import { VideoDisplay } from './video-editing/VideoDisplay';
import { VideoEditingInterface } from './video-editing/VideoEditingInterface';
import { AdminVideoPreview } from './video-editing/AdminVideoPreview';
import { useFolderManagement } from '@/hooks/useFolderManagement';
import { useVideoActions } from '@/hooks/useVideoActions';
import type { TrainingVideo } from '@/hooks/useProducts';

interface EditableVideosProps {
  videos: TrainingVideo[];
  onSave: (newVideos: TrainingVideo[]) => Promise<void>;
  className?: string;
  onExitEditMode?: () => void;
}

export function EditableVideos({ videos, onSave, className = "", onExitEditMode }: EditableVideosProps) {
  const { isAdmin: isAdminMode } = useAdmin();
  
  console.log('🎬 EditableVideos: Starting initialization...', { 
    videosCount: videos?.length || 0, 
    isAdminMode,
    onSave: typeof onSave 
  });
  
  // All hooks must be called at the top level, before any conditional logic
  const videoManagement = useVideoManagement({ 
    initialVideos: videos, 
    onSave 
  });

  // Get existing categories from videos and empty folders
  const videoCategoriesSet = new Set(
    videoManagement.editVideos.map(video => video.category).filter(Boolean)
  );
  const existingCategories = Array.from(new Set([
    ...videoCategoriesSet,
    ...videoManagement.emptyFolders
  ])).sort();

  const handleCreateCategory = (categoryName: string) => {
    // Add to empty folders immediately so it appears in the UI
    videoManagement.addEmptyFolder(categoryName);
    console.log('🗂️ Created new category:', categoryName);
  };

  const folderManagement = useFolderManagement({
    editVideos: videoManagement.editVideos,
    onUpdateVideo: videoManagement.updateVideo,
    onCreateCategory: handleCreateCategory,
    emptyFolders: videoManagement.emptyFolders,
    setEmptyFolders: (folders: string[]) => {
      // This will be handled through the individual add/remove methods
    }
  });

  const videoActions = useVideoActions({
    newVideo: videoManagement.newVideo,
    onNewVideoChange: videoManagement.setNewVideo
  });

  // Debug logging
  console.log('🎬 EditableVideos render:', {
    videosCount: videos?.length || 0,
    isAdminMode,
    isEditing: videoManagement.isEditing,
    className,
    editVideosCount: videoManagement.editVideos.length,
    videoManagementInitialized: !!videoManagement
  });

  // Non-admin view
  if (!isAdminMode) {
    console.log('🎬 EditableVideos: Rendering VideoDisplay (non-admin)');
    return <VideoDisplay videos={videos || []} className={className} />;
  }

  console.log('🎬 EditableVideos: Admin mode detected, rendering admin interface');

  // Wrap save and cancel handlers to call onExitEditMode
  const handleSave = async () => {
    await videoManagement.handleSave();
    onExitEditMode?.();
  };

  const handleCancel = () => {
    videoManagement.handleCancel();
    onExitEditMode?.();
  };

  // Admin editing mode
  if (videoManagement.isEditing) {
    console.log('🎬 EditableVideos: Rendering VideoEditingInterface');
    return (
      <>
        <VideoEditingInterface
          editVideos={videoManagement.editVideos}
          editingIndex={videoManagement.editingIndex}
          newVideo={videoManagement.newVideo}
          saving={videoManagement.saving}
          existingCategories={existingCategories}
          onEditingIndexChange={videoManagement.setEditingIndex}
          onUpdateVideo={videoManagement.updateVideo}
          onSetEditVideos={videoManagement.setEditVideos}
          onRemoveVideo={videoManagement.removeVideo}
          onMoveVideo={videoManagement.moveVideo}
          onNewVideoChange={videoManagement.setNewVideo}
          onAddVideo={videoManagement.addVideo}
          onSave={handleSave}
          onCancel={handleCancel}
          onCreateCategory={handleCreateCategory}
        />
      </>
    );
  }

  // Admin preview mode (static list, no drag-and-drop)
  console.log('🎬 EditableVideos: Rendering AdminVideoPreview');

  return (
    <AdminVideoPreview
      videos={videos || []}
      className={className}
      onClick={() => {
        console.log('🎬 EditableVideos: AdminVideoPreview clicked, entering edit mode');
        videoManagement.setIsEditing(true);
      }}
    />
  );
}