import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Folder,
  FolderOpen,
  Play,
  Edit,
  Trash2,
  GripVertical,
  FileText,
  FolderPlus,
} from 'lucide-react';
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

// ─── Path utilities ──────────────────────────────────────────────────────────
// Folders are stored as slash-delimited paths: "Parent", "Parent/Child", etc.
// A video's `category` field holds its parent folder path.

function getPathParts(path: string): string[] {
  return path.split('/').filter(Boolean);
}

function joinPath(...parts: string[]): string {
  return parts.filter(Boolean).join('/');
}

function getParentPath(path: string): string {
  const parts = getPathParts(path);
  parts.pop();
  return parts.join('/');
}

function getFolderName(path: string): string {
  const parts = getPathParts(path);
  return parts[parts.length - 1] ?? path;
}

// Build a tree structure from flat videos + empty-folder list
interface FolderNode {
  path: string;          // full path e.g. "A/B/C"
  name: string;          // just last segment
  children: FolderNode[];
  videos: Array<{ video: TrainingVideo; index: number }>;
}

function buildTree(
  videos: TrainingVideo[],
  emptyFolders: string[]
): { root: FolderNode; rootVideos: Array<{ video: TrainingVideo; index: number }> } {
  const folderMap: Map<string, FolderNode> = new Map();

  const getOrCreate = (path: string): FolderNode => {
    if (folderMap.has(path)) return folderMap.get(path)!;
    const node: FolderNode = { path, name: getFolderName(path), children: [], videos: [] };
    folderMap.set(path, node);
    return node;
  };

  // Ensure all ancestor folders exist
  const ensureAncestors = (path: string) => {
    const parts = getPathParts(path);
    for (let i = 1; i <= parts.length; i++) {
      getOrCreate(parts.slice(0, i).join('/'));
    }
  };

  const rootVideos: Array<{ video: TrainingVideo; index: number }> = [];

  videos.forEach((video, index) => {
    const cat = (typeof video.category === 'string' ? video.category : '').trim();
    if (!cat) {
      rootVideos.push({ video, index });
    } else {
      ensureAncestors(cat);
      getOrCreate(cat).videos.push({ video, index });
    }
  });

  emptyFolders.forEach(f => {
    if (f.trim()) ensureAncestors(f.trim());
  });

  // Wire up parent→child relationships
  folderMap.forEach((node, path) => {
    const parentPath = getParentPath(path);
    if (parentPath) {
      const parent = folderMap.get(parentPath);
      if (parent && !parent.children.find(c => c.path === path)) {
        parent.children.push(node);
      }
    }
  });

  // Root-level folders: those with no parent
  const rootFolders: FolderNode[] = [];
  folderMap.forEach((node, path) => {
    if (!getParentPath(path)) rootFolders.push(node);
  });

  const getMinOrder = (n: FolderNode): number => {
    let min = Infinity;
    for (const { video } of n.videos) min = Math.min(min, video.order ?? Infinity);
    for (const child of n.children) min = Math.min(min, getMinOrder(child));
    return min;
  };

  const sortNode = (n: FolderNode) => {
    n.children.sort((a, b) => getMinOrder(a) - getMinOrder(b));
    n.children.forEach(sortNode);
  };
  rootFolders.sort((a, b) => getMinOrder(a) - getMinOrder(b));
  rootFolders.forEach(sortNode);

  const root: FolderNode = { path: '', name: '', children: rootFolders, videos: rootVideos };
  return { root, rootVideos };
}

function findNode(node: FolderNode, path: string): FolderNode | null {
  if (node.path === path) return node;
  for (const child of node.children) {
    const found = findNode(child, path);
    if (found) return found;
  }
  return null;
}

function getNodeMinOrder(n: FolderNode): number {
  let min = Infinity;
  for (const { video } of n.videos) min = Math.min(min, video.order ?? Infinity);
  for (const child of n.children) min = Math.min(min, getNodeMinOrder(child));
  return min;
}

// ─── SortableVideoItem ────────────────────────────────────────────────────────
interface SortableVideoItemProps {
  video: TrainingVideo;
  index: number;
  depth: number;
  onVideoSelect: (index: number) => void;
  onEditVideo: (index: number) => void;
  onDeleteVideo: (index: number) => void;
}

function SortableVideoItem({
  video,
  index,
  depth,
  onVideoSelect,
  onEditVideo,
  onDeleteVideo,
}: SortableVideoItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: video.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    paddingLeft: `${depth * 16}px`,
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
          className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
        </button>
        <button
          type="button"
          className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer hover:underline text-left"
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onVideoSelect(index); }}
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
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background z-50">
          <DropdownMenuItem onClick={() => onEditVideo(index)}>
            <Edit className="h-4 w-4 mr-2" /> Edit video
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onDeleteVideo(index)} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" /> Delete video
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ─── RecursiveFolderItem ──────────────────────────────────────────────────────
interface RecursiveFolderItemProps {
  node: FolderNode;
  depth: number;
  expandedFolders: Set<string>;
  dropTargetFolder: string | null;
  activeType: 'video' | 'folder' | null;
  onToggle: (path: string) => void;
  onEditFolder: (path: string) => void;
  onDeleteFolder: (path: string) => void;
  onAddPageToFolder: (path: string) => void;
  onCreateSubFolder: (parentPath: string) => void;
  onVideoSelect: (index: number) => void;
  onEditVideo: (index: number) => void;
  onDeleteVideo: (index: number) => void;
}

function RecursiveFolderItem({
  node,
  depth,
  expandedFolders,
  dropTargetFolder,
  activeType,
  onToggle,
  onEditFolder,
  onDeleteFolder,
  onAddPageToFolder,
  onCreateSubFolder,
  onVideoSelect,
  onEditVideo,
  onDeleteVideo,
}: RecursiveFolderItemProps) {
  const isExpanded = expandedFolders.has(node.path);
  const isDropTarget = dropTargetFolder === node.path && activeType === 'video';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `folder-${node.path}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    paddingLeft: `${depth * 16}px`,
  };

  const childFolderIds = node.children.map(c => `folder-${c.path}`);
  const childVideoIds = node.videos.map(({ video }) => video.id);

  return (
    <div ref={setNodeRef} style={style} className="space-y-0.5">
      {/* Folder header */}
      <div
        className={`flex items-center justify-between p-2 rounded-lg group transition-all duration-200 ${
          isDropTarget
            ? 'ring-2 ring-primary/60 bg-primary/5 scale-[1.01]'
            : 'hover:bg-muted/50'
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
          <button
            type="button"
            className="flex items-center gap-2 flex-1 min-w-0 text-left"
            onClick={(e) => { e.stopPropagation(); onToggle(node.path); }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className={`h-4 w-4 flex-shrink-0 ${isDropTarget ? 'text-primary' : 'text-blue-500'}`} />
            ) : (
              <Folder className={`h-4 w-4 flex-shrink-0 ${isDropTarget ? 'text-primary' : 'text-blue-500'}`} />
            )}
            <span className="font-medium text-sm truncate">{node.name}</span>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              ({node.videos.length + node.children.reduce((n, c) => n + c.videos.length, 0)})
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
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background z-50">
            <DropdownMenuItem onClick={() => onEditFolder(node.path)}>
              <Edit className="h-4 w-4 mr-2" /> Rename folder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCreateSubFolder(node.path)}>
              <FolderPlus className="h-4 w-4 mr-2" /> Add sub-folder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddPageToFolder(node.path)}>
              <FileText className="h-4 w-4 mr-2" /> Add page here
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDeleteFolder(node.path)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" /> Delete folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="space-y-0.5 ml-4 border-l border-border/40 pl-1">
          {/* Sub-folders */}
          <SortableContext items={childFolderIds} strategy={verticalListSortingStrategy}>
            {node.children.map(child => (
              <RecursiveFolderItem
                key={child.path}
                node={child}
                depth={0}
                expandedFolders={expandedFolders}
                dropTargetFolder={dropTargetFolder}
                activeType={activeType}
                onToggle={onToggle}
                onEditFolder={onEditFolder}
                onDeleteFolder={onDeleteFolder}
                onAddPageToFolder={onAddPageToFolder}
                onCreateSubFolder={onCreateSubFolder}
                onVideoSelect={onVideoSelect}
                onEditVideo={onEditVideo}
                onDeleteVideo={onDeleteVideo}
              />
            ))}
          </SortableContext>

          {/* Videos in this folder */}
          <SortableContext items={childVideoIds} strategy={verticalListSortingStrategy}>
            {node.videos.map(({ video, index }) => (
              <SortableVideoItem
                key={video.id}
                video={video}
                index={index}
                depth={0}
                onVideoSelect={onVideoSelect}
                onEditVideo={onEditVideo}
                onDeleteVideo={onDeleteVideo}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
}

// ─── FolderTreeView (main) ────────────────────────────────────────────────────
export interface FolderTreeViewProps {
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
  onCreateSubFolder?: (parentPath: string) => void;
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
  onReorderFolders,
  onCreateSubFolder,
}: FolderTreeViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'video' | 'folder' | null>(null);
  const [dropTargetFolder, setDropTargetFolder] = useState<string | null>(null);
  const autoExpandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { root } = buildTree(videos, emptyFolders);

  const toggleFolder = useCallback(
    (path: string) => {
      const next = new Set(expandedFolders);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      onExpandedChange(next);
    },
    [expandedFolders, onExpandedChange]
  );

  const clearAutoExpandTimer = useCallback(() => {
    if (autoExpandTimerRef.current) {
      clearTimeout(autoExpandTimerRef.current);
      autoExpandTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearAutoExpandTimer(), [clearAutoExpandTimer]);

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);
    setActiveType(id.startsWith('folder-') ? 'folder' : 'video');
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overIdStr = event.over?.id as string | null;

    if (activeType === 'video' && overIdStr?.startsWith('folder-')) {
      const folderPath = overIdStr.replace('folder-', '');
      if (dropTargetFolder !== folderPath) {
        setDropTargetFolder(folderPath);
        clearAutoExpandTimer();
        if (!expandedFolders.has(folderPath)) {
          autoExpandTimerRef.current = setTimeout(() => toggleFolder(folderPath), 500);
        }
      }
    } else if (dropTargetFolder !== null) {
      setDropTargetFolder(null);
      clearAutoExpandTimer();
    }
  };

  const resetDragState = () => {
    setActiveId(null);
    setActiveType(null);
    setDropTargetFolder(null);
    clearAutoExpandTimer();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) { resetDragState(); return; }

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    // Video dropped onto a folder → move video into that folder
    if (activeType === 'video' && overIdStr.startsWith('folder-')) {
      const targetPath = overIdStr.replace('folder-', '');
      const activeVideo = videos.find(v => v.id === activeIdStr);
      if (activeVideo && activeVideo.category !== targetPath && onReorderVideos) {
        const updatedVideos = videos.map((v, i) =>
          v.id === activeIdStr ? { ...v, category: targetPath, order: i } : { ...v, order: i }
        );
        onReorderVideos(updatedVideos);
      }
      resetDragState();
      return;
    }

    if (activeIdStr.startsWith('folder-') && overIdStr.startsWith('folder-')) {
      const activePath = activeIdStr.replace('folder-', '');
      const overPath = overIdStr.replace('folder-', '');

      if (activePath !== overPath && onReorderVideos) {
        const activeParent = getParentPath(activePath);
        const overParent = getParentPath(overPath);

        if (activeParent === overParent) {
          const parentNode = activeParent === '' ? root : findNode(root, activeParent);
          if (parentNode) {
            const siblingPaths = parentNode.children.map(c => c.path);
            const oldIdx = siblingPaths.indexOf(activePath);
            const newIdx = siblingPaths.indexOf(overPath);
            if (oldIdx !== -1 && newIdx !== -1) {
              const newSiblingOrder = [...siblingPaths];
              const [moved] = newSiblingOrder.splice(oldIdx, 1);
              newSiblingOrder.splice(newIdx, 0, moved);

              const belongsTo = (v: TrainingVideo, fp: string) => {
                const cat = v.category ?? '';
                return cat === fp || cat.startsWith(fp + '/');
              };

              const groups: TrainingVideo[][] = siblingPaths.map(sp =>
                videos.filter(v => belongsTo(v, sp)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              );

              const reordered: TrainingVideo[] = [];
              for (const sp of newSiblingOrder) {
                reordered.push(...groups[siblingPaths.indexOf(sp)]);
              }

              const orderValues = groups.flat()
                .map(v => v.order ?? 0)
                .sort((a, b) => a - b);

              const idToOrder = new Map<string, number>();
              reordered.forEach((v, i) => idToOrder.set(v.id, orderValues[i]));

              const updatedVideos = videos
                .map(v => idToOrder.has(v.id) ? { ...v, order: idToOrder.get(v.id)! } : v)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

              onReorderVideos(updatedVideos);
            }
          }
        } else {
          if (overPath.startsWith(activePath + '/')) {
            resetDragState();
            return;
          }

          const activeName = getFolderName(activePath);
          const newFolderPath = joinPath(overPath, activeName);

          const updatedVideos = videos.map((v, i) => {
            const cat = v.category ?? '';
            if (cat === activePath || cat.startsWith(activePath + '/')) {
              return { ...v, category: newFolderPath + cat.slice(activePath.length), order: i };
            }
            return { ...v, order: i };
          });

          const next = new Set(expandedFolders);
          next.add(overPath);
          next.add(newFolderPath);
          onExpandedChange(next);

          onReorderVideos(updatedVideos);
        }
      }
      resetDragState();
      return;
    }

    // Folder dropped on a root-level video → reorder at root level
    if (activeIdStr.startsWith('folder-') && !overIdStr.startsWith('folder-') && onReorderVideos) {
      const activePath = activeIdStr.replace('folder-', '');
      if (getParentPath(activePath) === '') {
        const overVideo = videos.find(v => v.id === overIdStr);
        if (overVideo && (!overVideo.category || overVideo.category.trim() === '')) {
          const belongsTo = (v: TrainingVideo, fp: string) => {
            const cat = v.category ?? '';
            return cat === fp || cat.startsWith(fp + '/');
          };

          type ItemGroup = { id: string; vids: TrainingVideo[] };
          const items: ItemGroup[] = [];

          for (const { video } of root.videos) {
            items.push({ id: video.id, vids: [video] });
          }
          for (const node of root.children) {
            const fv = videos.filter(v => belongsTo(v, node.path)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            items.push({ id: `folder-${node.path}`, vids: fv });
          }

          items.sort((a, b) => {
            const minA = Math.min(...a.vids.map(v => v.order ?? 0));
            const minB = Math.min(...b.vids.map(v => v.order ?? 0));
            return minA - minB;
          });

          const oldIdx = items.findIndex(g => g.id === activeIdStr);
          const newIdx = items.findIndex(g => g.id === overIdStr);

          if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
            const reordered = [...items];
            const [moved] = reordered.splice(oldIdx, 1);
            reordered.splice(newIdx, 0, moved);

            const idToOrder = new Map<string, number>();
            let order = 0;
            for (const group of reordered) {
              for (const v of group.vids) idToOrder.set(v.id, order++);
            }

            const updatedVideos = videos
              .map(v => idToOrder.has(v.id) ? { ...v, order: idToOrder.get(v.id)! } : v)
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

            onReorderVideos(updatedVideos);
          }
          resetDragState();
          return;
        }
      }
    }

    // Video reordering within same folder
    if (!onReorderVideos) { resetDragState(); return; }
    const activeVideo = videos.find(v => v.id === active.id);
    const overVideo = videos.find(v => v.id === over.id);
    if (activeVideo && overVideo && active.id !== over.id) {
      const oldIndex = videos.findIndex(v => v.id === active.id);
      const newIndex = videos.findIndex(v => v.id === over.id);
      const newVideos = [...videos];
      const [moved] = newVideos.splice(oldIndex, 1);
      if (overVideo.category !== moved.category) moved.category = overVideo.category;
      newVideos.splice(newIndex, 0, moved);
      onReorderVideos(newVideos.map((v, i) => ({ ...v, order: i })));
    }
    resetDragState();
  };

  const activeVideo = activeId && !activeId.startsWith('folder-') ? videos.find(v => v.id === activeId) : null;
  const activeFolderPath = activeId?.startsWith('folder-') ? activeId.replace('folder-', '') : null;
  const activeFolderName = activeFolderPath ? getFolderName(activeFolderPath) : null;

  const rootItems = [
    ...root.videos.map(({ video, index }) => ({
      type: 'video' as const,
      id: video.id,
      video,
      index,
      sortKey: video.order ?? 0,
    })),
    ...root.children.map(node => ({
      type: 'folder' as const,
      id: `folder-${node.path}`,
      node,
      sortKey: getNodeMinOrder(node),
    })),
  ].sort((a, b) => a.sortKey - b.sortKey);

  const allRootIds = rootItems.map(item => item.id);

  const handleCreateSubFolder = (parentPath: string) => {
    if (onCreateSubFolder) {
      onCreateSubFolder(parentPath);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={resetDragState}
    >
      <div className="space-y-0.5">
        <SortableContext items={allRootIds} strategy={verticalListSortingStrategy}>
          {rootItems.map(item =>
            item.type === 'video' ? (
              <SortableVideoItem
                key={item.id}
                video={item.video}
                index={item.index}
                depth={0}
                onVideoSelect={onVideoSelect}
                onEditVideo={onEditVideo}
                onDeleteVideo={onDeleteVideo}
              />
            ) : (
              <RecursiveFolderItem
                key={item.id}
                node={item.node}
                depth={0}
                expandedFolders={expandedFolders}
                dropTargetFolder={dropTargetFolder}
                activeType={activeType}
                onToggle={toggleFolder}
                onEditFolder={onEditFolder}
                onDeleteFolder={onDeleteFolder}
                onAddPageToFolder={onAddPageToFolder}
                onCreateSubFolder={handleCreateSubFolder}
                onVideoSelect={onVideoSelect}
                onEditVideo={onEditVideo}
                onDeleteVideo={onDeleteVideo}
              />
            )
          )}
        </SortableContext>
      </div>

      {createPortal(
        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
          {activeVideo ? (
            <div className="flex items-center gap-2 p-2 bg-background border-2 border-primary rounded-lg shadow-lg">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <Play className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{activeVideo.title}</span>
            </div>
          ) : activeFolderName ? (
            <div className="flex items-center gap-2 p-2 bg-background border-2 border-primary rounded-lg shadow-lg">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <Folder className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">{activeFolderName}</span>
            </div>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
