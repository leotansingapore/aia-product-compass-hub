import { useState, useMemo, memo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Play, Clock, CheckCircle2, Circle, Brain, ClipboardList } from 'lucide-react';
import { formatDuration } from './videoUtils';
import type { TrainingVideo } from '@/hooks/useProducts';
import { getVideoSlug } from '@/utils/slugUtils';

interface VideosByCategoryProps {
  videos: TrainingVideo[];
  onVideoSelect?: (index: number) => void;
  getVideoProgress: (videoId: string) => { completed: boolean } | undefined;
  onToggleComplete?: (videoId: string, currentlyCompleted: boolean) => void;
  useIndividualPages?: boolean;
  currentVideoId?: string;
  moduleId?: string;
  moduleType?: 'product' | 'cmfas';
}

export const VideosByCategory = memo(function VideosByCategory({
  videos,
  onVideoSelect,
  getVideoProgress,
  onToggleComplete,
  useIndividualPages = false,
  currentVideoId,
  moduleId,
  moduleType = 'product'
}: VideosByCategoryProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { productSlugOrId } = useParams();

  // Group videos by category - memoized
  const videosByCategory = useMemo(() => videos.reduce((acc, video, index) => {
    const category = video.category || 'Getting Started';
    if (!acc[category]) acc[category] = [];
    acc[category].push({ video, index });
    return acc;
  }, {} as Record<string, Array<{ video: TrainingVideo; index: number }>>), [videos]);

  const toggleCategory = useCallback((category: string) => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
  }, []);

  const getCategoryProgress = useCallback((videoItems: Array<{ video: TrainingVideo; index: number }>) => {
    const completedCount = videoItems.filter(({ video }) => getVideoProgress(video.id)?.completed).length;
    return { completed: completedCount, total: videoItems.length };
  }, [getVideoProgress]);

  const getCategoryDuration = useCallback((videoItems: Array<{ video: TrainingVideo; index: number }>) => {
    return videoItems.reduce((sum, { video }) => sum + (video.duration || 0), 0);
  }, []);

  const handleVideoClick = useCallback((video: TrainingVideo, index: number) => {
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
  }, [useIndividualPages, moduleType, moduleId, productSlugOrId, navigate, onVideoSelect]);

  const categories = Object.entries(videosByCategory);
  const isSingleCategory = categories.length === 1;

  return (
    <div className="space-y-3">
      {categories.map(([category, videoItems]) => {
        const progress = getCategoryProgress(videoItems);
        const duration = getCategoryDuration(videoItems);
        const allDone = progress.completed === progress.total && progress.total > 0;
        // Default open: always open (collapsed state only persisted when user explicitly toggles)
        const isOpen = openCategories[category] !== undefined ? openCategories[category] : true;
        const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

        return (
          <Collapsible key={category} open={isOpen} onOpenChange={() => toggleCategory(category)}>
            {/* Category header — only show if multiple categories */}
            {!isSingleCategory && (
              <CollapsibleTrigger asChild>
                <button className={`w-full text-left rounded-lg border px-4 py-3 transition-colors ${
                  allDone ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border hover:bg-muted/50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      <span className="font-semibold text-sm sm:text-base">{category}</span>
                      {allDone && (
                        <Badge className="text-xs bg-primary/20 text-primary border-0">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Done
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {duration > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(duration)}
                        </span>
                      )}
                      <span className="font-medium tabular-nums">{progress.completed}/{progress.total}</span>
                    </div>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </button>
              </CollapsibleTrigger>
            )}

            <CollapsibleContent className={`space-y-2 ${!isSingleCategory ? 'pt-2 pl-2 sm:pl-3' : ''}`}>
              {videoItems.map(({ video, index }) => {
                const videoProgress = getVideoProgress(video.id);
                const isCompleted = !!videoProgress?.completed;
                const isCurrentVideo = currentVideoId === video.id;

                return (
                  <div
                    key={`${category}-${index}-${video.id}`}
                    className={`group flex items-stretch gap-0 border rounded-lg overflow-hidden transition-all ${
                      isCurrentVideo
                        ? 'border-primary shadow-sm'
                        : isCompleted
                        ? 'border-primary/20 bg-primary/5'
                        : 'border-border hover:border-primary/30 hover:shadow-sm'
                    }`}
                  >
                    {/* Left accent strip */}
                    <div className={`w-1 flex-shrink-0 ${isCompleted ? 'bg-primary' : isCurrentVideo ? 'bg-primary' : 'bg-transparent group-hover:bg-primary/30'} transition-colors`} />

                    {/* Main content */}
                    <div className="flex items-center gap-3 p-3 flex-1 min-w-0">
                      {/* Completion toggle — prominent & labelled */}
                      {onToggleComplete ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(video.id, isCompleted);
                          }}
                          className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                            isCompleted
                              ? 'bg-green-600 border-green-600 text-white hover:bg-green-700'
                              : 'bg-background border-border text-muted-foreground hover:bg-primary/5 hover:border-primary/40 hover:text-primary'
                          }`}
                          title={isCompleted ? 'Click to mark incomplete' : 'Click to mark complete'}
                          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                          <span className="hidden sm:inline whitespace-nowrap">
                            {isCompleted ? 'Completed' : 'Mark complete'}
                          </span>
                        </button>
                      ) : (
                        <div className={`flex-shrink-0 ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                          {isCompleted ? <CheckCircle2 className="h-5 w-5" /> :
                           video.type === 'quiz' ? <Brain className="h-5 w-5" /> :
                           video.type === 'assignment' ? <ClipboardList className="h-5 w-5" /> :
                           <Play className="h-5 w-5" />}
                        </div>
                      )}

                      {/* Video info — clickable */}
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => handleVideoClick(video, index)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleVideoClick(video, index)}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <h4 className={`font-medium text-sm truncate flex-1 ${
                            isCompleted ? 'text-muted-foreground' : ''
                          }`}>
                            {video.title}
                          </h4>
                          {video.type === 'quiz' && video.quiz_config ? (
                            <span className="text-xs text-primary flex-shrink-0 flex items-center gap-1 font-medium">
                              <Brain className="h-3 w-3" />
                              <span className="hidden sm:inline">Quiz &middot; </span>{video.quiz_config.questions.length} {video.quiz_config.questions.length === 1 ? 'question' : 'questions'}
                            </span>
                          ) : video.type === 'assignment' ? (
                            <span className="text-xs text-amber-600 dark:text-amber-400 flex-shrink-0 flex items-center gap-1 font-medium">
                              <ClipboardList className="h-3 w-3" />
                              Assignment
                            </span>
                          ) : video.duration ? (
                            <span className="text-xs text-muted-foreground flex-shrink-0 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(video.duration)}
                            </span>
                          ) : null}
                        </div>
                        {video.description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {video.description}
                          </p>
                        )}
                      </div>

                      {/* CTA icon */}
                      <button
                        onClick={() => handleVideoClick(video, index)}
                        className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        aria-label={video.type === 'quiz' ? 'Start quiz' : video.type === 'assignment' ? 'View assignment' : 'Watch video'}
                      >
                        {video.type === 'quiz' ? <Brain className="h-4 w-4" /> :
                         video.type === 'assignment' ? <ClipboardList className="h-4 w-4" /> :
                         <Play className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
});
