import { useState, useRef, useCallback } from 'react';

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
  hasContentChanges?: boolean; // Optional - when true, shows the save bar
  onEditingIndexChange: (index: number | null) => void;
  onUpdateVideo: (index: number, updatedVideo: TrainingVideo) => void;
  onSetEditVideos: (videos: TrainingVideo[]) => void;
  onRemoveVideo: (index: number) => void;
  onMoveVideo: (index: number, direction: 'up' | 'down') => void;
  onNewVideoChange: (video: TrainingVideo) => void;
  onAddVideo: () => void;
  onAddQuiz?: () => void;
  onAddAssignment?: () => void;
  onSave: (videos?: TrainingVideo[]) => void;
  onCancel: () => void;
  onCreateCategory: (categoryName: string) => void;
  /** Enables the ActionStepsEditor above the rich-content editor. Parent
   *  page sets this to `true` for CMFAS products only. */
  showActionSteps?: boolean;
}

export function VideoEditingInterface({
  editVideos,
  editingIndex,
  newVideo,
  saving,
  existingCategories,
  hasContentChanges = false,
  onEditingIndexChange,
  onUpdateVideo,
  onSetEditVideos,
  onRemoveVideo,
  onMoveVideo,
  onNewVideoChange,
  onAddVideo,
  onAddQuiz,
  onAddAssignment,
  onSave,
  onCancel,
  onCreateCategory,
  showActionSteps = false,
}: VideoEditingInterfaceProps) {
  console.log('🎬 VideoEditingInterface: Rendering editing interface', {
    editVideosCount: editVideos?.length || 0,
    editingIndex,
    saving,
    existingCategoriesCount: existingCategories?.length || 0
  });

  // Use empty arrays as default since this interface manages its own state
  const [emptyFolders, setEmptyFolders] = useState<string[]>([]);
  const [folderOrders, setFolderOrders] = useState<Record<string, number>>({});
  const [lastSavedAt, setLastSavedAt] = useState(0);
  const [isEditorEditing, setIsEditorEditing] = useState(false);
  const [sidebarSaveStatus, setSidebarSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const sidebarSaveStatusTimerRef = useRef<ReturnType<typeof setTimeout>>();
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
      
      // Also persist to database immediately - pass videos directly to avoid stale state
      console.log('💾 VideoEditingInterface: Persisting order changes to database...');
      await onSave(updatedVideos);
    }
  });

  // Save sidebar changes (transcript/resources) on button click
  const handleSidebarSave = useCallback(async () => {
    setSidebarSaveStatus('saving');
    try {
      await onSave(videoOrderChanges.pendingVideos);
      setSidebarSaveStatus('saved');
      if (sidebarSaveStatusTimerRef.current) clearTimeout(sidebarSaveStatusTimerRef.current);
      sidebarSaveStatusTimerRef.current = setTimeout(() => setSidebarSaveStatus('idle'), 2000);
    } catch {
      setSidebarSaveStatus('idle');
    }
  }, [onSave, videoOrderChanges.pendingVideos]);

  // Wrapper to update both pendingVideos and parent's editVideos when content is edited
  const handleUpdateVideo = (index: number, updatedVideo: TrainingVideo) => {
    // Update parent's editVideos (for hasContentChanges detection and save)
    onUpdateVideo(index, updatedVideo);

    // Also update pendingVideos locally to keep UI in sync
    const updatedPending = [...videoOrderChanges.pendingVideos];
    updatedPending[index] = updatedVideo;
    videoOrderChanges.updatePendingVideos(updatedPending);
  };

  const folderManagement = useFolderManagement({
    editVideos: videoOrderChanges.pendingVideos,
    onUpdateVideo: handleUpdateVideo,
    onCreateCategory,
    emptyFolders,
    setEmptyFolders,
    folderOrders,
    setFolderOrders,
  });

  const videoActions = useVideoActions({
    newVideo,
    onNewVideoChange
  });

  const handleAddPageToFolder = async (folderName: string) => {
    const newPage: TrainingVideo = {
      id: `temp-${Date.now()}`,
      title: 'New Page',
      url: '',
      description: '',
      category: folderName || '',
      order: videoOrderChanges.pendingVideos.length,
      rich_content: '',
      legacy_fields: {
        migrated_at: new Date().toISOString(),
        notes: '',
        transcript: '',
        useful_links: [],
        attachments: []
      }
    };

    const updatedVideos = [...videoOrderChanges.pendingVideos, newPage];
    videoOrderChanges.updatePendingVideos(updatedVideos);
    onSetEditVideos(updatedVideos);
    onEditingIndexChange(updatedVideos.length - 1);
    await onSave(updatedVideos);
  };

  const handleAddPageToRoot = () => {
    handleAddPageToFolder('');
  };

  // Delete a video/page by its index into pendingVideos (what the tree renders).
  // Going through pendingVideos — not parent editVideos — prevents wrong-item
  // deletion when drag-reorders haven't been saved yet, since the two arrays
  // can disagree on ordering until the sync runs.
  const handleRemoveVideo = async (index: number) => {
    const current = videoOrderChanges.pendingVideos;
    const target = current[index];
    if (!target) {
      console.warn('🗑️ handleRemoveVideo: no video at index', index);
      return;
    }
    const filtered = current
      .filter((v) => v.id !== target.id)
      .map((v, i) => ({ ...v, order: i }));
    videoOrderChanges.updatePendingVideos(filtered);
    onSetEditVideos(filtered);
    if (editingIndex === index) {
      onEditingIndexChange(null);
    } else if (editingIndex !== null && editingIndex > index) {
      onEditingIndexChange(editingIndex - 1);
    }
    try {
      await onSave(filtered);
      videoOrderChanges.clearChangeTracking();
    } catch (error) {
      console.error('🗑️ handleRemoveVideo: save failed', error);
      toast({
        title: 'Delete failed',
        description: 'Could not save the deletion. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReorderFolders = (folderOrder: string[]) => {
    const currentVideos = videoOrderChanges.pendingVideos;
    
    // Separate root-level videos and folder videos
    const rootVideos = currentVideos.filter(v => !v.category || String(v.category).trim() === '');
    const folderVideos = currentVideos.filter(v => v.category && String(v.category).trim() !== '');
    
    // Group videos by folder, preserving their internal order
    const videosByFolder = folderVideos.reduce((acc, video) => {
      const folder = video.category!;
      if (!acc[folder]) acc[folder] = [];
      acc[folder].push(video);
      return acc;
    }, {} as Record<string, TrainingVideo[]>);
    
    // Sort videos within each folder by their current order
    Object.keys(videosByFolder).forEach(folder => {
      videosByFolder[folder].sort((a, b) => a.order - b.order);
    });
    
    // Reconstruct video array: root videos first, then folders in new order
    const reorderedVideos: TrainingVideo[] = [];
    let order = 0;
    
    // Add root videos first (maintaining their relative order)
    rootVideos.sort((a, b) => a.order - b.order).forEach(video => {
      reorderedVideos.push({ ...video, order: order++ });
    });
    
    // Add folder videos in the new folder order
    for (const folderName of folderOrder) {
      const folderVids = videosByFolder[folderName] || [];
      folderVids.forEach(video => {
        reorderedVideos.push({ ...video, order: order++ });
      });
      delete videosByFolder[folderName]; // Mark as processed
    }
    
    // Include any folders not in the new order (safety net)
    Object.keys(videosByFolder).forEach(folder => {
      videosByFolder[folder].forEach(video => {
        reorderedVideos.push({ ...video, order: order++ });
      });
    });
    
    console.log('📁 VideoEditingInterface: Reordered folders', {
      folderOrder,
      totalVideos: reorderedVideos.length
    });
    
    videoOrderChanges.updatePendingVideos(reorderedVideos);
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
          isEditorEditing={isEditorEditing}
          onEditingIndexChange={onEditingIndexChange}
          onUpdateVideo={handleUpdateVideo}
          onRemoveVideo={handleRemoveVideo}
          onMoveVideo={onMoveVideo}
          onNewVideoChange={onNewVideoChange}
          onAddVideo={onAddVideo}
          onAddQuiz={onAddQuiz}
          onAddAssignment={onAddAssignment}
          onCreateCategory={onCreateCategory}
          onCreateFolder={folderManagement.handleCreateFolder}
          onEditFolder={folderManagement.handleEditFolder}
          onDeleteFolder={folderManagement.handleDeleteFolder}
          onMoveVideoToFolder={folderManagement.handleMoveVideoToFolder}
          onAddVideoToFolder={videoActions.handleAddVideoToFolder}
          onAddPageToFolder={handleAddPageToFolder}
          onAddPageToRoot={handleAddPageToRoot}
          onCreateSubFolder={folderManagement.handleCreateSubFolder}
          pendingSubFolderParent={folderManagement.pendingSubFolderParent}
          onExpandedChange={folderManagement.setExpandedFolders}
          onFolderDialogOpenChange={folderManagement.setFolderDialogOpen}
          onFolderSave={async (folderName: string) => {
            const trimmed = folderName.trim();
            if (!trimmed) return;
            folderManagement.handleFolderSave(trimmed);
            if (folderManagement.folderDialogMode === 'create') {
              const fullPath = folderManagement.pendingSubFolderParent
                ? `${folderManagement.pendingSubFolderParent}/${trimmed}`
                : trimmed;
              const newPage: TrainingVideo = {
                id: `temp-${Date.now()}`,
                title: 'New Page',
                url: '',
                description: '',
                category: fullPath,
                order: videoOrderChanges.pendingVideos.length,
                rich_content: '',
                legacy_fields: {
                  migrated_at: new Date().toISOString(),
                  notes: '',
                  transcript: '',
                  useful_links: [],
                  attachments: []
                }
              };
              const updatedVideos = [...videoOrderChanges.pendingVideos, newPage];
              videoOrderChanges.updatePendingVideos(updatedVideos);
              onSetEditVideos(updatedVideos);
              onEditingIndexChange(updatedVideos.length - 1);
              await onSave(updatedVideos);
            }
          }}
          onReorderVideos={videoOrderChanges.updatePendingVideos}
          onReorderFolders={handleReorderFolders}
          folderOrders={folderOrders}
          onFolderOrdersChange={setFolderOrders}
          lastSavedAt={lastSavedAt}
          onEditorEditingStateChange={setIsEditorEditing}
          sidebarSaveStatus={sidebarSaveStatus}
          onSidebarSave={handleSidebarSave}
          showActionSteps={showActionSteps}
        />
        
        {(videoOrderChanges.hasPendingChanges || hasContentChanges) && (
          <div className="fixed left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t bottom-[calc(3.5rem+env(safe-area-inset-bottom))] md:bottom-0">
            <div className="max-w-[1600px] mx-auto px-6 py-4">
              <VideoEditingActions
                saving={saving || videoOrderChanges.isSaving}
                onSave={async () => {
                  const currentVideos = videoOrderChanges.pendingVideos;
                  console.log('💾 Save triggered with videos:', currentVideos.length);
                  await onSave(currentVideos);
                  videoOrderChanges.clearChangeTracking();
                  setLastSavedAt(Date.now());
                }}
                onCancel={onCancel}
              />
            </div>
          </div>
        )}
      </>
    );
  } catch (error) {
    console.error('🎬 VideoEditingInterface: Error during render:', error);
    throw error; // Re-throw to trigger ErrorBoundary
  }
}