import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Play, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { getVideoEmbedInfo, formatDuration } from './videoUtils';
import { VideoEditForm } from './VideoEditForm';
import type { TrainingVideo } from '@/hooks/useProducts';

interface VideoListItemProps {
  video: TrainingVideo;
  index: number;
  isEditing: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEdit: () => void;
  onUpdate: (updatedVideo: TrainingVideo) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  existingCategories?: string[];
}

export function VideoListItem({
  video,
  index,
  isEditing,
  canMoveUp,
  canMoveDown,
  onEdit,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  existingCategories = []
}: VideoListItemProps) {
  if (isEditing) {
    return (
      <div className="border rounded-lg p-4">
        <VideoEditForm
          video={video}
          onUpdate={onUpdate}
          existingCategories={existingCategories}
        />
      </div>
    );
  }

  const videoInfo = getVideoEmbedInfo(video.url);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{video.title}</h4>
            {video.duration && (
              <Badge variant="outline" className="text-micro">
                <Clock className="h-3 w-3 mr-1" />
                {formatDuration(video.duration)}
              </Badge>
            )}
            {video.rich_content && (
              <Badge variant="secondary" className="text-micro">
                Rich
              </Badge>
            )}
          </div>
          {video.description && (
            <p className="text-sm text-muted-foreground">{video.description}</p>
          )}
          <p className="text-micro text-muted-foreground truncate max-w-[300px]">{video.url}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={onMoveUp} disabled={!canMoveUp}>
            <ArrowUp className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onMoveDown} disabled={!canMoveDown}>
            <ArrowDown className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {videoInfo && (
        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
          <iframe
            src={videoInfo.embedUrl}
            title={video.title}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}
    </div>
  );
}