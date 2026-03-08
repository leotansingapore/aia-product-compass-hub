import { useState, useCallback, useEffect } from 'react';
import { CourseStructurePanel } from './CourseStructurePanel';
import { VideoEditorPanel } from './VideoEditorPanel';
import { FolderManagementDialog } from './FolderManagementDialog';
import { ModuleResourcesSection } from './ModuleResourcesSection';
import { AddResourceDropdown } from './AddResourceDropdown';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, FolderPlus, FilePlus, ChevronLeft, FileText, Link2, ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import type { TrainingVideo, UsefulLink, VideoAttachment } from '@/hooks/useProducts';

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
  isEditorEditing?: boolean;
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
  pendingSubFolderParent?: string | null;
  onReorderVideos?: (updatedVideos: TrainingVideo[]) => void;
  onReorderFolders?: (folderOrder: string[]) => void;
  onCreateSubFolder?: (parentPath: string) => void;
  lastSavedAt?: number;
  onEditorEditingStateChange?: (isEditing: boolean) => void;
  sidebarSaveStatus?: 'idle' | 'saving' | 'saved';
  onSidebarSave?: () => void;
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
  isEditorEditing = false,
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
  pendingSubFolderParent,
  onReorderVideos,
  onReorderFolders,
  onCreateSubFolder,
  lastSavedAt,
  onEditorEditingStateChange,
  sidebarSaveStatus = 'idle',
  onSidebarSave
}: VideoEditingLayoutProps) {
  const isMobile = useIsMobile();
  const [showMobileEditor, setShowMobileEditor] = useState(false);
  const [sidebarDirty, setSidebarDirty] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const currentVideo = editingIndex !== null ? editVideos[editingIndex] : null;

  // Reset states when switching pages or after save
  useEffect(() => { setSidebarDirty(false); setIsTranscriptOpen(false); }, [editingIndex]);
  useEffect(() => { if (sidebarSaveStatus === 'saved') setSidebarDirty(false); }, [sidebarSaveStatus]);

  // On mobile, show editor when a video is selected
  const handleVideoSelect = (index: number) => {
    onEditingIndexChange(index);
    if (isMobile) {
      setShowMobileEditor(true);
    }
  };

  const handleBackToList = () => {
    setShowMobileEditor(false);
  };

  // Mobile layout: show either list or editor
  if (isMobile) {
    return (
      <>
        {!showMobileEditor ? (
          // Mobile: Course Structure List
          <div className="min-h-[calc(100vh-120px)]">
            <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3 z-10">
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
                onVideoSelect={handleVideoSelect}
                onCreateFolder={onCreateFolder}
                onEditFolder={onEditFolder}
                onDeleteFolder={onDeleteFolder}
                onMoveVideoToFolder={onMoveVideoToFolder}
                onEditVideo={handleVideoSelect}
                onDeleteVideo={onRemoveVideo}
                onAddVideoToFolder={onAddVideoToFolder}
                onAddPageToFolder={onAddPageToFolder}
                onReorderVideos={onReorderVideos}
                onReorderFolders={onReorderFolders}
                onCreateSubFolder={onCreateSubFolder}
              />
            </div>
          </div>
        ) : (
          // Mobile: Video Editor
          <div className="min-h-[calc(100vh-120px)]">
            <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3 z-10">
              <Button variant="ghost" size="sm" onClick={handleBackToList} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back to Course
              </Button>
            </div>
            <div className="p-4">
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
                lastSavedAt={lastSavedAt}
                onEditingStateChange={onEditorEditingStateChange}
              />
            </div>
          </div>
        )}

        {/* Folder Management Dialog */}
        <FolderManagementDialog
          open={folderDialogOpen}
          onOpenChange={onFolderDialogOpenChange}
          mode={folderDialogMode}
          initialName={editingFolderName}
          parentPath={pendingSubFolderParent}
          onSave={onFolderSave}
        />
      </>
    );
  }

  // Desktop layout: side-by-side
  return (
    <div className="flex min-h-[calc(100vh-120px)]">
      {/* Left Sidebar - Course Structure (SKOOL-style) */}
      <aside className="w-64 lg:w-80 border-r bg-muted/30 overflow-y-auto shrink-0">
        {/* Course Structure Card */}
        <div className="border-b">
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
              onCreateSubFolder={onCreateSubFolder}
            />
          </div>
        </div>

        {/* Transcript Accordion */}
        {editingIndex !== null && currentVideo && (
          <div className="border-b">
            <details className="group" open>
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <FileText className="h-4 w-4" />
                  Transcript
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="px-4 pb-4 space-y-2">
                {isTranscriptOpen || isEditorEditing ? (
                  <>
                    <textarea
                      value={currentVideo?.transcript || ''}
                      autoFocus={isTranscriptOpen && !isEditorEditing}
                      onChange={(e) => {
                        if (editingIndex !== null && currentVideo) {
                          onUpdateVideo(editingIndex, { ...currentVideo, transcript: e.target.value });
                          setSidebarDirty(true);
                        }
                      }}
                      placeholder="Paste or type your transcript here..."
                      rows={6}
                      className="w-full bg-muted/20 border border-border rounded-lg p-3 text-sm text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 placeholder:text-muted-foreground/50 break-words overflow-x-hidden"
                    />
                    {sidebarSaveStatus === 'saved' ? (
                      <p className="text-xs text-primary/70">Saved</p>
                    ) : sidebarDirty ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        disabled={sidebarSaveStatus === 'saving'}
                        onClick={() => { onSidebarSave?.(); setIsTranscriptOpen(false); }}
                      >
                        {sidebarSaveStatus === 'saving' ? 'Saving...' : 'Save'}
                      </Button>
                    ) : null}
                  </>
                ) : currentVideo?.transcript ? (
                  <div
                    className="max-h-[300px] overflow-y-auto overflow-x-hidden cursor-pointer rounded-lg hover:bg-muted/30 p-2 -mx-2 transition-colors"
                    onClick={() => setIsTranscriptOpen(true)}
                  >
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed break-words">
                      {currentVideo.transcript}
                    </p>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-1.5 w-full px-3 py-1.5 text-sm text-muted-foreground/70 border border-dashed border-border rounded-md cursor-pointer hover:border-muted-foreground/40 hover:text-muted-foreground transition-colors"
                    onClick={() => setIsTranscriptOpen(true)}
                  >
                    <span className="text-xs">+</span>
                    Add transcript
                  </div>
                )}
              </div>
            </details>
          </div>
        )}

        {/* Resources */}
        {editingIndex !== null && currentVideo && (
          <div className="border-b">
            <details className="group" open>
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Link2 className="h-4 w-4" />
                  Resources
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="px-4 pb-4 space-y-3">
                <ModuleResourcesSection
                  links={currentVideo.useful_links || []}
                  attachments={currentVideo.attachments || []}
                  isAdmin={true}
                  onDeleteLink={(index) => {
                    if (editingIndex !== null && currentVideo) {
                      const updatedLinks = (currentVideo.useful_links || []).filter((_, i) => i !== index);
                      onUpdateVideo(editingIndex, { ...currentVideo, useful_links: updatedLinks });
                    }
                  }}
                  onDeleteAttachment={(id) => {
                    if (editingIndex !== null && currentVideo) {
                      const updatedAttachments = (currentVideo.attachments || []).filter(a => a.id !== id);
                      onUpdateVideo(editingIndex, { ...currentVideo, attachments: updatedAttachments });
                    }
                  }}
                />
                <AddResourceDropdown
                  onAddLink={(label, url) => {
                    if (editingIndex !== null && currentVideo) {
                      const newLink: UsefulLink = { name: label, url, icon: '🔗' };
                      onUpdateVideo(editingIndex, { ...currentVideo, useful_links: [...(currentVideo.useful_links || []), newLink] });
                    }
                  }}
                  onAddFile={(attachment) => {
                    if (editingIndex !== null && currentVideo) {
                      onUpdateVideo(editingIndex, { ...currentVideo, attachments: [...(currentVideo.attachments || []), attachment] });
                    }
                  }}
                />
              </div>
            </details>
          </div>
        )}
      </aside>

      {/* Main Content Area - Video Editor */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 lg:p-6">
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
            lastSavedAt={lastSavedAt}
            onEditingStateChange={onEditorEditingStateChange}
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