import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Play, Check, Clock } from 'lucide-react';
import { formatDuration } from './videoUtils';
import type { TrainingVideo } from '@/hooks/useProducts';

interface VideosByCategoryProps {
  videos: TrainingVideo[];
  onVideoSelect: (index: number) => void;
  getVideoProgress: (videoId: string) => { completed: boolean } | undefined;
}

export function VideosByCategory({ videos, onVideoSelect, getVideoProgress }: VideosByCategoryProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  // Group videos by category
  const videosByCategory = videos.reduce((acc, video, index) => {
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

  return (
    <div className="space-y-4">
      {Object.entries(videosByCategory).map(([category, videoItems]) => {
        const progress = getCategoryProgress(videoItems);
        const duration = getCategoryDuration(videoItems);
        const isOpen = openCategories[category] ?? true; // Default to open
        
        return (
          <Collapsible key={category} open={isOpen} onOpenChange={() => toggleCategory(category)}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 h-auto">
                <div className="flex items-center gap-3">
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <div className="text-left">
                    <h3 className="font-medium">{category}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                <Badge variant={progress.completed === progress.total ? "default" : "secondary"}>
                  {Math.round((progress.completed / progress.total) * 100)}%
                </Badge>
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-2 pl-6">
              {videoItems.map(({ video, index }) => {
                const videoProgress = getVideoProgress(video.id);
                return (
                  <div
                    key={`${category}-${index}-${video.id}`}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onVideoSelect(index)}
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
                        <h4 className="font-medium truncate">{video.title}</h4>
                        {video.duration && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDuration(video.duration)}
                          </Badge>
                        )}
                      </div>
                      {video.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {video.description}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {index + 1}/{videos.length}
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
}