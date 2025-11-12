import { useState } from 'react';
import { VideoEditingLayout } from './VideoEditingLayout';
import { VideoEditingActions } from './VideoEditingActions';
import { VideoOrderActions } from './VideoOrderActions';
import { useFolderManagement } from '@/hooks/useFolderManagement';
import { useVideoActions } from '@/hooks/useVideoActions';
import { useVideoOrderChanges } from '@/hooks/useVideoOrderChanges';
import { useToast } from '@/hooks/use-toast';
import type { TrainingVideo } from '@/hooks/useProducts';

interface VideoEditingInterfaceProps {
  editVideos: TrainingVideo[];
  editingIndex: number | null;
  newVideo: TrainingVideo;
  saving: boolean;
  existingCategories: string[];
  onEditingIndexChange: (index: number | null) => void;
  onUpdateVideo: (index: number, updatedVideo: TrainingVideo) => void;
  onSetEditVideos: (videos: TrainingVideo[]) => void;
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
  onSetEditVideos,
  onRemoveVideo,
  onMoveVideo,
  onNewVideoChange,
  onAddVideo,
  onSave,
  onCancel,
  onCreateCategory
}: VideoEditingInterfaceProps) {
  console.log('🎬 VideoEditingInterface: Rendering editing interface', {
    editVideosCount: editVideos?.length || 0,
    editingIndex,
    saving,
    existingCategoriesCount: existingCategories?.length || 0
  });

  // Use empty arrays as default since this interface manages its own state
  const [emptyFolders, setEmptyFolders] = useState<string[]>([]);
  const { toast } = useToast();

  // Track video order changes from drag-and-drop
  const videoOrderChanges = useVideoOrderChanges({
    videos: editVideos,
    onSave: async (updatedVideos: TrainingVideo[]) => {
      // Update the entire video array in parent component's state
      console.log('🔄 VideoEditingInterface: Syncing reordered videos to parent state', {
        count: updatedVideos.length,
        firstVideo: updatedVideos[0]?.title,
        lastVideo: updatedVideos[updatedVideos.length - 1]?.title
      });
      onSetEditVideos(updatedVideos);
    }
  });

  const folderManagement = useFolderManagement({
    editVideos: videoOrderChanges.pendingVideos,
    onUpdateVideo,
    onCreateCategory,
    emptyFolders,
    setEmptyFolders
  });

  const videoActions = useVideoActions({
    newVideo,
    onNewVideoChange
  });

  const handleAddPageToFolder = (folderName: string) => {
    // Create a new page template with rich content mode enabled
    const newPage: TrainingVideo = {
      id: `temp-${Date.now()}`,
      title: 'New Page',
      url: '',
      description: '',
      category: folderName || '', // Empty string means no folder (root level)
      order: videoOrderChanges.pendingVideos.length,
      rich_content: '', // Start with empty rich content
      legacy_fields: {
        migrated_at: new Date().toISOString(),
        notes: '',
        transcript: '',
        useful_links: [],
        attachments: []
      }
    };

    // Add the new page to the videos array
    const updatedVideos = [...videoOrderChanges.pendingVideos, newPage];
    videoOrderChanges.updatePendingVideos(updatedVideos);
    
    // Sync with parent state immediately so the page exists when content updates happen
    onSetEditVideos(updatedVideos);

    // Open it for editing (it will be the last item)
    const newIndex = updatedVideos.length - 1;
    onEditingIndexChange(newIndex);

    toast({
      title: 'New Page Created',
      description: folderName ? `Start editing your new page in "${folderName}".` : 'Start editing your new page at root level.',
    });
  };

  const handleAddPageToRoot = () => {
    handleAddPageToFolder('');
  };

  try {
    console.log('🎬 VideoEditingInterface: About to render components...');
    
    if (!folderManagement) {
      console.error('🎬 VideoEditingInterface: folderManagement is null');
      throw new Error('Failed to initialize folder management');
    }
    
    if (!videoActions) {
      console.error('🎬 VideoEditingInterface: videoActions is null');
      throw new Error('Failed to initialize video actions');
    }

    console.log('🎬 VideoEditingInterface: All hooks initialized successfully');

    return (
      <>
        <VideoEditingLayout
          editVideos={videoOrderChanges.pendingVideos}
          editingIndex={editingIndex}
          newVideo={newVideo}
          existingCategories={existingCategories}
          emptyFolders={emptyFolders}
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
          onAddPageToFolder={handleAddPageToFolder}
          onAddPageToRoot={handleAddPageToRoot}
          onExpandedChange={folderManagement.setExpandedFolders}
          onFolderDialogOpenChange={folderManagement.setFolderDialogOpen}
          onFolderSave={folderManagement.handleFolderSave}
          onReorderVideos={videoOrderChanges.updatePendingVideos}
        />
        
        {videoOrderChanges.hasPendingChanges && (
          <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t px-6 py-4 mt-6">
            <VideoOrderActions
              changeCount={videoOrderChanges.getChangeCount()}
              changeSummary={videoOrderChanges.getChangeSummary()}
              isSaving={videoOrderChanges.isSaving}
              onSave={videoOrderChanges.saveChanges}
              onDiscard={videoOrderChanges.discardChanges}
            />
          </div>
        )}
        {!videoOrderChanges.hasPendingChanges && (
          <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t px-6 py-4 mt-6">
            <VideoEditingActions
              saving={saving}
              onSave={onSave}
              onCancel={onCancel}
            />
          </div>
        )}
      </>
    );
  } catch (error) {
    console.error('🎬 VideoEditingInterface: Error during render:', error);
    throw error; // Re-throw to trigger ErrorBoundary
  }
}