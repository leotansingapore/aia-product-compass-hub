import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, MoreHorizontal, Folder, FolderOpen, Play, Edit, Trash2, FolderPlus, Plus, GripVertical } from 'lucide-react';
import type { TrainingVideo } from '@/hooks/useProducts';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableVideoItemProps {
  video: TrainingVideo;
  index: number;
  onVideoSelect: (index: number) => void;
  onEditVideo: (index: number) => void;
  onDeleteVideo: (index: number) => void;
}

function SortableVideoItem({ video, index, onVideoSelect, onEditVideo, onDeleteVideo }: SortableVideoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 group"
    >
      <div className="flex items-center gap-2 flex-1">
        <button
          className="cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
        <div
          className="flex items-center gap-2 flex-1 cursor-pointer"
          onClick={() => onVideoSelect(index)}
        >
          <Play className="h-4 w-4 text-primary" />
          <span className="text-sm">{video.title}</span>
        </div>
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
  );
}

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
  onReorderVideos?: (updatedVideos: TrainingVideo[]) => void;
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
  onAddVideoToFolder,
  onReorderVideos
}: FolderTreeViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string | null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !onReorderVideos) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    const activeVideo = videos.find(v => v.id === active.id);
    const overVideo = videos.find(v => v.id === over.id);

    if (!activeVideo) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    // If dropped on a video (reordering within or between categories)
    if (overVideo && active.id !== over.id) {
      const oldIndex = videos.findIndex(v => v.id === active.id);
      const newIndex = videos.findIndex(v => v.id === over.id);

      const newVideos = [...videos];
      const [movedVideo] = newVideos.splice(oldIndex, 1);

      // Update category if different
      if (overVideo.category !== movedVideo.category) {
        console.log('📁 FolderTreeView: Moving video between categories', {
          video: movedVideo.title,
          from: movedVideo.category,
          to: overVideo.category
        });
        movedVideo.category = overVideo.category;
      }

      newVideos.splice(newIndex, 0, movedVideo);

      // Reorder all videos
      const reordered = newVideos.map((video, i) => ({ ...video, order: i }));
      console.log('🔄 FolderTreeView: Calling onReorderVideos', {
        movedVideo: movedVideo.title,
        oldIndex,
        newIndex,
        totalVideos: reordered.length
      });
      onReorderVideos(reordered);
    }

    setActiveId(null);
    setOverId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  const activeVideo = activeId ? videos.find(v => v.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
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
            const folderVideoIds = folderVideos.map(({ video }) => video.id);

            return (
              <div key={folderName} className="space-y-1">
                <Collapsible open={isExpanded} onOpenChange={() => toggleFolder(folderName)}>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 group">
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
                      <span className="text-micro text-muted-foreground">
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
                    <SortableContext
                      items={folderVideoIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {folderVideos.map(({ video, index }) => (
                        <SortableVideoItem
                          key={video.id}
                          video={video}
                          index={index}
                          onVideoSelect={onVideoSelect}
                          onEditVideo={onEditVideo}
                          onDeleteVideo={onDeleteVideo}
                        />
                      ))}
                    </SortableContext>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activeVideo ? (
          <div className="flex items-center gap-2 p-2 bg-background border rounded-lg shadow-lg">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <Play className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{activeVideo.title}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}