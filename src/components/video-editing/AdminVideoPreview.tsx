import { Play } from 'lucide-react';
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
      <div 
        className={`${className} cursor-pointer hover:bg-primary/10 hover:border-primary/20 border-2 border-dashed border-primary/30 p-4 rounded transition-all duration-200 bg-primary/5`}
        onClick={() => {
          console.log('🎞️ AdminVideoPreview: Empty state clicked');
          onClick();
        }}
        title="🔧 ADMIN MODE: Click to add/edit training videos"
      >
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🎬</div>
            <p className="text-muted-foreground">Training videos coming soon</p>
            <p className="text-sm text-muted-foreground mt-2">Click to add videos</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('🎞️ AdminVideoPreview: Rendering video list with', safeVideos.length, 'videos');
  
  return (
    <div 
      className={`${className} cursor-pointer hover:bg-primary/10 hover:border-primary/20 border-2 border-dashed border-primary/30 p-4 rounded transition-all duration-200 bg-primary/5`}
      onClick={() => {
        console.log('🎞️ AdminVideoPreview: Video list clicked');
        onClick();
      }}
      title="🔧 ADMIN MODE: Click to add/edit training videos"
    >
      <div className="space-y-4">
        {safeVideos.map((video, index) => {
          // Ensure video object is valid
          if (!video || typeof video !== 'object') {
            console.warn('🎞️ AdminVideoPreview: Invalid video object at index', index, video);
            return null;
          }

          return (
            <div key={video.id || index} className="flex items-center gap-3 p-3 bg-background rounded border">
              <Play className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{video.title || 'Untitled Video'}</p>
                {video.description && (
                  <p className="text-sm text-muted-foreground">{video.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}