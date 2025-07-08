import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check } from 'lucide-react';
import type { TrainingVideo } from '@/hooks/useProducts';

interface VideoEditFormProps {
  video: TrainingVideo;
  onUpdate: (updatedVideo: TrainingVideo) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function VideoEditForm({ video, onUpdate, onSave, onCancel }: VideoEditFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Video Title</Label>
          <Input
            value={video.title}
            onChange={(e) => onUpdate({ ...video, title: e.target.value })}
            placeholder="Video title"
          />
        </div>
        <div>
          <Label>Duration (seconds)</Label>
          <Input
            type="number"
            value={video.duration || ''}
            onChange={(e) => onUpdate({ ...video, duration: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="Optional duration"
          />
        </div>
      </div>
      
      <div>
        <Label>Video URL</Label>
        <Input
          value={video.url}
          onChange={(e) => onUpdate({ ...video, url: e.target.value })}
          placeholder="YouTube, Loom, Vimeo, or Wistia link"
        />
      </div>
      
      <div>
        <Label>Description</Label>
        <Textarea
          value={video.description || ''}
          onChange={(e) => onUpdate({ ...video, description: e.target.value })}
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
            value={video.notes || ''}
            onChange={(e) => onUpdate({ ...video, notes: e.target.value })}
            placeholder="Add learning notes, key points, or additional context for learners..."
            rows={4}
          />
        </TabsContent>
        
        <TabsContent value="transcript" className="space-y-2">
          <Label>Video Transcript</Label>
          <Textarea
            value={video.transcript || ''}
            onChange={(e) => onUpdate({ ...video, transcript: e.target.value })}
            placeholder="Paste the full video transcript here..."
            rows={6}
          />
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        <Button size="sm" onClick={onSave}>
          <Check className="h-4 w-4 mr-1" />
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}