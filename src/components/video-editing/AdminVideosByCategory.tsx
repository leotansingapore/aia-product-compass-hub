import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Play, Check, Clock, GripVertical, Edit } from 'lucide-react';
import { formatDuration } from './videoUtils';
import type { TrainingVideo } from '@/hooks/useProducts';
import { useIsMobile } from '@/hooks/use-mobile';
import { getVideoSlug } from '@/utils/slugUtils';
import { useVideoOrderChanges } from '@/hooks/useVideoOrderChanges';
import { VideoOrderActions } from './VideoOrderActions';
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
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AdminVideosByCategoryProps {
  videos: TrainingVideo[];
  onVideoSelect?: (index: number) => void;
  getVideoProgress: (videoId: string) => { completed: boolean } | undefined;
  useIndividualPages?: boolean;
  currentVideoId?: string;
  moduleId?: string;
  moduleType?: 'product' | 'cmfas';
  onSave: (updatedVideos: TrainingVideo[]) => Promise<void>;
  onEnterEditMode?: () => void;
}

interface SortableVideoItemProps {
  video: TrainingVideo;
  index: number;
  onVideoSelect?: (index: number) => void;
  getVideoProgress: (videoId: string) => { completed: boolean } | undefined;
  totalVideos: number;
  useIndividualPages: boolean;
  currentVideoId?: string;
  moduleId?: string;
  moduleType?: 'product' | 'cmfas';
  navigate: ReturnType<typeof useNavigate>;
  productSlugOrId?: string;
}

function SortableVideoItem({
  video,
  index,
  onVideoSelect,
  getVideoProgress,
  totalVideos,
  useIndividualPages,
  currentVideoId,
  moduleId,
  moduleType,
  navigate,
  productSlugOrId,
}: SortableVideoItemProps) {
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

  const videoProgress = getVideoProgress(video.id);
  const isCurrentVideo = currentVideoId === video.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 sm:gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors min-h-[56px] ${
        isCurrentVideo ? 'bg-primary/10 border-primary shadow-sm' : ''
      }`}
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
      </button>

      <div
        className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 cursor-pointer"
        onClick={() => {
          if (useIndividualPages) {
            const videoSlug = getVideoSlug(video.title);
            if (moduleType === 'cmfas' && moduleId) {
              navigate(`/cmfas/module/${moduleId}/video/${videoSlug}`);
            } else if (productSlugOrId) {
              navigate(`/product/${productSlugOrId}/video/${videoSlug}`);
            }
          } else {
            onVideoSelect?.(index);
          }
        }}
      >
        <div className="flex-shrink-0">
          {videoProgress?.completed ? (
            <Check className="h-5 w-5 text-green-600" />
          ) : (
            <Play className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm sm:text-base truncate">{video.title}</h4>
            {video.duration && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {formatDuration(video.duration)}
              </Badge>
            )}
          </div>
          {video.description && (
            <p className="text-micro sm:text-sm text-muted-foreground truncate">
              {video.description}
            </p>
          )}
        </div>
        <div className="text-micro text-muted-foreground">
          {index + 1}/{totalVideos}
        </div>
      </div>
    </div>
  );
}

export function AdminVideosByCategory({
  videos,
  onVideoSelect,
  getVideoProgress,
  useIndividualPages = false,
  currentVideoId,
  moduleId,
  moduleType = 'product',
  onSave,
  onEnterEditMode,
}: AdminVideosByCategoryProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { productSlugOrId } = useParams();

  const {
    pendingVideos,
    updatePendingVideos,
    hasPendingChanges,
    saveChanges,
    discardChanges,
    isSaving,
    getChangeCount,
    getChangeSummary,
  } = useVideoOrderChanges({
    videos,
    onSave,
  });

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

  // Group videos by category using pendingVideos
  const videosByCategory = pendingVideos.reduce((acc, video, index) => {
    const category = video.category || 'Getting Started';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ video, index });
    return acc;
  }, {} as Record<string, Array<{ video: TrainingVideo; index: number }>>);

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Calculate category completion
  const getCategoryProgress = (videoItems: Array<{ video: TrainingVideo; index: number }>) => {
    const completedCount = videoItems.filter(({ video }) => 
      getVideoProgress(video.id)?.completed
    ).length;
    return { completed: completedCount, total: videoItems.length };
  };

  // Calculate total duration for category
  const getCategoryDuration = (videoItems: Array<{ video: TrainingVideo; index: number }>) => {
    return videoItems.reduce((sum, { video }) => sum + (video.duration || 0), 0);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeVideo = pendingVideos.find(v => v.id === active.id);
    const overVideo = pendingVideos.find(v => v.id === over.id);

    if (!activeVideo || !overVideo || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const oldIndex = pendingVideos.findIndex(v => v.id === active.id);
    const newIndex = pendingVideos.findIndex(v => v.id === over.id);

    const newVideos = [...pendingVideos];
    const [movedVideo] = newVideos.splice(oldIndex, 1);

    // Update category if different
    if (overVideo.category !== movedVideo.category) {
      console.log('📁 AdminVideosByCategory: Moving video between categories', {
        video: movedVideo.title,
        from: movedVideo.category,
        to: overVideo.category
      });
      movedVideo.category = overVideo.category;
    }

    newVideos.splice(newIndex, 0, movedVideo);

    // Reorder all videos
    const reordered = newVideos.map((video, i) => ({ ...video, order: i }));
    updatePendingVideos(reordered);

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeVideo = activeId ? pendingVideos.find(v => v.id === activeId) : null;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="space-y-4">
          {/* Admin help text */}
          <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 flex-shrink-0" />
              <p className="text-micro sm:text-sm">
                <strong>Admin Mode:</strong> Drag videos to reorder within or between categories
              </p>
            </div>
            {onEnterEditMode && (
              <Button 
                onClick={onEnterEditMode}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                <Edit className="h-4 w-4 mr-2" />
                Manage Videos
              </Button>
            )}
          </div>

          {Object.entries(videosByCategory).map(([category, videoItems]) => {
            const progress = getCategoryProgress(videoItems);
            const duration = getCategoryDuration(videoItems);
            const isOpen = openCategories[category] ?? !isMobile;
            const videoIds = videoItems.map(({ video }) => video.id);
            
            return (
              <Collapsible key={category} open={isOpen} onOpenChange={() => toggleCategory(category)}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-3 sm:p-4 h-auto">
                    <div className="flex items-center gap-3">
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <div className="text-left">
                        <h3 className="font-medium text-sm sm:text-base">{category}</h3>
                        <div className="flex items-center gap-2 text-micro sm:text-sm text-muted-foreground">
                          <span>{progress.completed}/{progress.total} completed</span>
                          {duration > 0 && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(duration)}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant={progress.completed === progress.total ? "default" : "secondary"} className="text-xs">
                      {Math.round((progress.completed / progress.total) * 100)}%
                    </Badge>
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-2 pl-4 sm:pl-6">
                  <SortableContext
                    items={videoIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {videoItems.map(({ video, index }) => (
                      <SortableVideoItem
                        key={video.id}
                        video={video}
                        index={index}
                        onVideoSelect={onVideoSelect}
                        getVideoProgress={getVideoProgress}
                        totalVideos={pendingVideos.length}
                        useIndividualPages={useIndividualPages}
                        currentVideoId={currentVideoId}
                        moduleId={moduleId}
                        moduleType={moduleType}
                        navigate={navigate}
                        productSlugOrId={productSlugOrId}
                      />
                    ))}
                  </SortableContext>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        <DragOverlay>
          {activeVideo ? (
            <div className="flex items-center gap-2 p-3 bg-background border-2 border-primary rounded-lg shadow-lg">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <Play className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{activeVideo.title}</span>
              {activeVideo.category && (
                <Badge variant="outline" className="text-xs">
                  {activeVideo.category}
                </Badge>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {hasPendingChanges && (
        <VideoOrderActions
          changeCount={getChangeCount()}
          changeSummary={getChangeSummary()}
          isSaving={isSaving}
          onSave={saveChanges}
          onDiscard={discardChanges}
        />
      )}
    </>
  );
}
