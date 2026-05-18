import { useState, useMemo, memo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Play, Clock, CheckCircle2, Brain, ClipboardList, Search, X } from 'lucide-react';
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

/**
 * Per-video row — extracted from the inline `videoItems.map` in the parent so
 * a single video completing doesn't force a re-render of every sibling row.
 * Receives primitives + a stable handler reference, so `memo()` skip works
 * when only OTHER videos' progress changes.
 */
interface VideoItemProps {
  video: TrainingVideo;
  index: number;
  isCompleted: boolean;
  isCurrentVideo: boolean;
  hasToggleComplete: boolean;
  onToggleComplete?: (videoId: string, currentlyCompleted: boolean) => void;
  onVideoClick: (video: TrainingVideo, index: number) => void;
}

const VideoItem = memo(function VideoItem({
  video,
  index,
  isCompleted,
  isCurrentVideo,
  hasToggleComplete,
  onToggleComplete,
  onVideoClick,
}: VideoItemProps) {
  const lessonNumber = String(index + 1).padStart(2, '0');
  const typeIcon =
    video.type === 'quiz' ? Brain : video.type === 'assignment' ? ClipboardList : Play;
  const TypeIcon = typeIcon;

  return (
    <div
      className={`group flex items-stretch gap-0 border rounded-lg overflow-hidden transition-all ${
        isCurrentVideo
          ? 'border-primary shadow-sm bg-primary/[0.03]'
          : isCompleted
          ? 'border-primary/20 bg-primary/5'
          : 'border-border hover:border-primary/30 hover:shadow-sm'
      }`}
    >
      {/* Left accent strip */}
      <div
        className={`w-1 flex-shrink-0 ${
          isCompleted
            ? 'bg-primary'
            : isCurrentVideo
            ? 'bg-primary'
            : 'bg-transparent group-hover:bg-primary/30'
        } transition-colors`}
      />

      {/* Main content */}
      <div className="flex items-center gap-2.5 py-2.5 pl-2.5 pr-2 flex-1 min-w-0">
        {/* Completion toggle — icon-only checkbox (text was eating the title) */}
        {hasToggleComplete && onToggleComplete ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(video.id, isCompleted);
            }}
            className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              isCompleted
                ? 'bg-primary border-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-background border-muted-foreground/30 text-transparent hover:border-primary hover:text-primary'
            }`}
            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            aria-pressed={isCompleted}
          >
            <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
          </button>
        ) : (
          <div className={`flex-shrink-0 flex items-center justify-center w-7 h-7 ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
            {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <TypeIcon className="h-4 w-4" />}
          </div>
        )}

        {/* Video info — clickable. Title gets full width and wraps to 2 lines. */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onVideoClick(video, index)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onVideoClick(video, index)}
        >
          <h4
            className={`font-medium text-sm leading-snug line-clamp-2 break-words ${
              isCompleted ? 'text-muted-foreground' : ''
            }`}
          >
            <span className="text-muted-foreground/70 text-[11px] font-normal tabular-nums mr-1.5">
              {lessonNumber}
            </span>
            {video.title}
          </h4>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
            {video.type === 'quiz' && video.quiz_config ? (
              <span className="inline-flex items-center gap-1 font-medium text-primary">
                <Brain className="h-3 w-3" />
                {video.quiz_config.questions.length} q
              </span>
            ) : video.type === 'assignment' ? (
              <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                <ClipboardList className="h-3 w-3" />
                Assignment
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Play className="h-3 w-3" />
                Video
              </span>
            )}
            {video.duration ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(video.duration)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
});

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
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { productSlugOrId } = useParams();

  // Filter by search query first, then group by category — memoised together so
  // typing in the search box only retriggers the grouping pass, not every consumer.
  const trimmedQuery = query.trim().toLowerCase();
  const filteredVideos = useMemo(() => {
    if (!trimmedQuery) return videos;
    return videos.filter((v) => (v.title || '').toLowerCase().includes(trimmedQuery));
  }, [videos, trimmedQuery]);

  const videosByCategory = useMemo(() => filteredVideos.reduce((acc, video) => {
    const category = video.category || 'Getting Started';
    if (!acc[category]) acc[category] = [];
    // Preserve the ORIGINAL position in `videos` so click handlers still
    // navigate to the right lesson index when the list is filtered.
    const originalIndex = videos.indexOf(video);
    acc[category].push({ video, index: originalIndex });
    return acc;
  }, {} as Record<string, Array<{ video: TrainingVideo; index: number }>>), [filteredVideos, videos]);

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
  const hasToggleComplete = !!onToggleComplete;
  const showSearch = videos.length >= 6;

  return (
    <div className="space-y-3">
      {showSearch && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${videos.length} lessons…`}
            className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-8 text-xs placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40"
            aria-label="Search lessons"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
      {trimmedQuery && categories.length === 0 && (
        <p className="text-center text-xs text-muted-foreground py-4">
          No lessons match &ldquo;{query}&rdquo;.
        </p>
      )}
      {categories.map(([category, videoItems]) => {
        const progress = getCategoryProgress(videoItems);
        const duration = getCategoryDuration(videoItems);
        const allDone = progress.completed === progress.total && progress.total > 0;
        // Categories named "Old …" or "Archive …" are deprecated content — collapse
        // by default and visually deprioritise so learners hit the current curriculum first.
        const isLegacy = /^old\b/i.test(category) || /\barchive/i.test(category);
        // Auto-expand all groups while searching so the user can see hits in archived sections.
        const defaultOpen = trimmedQuery ? true : !isLegacy;
        const isOpen = openCategories[category] !== undefined ? openCategories[category] : defaultOpen;
        const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

        return (
          <Collapsible key={category} open={isOpen} onOpenChange={() => toggleCategory(category)}>
            {/* Category header — only show if multiple categories */}
            {!isSingleCategory && (
              <CollapsibleTrigger asChild>
                <button className={`w-full text-left rounded-lg border px-4 py-3 transition-colors ${
                  allDone
                    ? 'bg-primary/5 border-primary/20'
                    : isLegacy
                    ? 'bg-muted/20 border-dashed border-muted-foreground/30 hover:bg-muted/30'
                    : 'bg-muted/30 border-border hover:bg-muted/50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      <span className={`font-semibold text-sm sm:text-base ${isLegacy ? 'text-muted-foreground' : ''}`}>{category}</span>
                      {isLegacy && (
                        <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground border-muted-foreground/30">
                          Archived
                        </Badge>
                      )}
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
                  <VideoItem
                    key={`${category}-${index}-${video.id}`}
                    video={video}
                    index={index}
                    isCompleted={isCompleted}
                    isCurrentVideo={isCurrentVideo}
                    hasToggleComplete={hasToggleComplete}
                    onToggleComplete={onToggleComplete}
                    onVideoClick={handleVideoClick}
                  />
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
});
