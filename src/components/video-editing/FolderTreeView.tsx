import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, MoreHorizontal, Folder, FolderOpen, Play, Edit, Trash2, GripVertical, FileText } from 'lucide-react';
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

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('📹 FolderTreeView: Video clicked', { 
      title: video.title, 
      index 
    });
    onVideoSelect(index);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 group"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
        </button>
        <button
          type="button"
          className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer hover:underline text-left"
          onClick={handleVideoClick}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Play className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-sm truncate">{video.title}</span>
        </button>
      </div>

      <DropdownMenu modal>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 flex-shrink-0"
            data-no-dnd="true"
            onClick={handleMenuClick}
            onPointerDown={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background z-50">
          <DropdownMenuItem onClick={() => onEditVideo(index)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit video
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              console.log('🗑️ Delete video clicked:', { title: video.title, index });
              onDeleteVideo(index);
            }}
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

interface SortableFolderItemProps {
  folderName: string;
  folderVideos: Array<{ video: TrainingVideo; index: number }>;
  isExpanded: boolean;
  isDropTarget: boolean;
  onToggle: () => void;
  onEditFolder: (folderName: string) => void;
  onDeleteFolder: (folderName: string) => void;
  onAddPageToFolder: (folderName: string) => void;
  onVideoSelect: (index: number) => void;
  onEditVideo: (index: number) => void;
  onDeleteVideo: (index: number) => void;
}

function SortableFolderItem({
  folderName,
  folderVideos,
  isExpanded,
  isDropTarget,
  onToggle,
  onEditFolder,
  onDeleteFolder,
  onAddPageToFolder,
  onVideoSelect,
  onEditVideo,
  onDeleteVideo,
}: SortableFolderItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `folder-${folderName}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const folderVideoIds = folderVideos.map(({ video }) => video.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-1">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <div
          className={`flex items-center justify-between p-2 rounded-lg group transition-all duration-200 ease-in-out ${
            isDropTarget
              ? 'ring-2 ring-primary/60 bg-primary/5 scale-[1.01]'
              : 'hover:bg-muted/50'
          }`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              type="button"
              className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
            <button
              type="button"
              className="flex items-center gap-2 flex-1 min-w-0 text-left"
              onClick={handleToggle}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              )}
              {isExpanded ? (
                <FolderOpen className={`h-4 w-4 flex-shrink-0 transition-colors duration-200 ${isDropTarget ? 'text-primary' : 'text-blue-500'}`} />
              ) : (
                <Folder className={`h-4 w-4 flex-shrink-0 transition-colors duration-200 ${isDropTarget ? 'text-primary' : 'text-blue-500'}`} />
              )}
              <span className="font-medium truncate">{folderName}</span>
              <span className="text-micro text-muted-foreground flex-shrink-0">
                ({folderVideos.length} video{folderVideos.length !== 1 ? 's' : ''})
              </span>
            </button>
          </div>

          <DropdownMenu modal>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 flex-shrink-0"
                data-no-dnd="true"
                onClick={handleMenuClick}
                onPointerDown={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background z-50">
              <DropdownMenuItem onClick={() => onEditFolder(folderName)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddPageToFolder(folderName)}>
                <FileText className="h-4 w-4 mr-2" />
                Add page in folder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  console.log('🗑️ Delete folder clicked:', folderName);
                  onDeleteFolder(folderName);
                }}
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
  onAddPageToFolder: (folderName: string) => void;
  onReorderVideos?: (updatedVideos: TrainingVideo[]) => void;
  onReorderFolders?: (folderOrder: string[]) => void;
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
  onAddPageToFolder,
  onReorderVideos,
  onReorderFolders
}: FolderTreeViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'video' | 'folder' | null>(null);
  const [dropTargetFolder, setDropTargetFolder] = useState<string | null>(null);
  const autoExpandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const rootLevelVideos: Array<{ video: TrainingVideo; index: number }> = [];
  const videosByFolder = videos.reduce((acc, video, index) => {
    const folder = video.category;
    if (!folder || folder.trim() === '') {
      rootLevelVideos.push({ video, index });
      return acc;
    }
    if (!acc[folder]) {
      acc[folder] = [];
    }
    acc[folder].push({ video, index });
    return acc;
  }, {} as Record<string, Array<{ video: TrainingVideo; index: number }>>);

  const allFolders: Record<string, Array<{ video: TrainingVideo; index: number }>> = { ...videosByFolder };
  emptyFolders.forEach(folder => {
    if (!allFolders[folder]) {
      allFolders[folder] = [];
    }
  });

  const folderNames = Object.keys(allFolders);

  const toggleFolder = useCallback((folderName: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName);
    } else {
      newExpanded.add(folderName);
    }
    onExpandedChange(newExpanded);
  }, [expandedFolders, onExpandedChange]);

  const clearAutoExpandTimer = useCallback(() => {
    if (autoExpandTimerRef.current) {
      clearTimeout(autoExpandTimerRef.current);
      autoExpandTimerRef.current = null;
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearAutoExpandTimer();
  }, [clearAutoExpandTimer]);

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);
    setActiveType(id.startsWith('folder-') ? 'folder' : 'video');
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overIdStr = event.over?.id as string | null;
    setOverId(overIdStr);

    // Track folder drop target when dragging a video over a folder
    if (activeType === 'video' && overIdStr?.startsWith('folder-')) {
      const folderName = overIdStr.replace('folder-', '');

      if (dropTargetFolder !== folderName) {
        setDropTargetFolder(folderName);
        clearAutoExpandTimer();

        // Auto-expand closed folders after 500ms
        if (!expandedFolders.has(folderName)) {
          autoExpandTimerRef.current = setTimeout(() => {
            toggleFolder(folderName);
          }, 500);
        }
      }
    } else {
      if (dropTargetFolder !== null) {
        setDropTargetFolder(null);
        clearAutoExpandTimer();
      }
    }
  };

  const resetDragState = () => {
    setActiveId(null);
    setOverId(null);
    setActiveType(null);
    setDropTargetFolder(null);
    clearAutoExpandTimer();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      resetDragState();
      return;
    }

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    // Handle VIDEO dropped on a FOLDER
    if (activeType === 'video' && overIdStr.startsWith('folder-')) {
      const targetFolder = overIdStr.replace('folder-', '');
      const activeVideo = videos.find(v => v.id === activeIdStr);

      if (activeVideo && activeVideo.category !== targetFolder && onReorderVideos) {
        console.log('📁 FolderTreeView: Dropping video into folder', {
          video: activeVideo.title,
          from: activeVideo.category || '(root)',
          to: targetFolder
        });

        const updatedVideos = videos.map((v, i) =>
          v.id === activeIdStr ? { ...v, category: targetFolder, order: i } : { ...v, order: i }
        );
        onReorderVideos(updatedVideos);
      }

      resetDragState();
      return;
    }

    // Handle folder reordering
    if (activeIdStr.startsWith('folder-') && overIdStr.startsWith('folder-')) {
      const activeFolderName = activeIdStr.replace('folder-', '');
      const overFolderName = overIdStr.replace('folder-', '');

      if (activeFolderName !== overFolderName && onReorderFolders) {
        const oldIndex = folderNames.indexOf(activeFolderName);
        const newIndex = folderNames.indexOf(overFolderName);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newFolderOrder = [...folderNames];
          newFolderOrder.splice(oldIndex, 1);
          newFolderOrder.splice(newIndex, 0, activeFolderName);
          onReorderFolders(newFolderOrder);
        }
      }

      resetDragState();
      return;
    }

    // Handle video reordering
    if (!onReorderVideos) {
      resetDragState();
      return;
    }

    const activeVideo = videos.find(v => v.id === active.id);
    const overVideo = videos.find(v => v.id === over.id);

    if (!activeVideo) {
      resetDragState();
      return;
    }

    if (overVideo && active.id !== over.id) {
      const oldIndex = videos.findIndex(v => v.id === active.id);
      const newIndex = videos.findIndex(v => v.id === over.id);

      const newVideos = [...videos];
      const [movedVideo] = newVideos.splice(oldIndex, 1);

      if (overVideo.category !== movedVideo.category) {
        console.log('📁 FolderTreeView: Moving video between categories', {
          video: movedVideo.title,
          from: movedVideo.category,
          to: overVideo.category
        });
        movedVideo.category = overVideo.category;
      }

      newVideos.splice(newIndex, 0, movedVideo);

      const reordered = newVideos.map((video, i) => ({ ...video, order: i }));
      onReorderVideos(reordered);
    }

    resetDragState();
  };

  const handleDragCancel = () => {
    resetDragState();
  };

  const activeVideo = activeId && !activeId.startsWith('folder-') ? videos.find(v => v.id === activeId) : null;
  const activeFolderName = activeId?.startsWith('folder-') ? activeId.replace('folder-', '') : null;

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
        {/* Root Level Videos (no folder) */}
        {rootLevelVideos.length > 0 && (
          <div className="space-y-1">
            <SortableContext
              items={rootLevelVideos.map(({ video }) => video.id)}
              strategy={verticalListSortingStrategy}
            >
              {rootLevelVideos.map(({ video, index }) => (
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
          </div>
        )}

        {/* Folder Tree */}
        <div className="space-y-1">
          <SortableContext
            items={folderNames.map(name => `folder-${name}`)}
            strategy={verticalListSortingStrategy}
          >
            {folderNames.map((folderName) => {
              const folderVideos = allFolders[folderName];
              const isExpanded = expandedFolders.has(folderName);

              return (
                <SortableFolderItem
                  key={folderName}
                  folderName={folderName}
                  folderVideos={folderVideos}
                  isExpanded={isExpanded}
                  isDropTarget={dropTargetFolder === folderName && activeType === 'video'}
                  onToggle={() => toggleFolder(folderName)}
                  onEditFolder={onEditFolder}
                  onDeleteFolder={onDeleteFolder}
                  onAddPageToFolder={onAddPageToFolder}
                  onVideoSelect={onVideoSelect}
                  onEditVideo={onEditVideo}
                  onDeleteVideo={onDeleteVideo}
                />
              );
            })}
          </SortableContext>
        </div>
      </div>

      <DragOverlay>
        {activeVideo ? (
          <div className="flex items-center gap-2 p-2 bg-background border rounded-lg shadow-lg">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <Play className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{activeVideo.title}</span>
          </div>
        ) : activeFolderName ? (
          <div className="flex items-center gap-2 p-2 bg-background border rounded-lg shadow-lg">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <Folder className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">{activeFolderName}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
