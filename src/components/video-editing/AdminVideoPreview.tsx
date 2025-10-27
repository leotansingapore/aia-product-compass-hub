import { Play, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TrainingVideo } from '@/hooks/useProducts';

interface AdminVideoPreviewProps {
  videos: TrainingVideo[];
  className?: string;
  onClick: () => void;
}

export function AdminVideoPreview({ videos, className = "", onClick }: AdminVideoPreviewProps) {
  console.log('🎞️ AdminVideoPreview render:', {
    videosCount: videos?.length || 0,
    className
  });

  // Ensure videos is always an array
  const safeVideos = Array.isArray(videos) ? videos : [];

  if (safeVideos.length === 0) {
    console.log('🎞️ AdminVideoPreview: No videos, showing empty state');
    return (
      <div className={`${className} space-y-4`}>
        <div className="flex gap-2 mb-4">
          <Button
            onClick={onClick}
            className="flex-1"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add First Video
          </Button>
        </div>
        <div
          className="cursor-pointer hover:bg-primary/10 hover:border-primary/20 border-2 border-dashed border-primary/30 p-6 rounded transition-all duration-200 bg-primary/5"
          onClick={onClick}
          title="🔧 ADMIN MODE: Click to manage training videos"
        >
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">🎬</div>
              <p className="text-muted-foreground">Training videos coming soon</p>
              <p className="text-sm text-muted-foreground mt-2">Click anywhere to get started</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('🎞️ AdminVideoPreview: Rendering video list with', safeVideos.length, 'videos');

  return (
    <div className={`${className} space-y-4`}>
      <div className="flex gap-2 mb-4">
        <Button
          onClick={onClick}
          variant="default"
          size="lg"
          className="flex-1"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Video
        </Button>
        <Button
          onClick={onClick}
          variant="outline"
          size="lg"
        >
          <Settings className="h-5 w-5 mr-2" />
          Manage
        </Button>
      </div>

      <div
        className="cursor-pointer hover:bg-primary/10 hover:border-primary/20 border-2 border-dashed border-primary/30 p-4 rounded transition-all duration-200 bg-primary/5"
        onClick={onClick}
        title="🔧 ADMIN MODE: Click to edit training videos"
      >
        <div className="space-y-2">
          {safeVideos.map((video) => {
            // Ensure video object is valid
            if (!video || typeof video !== 'object') {
              console.warn('🎞️ AdminVideoPreview: Invalid video object', video);
              return null;
            }

            return (
              <div
                key={video.id}
                className="flex items-center gap-3 p-3 bg-background rounded border"
              >
                <Play className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{video.title || 'Untitled Video'}</p>
                  {video.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                  )}
                  {video.category && (
                    <p className="text-xs text-muted-foreground mt-1">
                      📁 {video.category}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
