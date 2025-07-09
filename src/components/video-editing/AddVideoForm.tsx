import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, Loader2 } from 'lucide-react';
import { fetchVideoDuration, formatDuration } from './videoUtils';
import type { TrainingVideo } from '@/hooks/useProducts';

interface AddVideoFormProps {
  newVideo: TrainingVideo;
  onUpdate: (updatedVideo: TrainingVideo) => void;
  onAdd: () => void;
  disabled: boolean;
}

export function AddVideoForm({ newVideo, onUpdate, onAdd, disabled }: AddVideoFormProps) {
  const [isDetectingDuration, setIsDetectingDuration] = useState(false);

  // Auto-detect duration when URL changes
  useEffect(() => {
    const detectDuration = async () => {
      if (newVideo.url.trim()) {
        setIsDetectingDuration(true);
        try {
          const duration = await fetchVideoDuration(newVideo.url);
          if (duration) {
            onUpdate({ ...newVideo, duration });
          }
        } catch (error) {
          console.warn('Failed to detect video duration:', error);
        } finally {
          setIsDetectingDuration(false);
        }
      }
    };

    const timeoutId = setTimeout(detectDuration, 500); // Debounce URL changes
    return () => clearTimeout(timeoutId);
  }, [newVideo.url, onUpdate]);

  return (
    <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 space-y-4">
      <h4 className="font-medium">Add New Video</h4>
      
      <div>
        <Label>Video Title</Label>
        <Input
          value={newVideo.title}
          onChange={(e) => onUpdate({ ...newVideo, title: e.target.value })}
          placeholder="Video title"
        />
      </div>

      <div>
        <Label>Video URL</Label>
        <div className="space-y-2">
          <Input
            value={newVideo.url}
            onChange={(e) => onUpdate({ ...newVideo, url: e.target.value })}
            placeholder="🔗 YouTube, Loom, Vimeo, or Wistia link"
            onKeyPress={(e) => e.key === 'Enter' && onAdd()}
          />
          {/* Duration Display */}
          {(newVideo.duration || isDetectingDuration) && (
            <div className="flex items-center gap-2">
              {isDetectingDuration ? (
                <Badge variant="secondary" className="text-xs">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Detecting duration...
                </Badge>
              ) : newVideo.duration ? (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDuration(newVideo.duration)}
                </Badge>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={newVideo.description || ''}
          onChange={(e) => onUpdate({ ...newVideo, description: e.target.value })}
          placeholder="Optional description"
          rows={2}
        />
      </div>

      <Tabs defaultValue="notes" className="w-full">
        <TabsList>
          <TabsTrigger value="notes">Learning Notes</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notes" className="space-y-2">
          <Label>Learning Notes</Label>
          <Textarea
            value={newVideo.notes || ''}
            onChange={(e) => onUpdate({ ...newVideo, notes: e.target.value })}
            placeholder="Add learning notes, key points, or additional context..."
            rows={3}
          />
        </TabsContent>
        
        <TabsContent value="transcript" className="space-y-2">
          <Label>Video Transcript</Label>
          <Textarea
            value={newVideo.transcript || ''}
            onChange={(e) => onUpdate({ ...newVideo, transcript: e.target.value })}
            placeholder="Paste the full video transcript here..."
            rows={4}
          />
        </TabsContent>
      </Tabs>

      <Button 
        size="sm" 
        onClick={onAdd} 
        disabled={disabled}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Video
      </Button>
    </div>
  );
}