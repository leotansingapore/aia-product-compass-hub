import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, MoreHorizontal, Folder, FolderOpen, Play, Edit, Trash2, FolderPlus, Plus } from 'lucide-react';
import type { TrainingVideo } from '@/hooks/useProducts';

interface FolderTreeViewProps {
  videos: TrainingVideo[];
  emptyFolders: string[];
  expandedFolders: Set<string>;
  onExpandedChange: (expanded: Set<string>) => void;
  onVideoSelect: (index: number) => void;
  onCreateFolder: () => void;
  onEditFolder: (folderName: string) => void;
  onDeleteFolder: (folderName: string) => void;
  onMoveVideo: (videoIndex: number, targetFolder: string) => void;
  onEditVideo: (index: number) => void;
  onDeleteVideo: (index: number) => void;
  onAddVideoToFolder: (folderName: string) => void;
}

export function FolderTreeView({
  videos,
  emptyFolders,
  expandedFolders,
  onExpandedChange,
  onVideoSelect,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onMoveVideo,
  onEditVideo,
  onDeleteVideo,
  onAddVideoToFolder
}: FolderTreeViewProps) {
  const [draggedVideo, setDraggedVideo] = useState<number | null>(null);

  // Group videos by category/folder
  const videosByFolder = videos.reduce((acc, video, index) => {
    const folder = video.category || 'Uncategorized';
    if (!acc[folder]) {
      acc[folder] = [];
    }
    acc[folder].push({ video, index });
    return acc;
  }, {} as Record<string, Array<{ video: TrainingVideo; index: number }>>);

  // Add empty folders to the display
  const allFolders: Record<string, Array<{ video: TrainingVideo; index: number }>> = { ...videosByFolder };
  emptyFolders.forEach(folder => {
    if (!allFolders[folder]) {
      allFolders[folder] = [];
    }
  });

  const toggleFolder = (folderName: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName);
    } else {
      newExpanded.add(folderName);
    }
    onExpandedChange(newExpanded);
  };

  const handleDragStart = (videoIndex: number) => {
    setDraggedVideo(videoIndex);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetFolder: string) => {
    e.preventDefault();
    if (draggedVideo !== null) {
      onMoveVideo(draggedVideo, targetFolder);
      setDraggedVideo(null);
    }
  };

  return (
    <div className="space-y-2">
      {/* Add Folder Button */}
      <Button
        onClick={onCreateFolder}
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2"
      >
        <FolderPlus className="h-4 w-4" />
        Add Folder
      </Button>

      {/* Folder Tree */}
      <div className="space-y-1">
        {Object.entries(allFolders).map(([folderName, folderVideos]) => {
          const isExpanded = expandedFolders.has(folderName);
          
          return (
            <div key={folderName} className="space-y-1">
              <Collapsible open={isExpanded} onOpenChange={() => toggleFolder(folderName)}>
                <div
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 group"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, folderName)}
                >
                  <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    {isExpanded ? (
                      <FolderOpen className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Folder className="h-4 w-4 text-blue-500" />
                    )}
                    <span className="font-medium">{folderName}</span>
                    <span className="text-xs text-muted-foreground">
                      ({folderVideos.length} video{folderVideos.length !== 1 ? 's' : ''})
                    </span>
                  </CollapsibleTrigger>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditFolder(folderName)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit folder
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAddVideoToFolder(folderName)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add video in folder
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDeleteFolder(folderName)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete folder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <CollapsibleContent className="pl-6 space-y-1">
                  {folderVideos.map(({ video, index }) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 cursor-move group"
                    >
                      <div
                        className="flex items-center gap-2 flex-1 cursor-pointer"
                        onClick={() => onVideoSelect(index)}
                      >
                        <Play className="h-4 w-4 text-primary" />
                        <span className="text-sm">{video.title}</span>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditVideo(index)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit video
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDeleteVideo(index)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete video
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}
      </div>
    </div>
  );
}