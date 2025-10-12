import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, Loader2 } from 'lucide-react';
import { formatDuration } from './videoUtils';
import type { TrainingVideo } from '@/hooks/useProducts';

interface VideoBasicInfoProps {
  video: TrainingVideo;
  isDetectingDuration: boolean;
  onChange: (field: keyof TrainingVideo, value: any) => void;
}

export function VideoBasicInfo({ video, isDetectingDuration, onChange }: VideoBasicInfoProps) {
  return (
    <>
      <div>
        <Label>Video Title</Label>
        <Input
          value={video.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="Video title"
        />
      </div>

      <div>
        <Label>Video URL</Label>
        <div className="space-y-2">
          <Input
            value={video.url}
            onChange={(e) => onChange('url', e.target.value)}
            placeholder="🔗 YouTube, Loom, Vimeo, or Wistia link"
          />
          {/* Duration Display */}
          {(video.duration || isDetectingDuration) && (
            <div className="flex items-center gap-2">
              {isDetectingDuration ? (
                <Badge variant="secondary" className="text-micro">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Updating duration...
                </Badge>
              ) : video.duration ? (
                <Badge variant="outline" className="text-micro">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDuration(video.duration)}
                </Badge>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </>
  );
}