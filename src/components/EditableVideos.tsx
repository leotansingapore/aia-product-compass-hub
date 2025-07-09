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
}

export function EditableVideos({ videos, onSave, className = "" }: EditableVideosProps) {
  const { isAdminMode } = useAdmin();
  const videoManagement = useVideoManagement({ 
    initialVideos: videos, 
    onSave 
  });

  // Debug logging
  console.log('🎬 EditableVideos render:', {
    videosCount: videos?.length || 0,
    isAdminMode,
    isEditing: videoManagement.isEditing,
    className,
    editVideosCount: videoManagement.editVideos.length
  });

  // Non-admin view
  if (!isAdminMode) {
    console.log('🎬 EditableVideos: Rendering VideoDisplay (non-admin)');
    return <VideoDisplay videos={videos || []} className={className} />;
  }

  console.log('🎬 EditableVideos: Admin mode detected, rendering admin interface');

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

  // Admin editing mode
  if (videoManagement.isEditing) {
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
          onRemoveVideo={videoManagement.removeVideo}
          onMoveVideo={videoManagement.moveVideo}
          onNewVideoChange={videoManagement.setNewVideo}
          onAddVideo={videoManagement.addVideo}
          onSave={videoManagement.handleSave}
          onCancel={videoManagement.handleCancel}
          onCreateCategory={handleCreateCategory}
        />
      </>
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
        videoManagement.setIsEditing(true);
      }}
    />
  );
}