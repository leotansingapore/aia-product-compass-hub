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
  onAddPageToFolder: (folderName: string) => void;
  onExpandedChange: (expanded: Set<string>) => void;
  onFolderDialogOpenChange: (open: boolean) => void;
  onFolderSave: (folderName: string) => void;
  onReorderVideos?: (updatedVideos: TrainingVideo[]) => void;
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
  onAddPageToFolder,
  onExpandedChange,
  onFolderDialogOpenChange,
  onFolderSave,
  onReorderVideos
}: VideoEditingLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-120px)]">
      {/* Left Sidebar - Course Structure (SKOOL-style) */}
      <aside className="w-80 border-r bg-muted/30 overflow-y-auto">
        <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3">
          <h2 className="font-semibold text-sm text-foreground">Course Structure</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {editVideos.length} videos
          </p>
        </div>
        <div className="p-4">
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
            onAddPageToFolder={onAddPageToFolder}
            onReorderVideos={onReorderVideos}
          />
        </div>
      </aside>

      {/* Main Content Area - Video Editor */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
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
        </div>
      </main>

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