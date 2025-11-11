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

      {/* Video URL field hidden per user request */}
    </>
  );
}