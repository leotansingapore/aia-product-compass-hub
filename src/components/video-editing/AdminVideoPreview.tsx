import { Play } from 'lucide-react';
import type { TrainingVideo } from '@/hooks/useProducts';

interface AdminVideoPreviewProps {
  videos: TrainingVideo[];
  className?: string;
  onClick: () => void;
}

export function AdminVideoPreview({ videos, className = "", onClick }: AdminVideoPreviewProps) {
  if (videos.length === 0) {
    return (
      <div 
        className={`${className} cursor-pointer hover:bg-primary/10 hover:border-primary/20 border-2 border-dashed border-primary/30 p-4 rounded transition-all duration-200 bg-primary/5`}
        onClick={onClick}
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

  return (
    <div 
      className={`${className} cursor-pointer hover:bg-primary/10 hover:border-primary/20 border-2 border-dashed border-primary/30 p-4 rounded transition-all duration-200 bg-primary/5`}
      onClick={onClick}
      title="🔧 ADMIN MODE: Click to add/edit training videos"
    >
      <div className="space-y-4">
        {videos.map((video, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-background rounded border">
            <Play className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{video.title}</p>
              {video.description && (
                <p className="text-sm text-muted-foreground">{video.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}