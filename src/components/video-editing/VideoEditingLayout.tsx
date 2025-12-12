import { CourseStructurePanel } from './CourseStructurePanel';
import { VideoEditorPanel } from './VideoEditorPanel';
import { FolderManagementDialog } from './FolderManagementDialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, FolderPlus, FilePlus } from 'lucide-react';
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
  onAddPageToRoot: () => void;
  onExpandedChange: (expanded: Set<string>) => void;
  onFolderDialogOpenChange: (open: boolean) => void;
  onFolderSave: (folderName: string) => void;
  onReorderVideos?: (updatedVideos: TrainingVideo[]) => void;
  onReorderFolders?: (folderOrder: string[]) => void;
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
  onAddPageToRoot,
  onExpandedChange,
  onFolderDialogOpenChange,
  onFolderSave,
  onReorderVideos,
  onReorderFolders
}: VideoEditingLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-120px)]">
      {/* Left Sidebar - Course Structure (SKOOL-style) */}
      <aside className="w-80 border-r bg-muted/30 overflow-y-auto">
        <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm text-foreground">Course Structure</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {editVideos.length} videos
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background z-50">
                <DropdownMenuItem onClick={onCreateFolder} className="cursor-pointer">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Add Folder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onAddPageToRoot} className="cursor-pointer">
                  <FilePlus className="h-4 w-4 mr-2" />
                  Add Page
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
            onReorderFolders={onReorderFolders}
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