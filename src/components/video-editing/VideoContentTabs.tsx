import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TrainingVideo } from '@/hooks/useProducts';

interface VideoContentTabsProps {
  video: TrainingVideo;
  onChange: (field: keyof TrainingVideo, value: any) => void;
}

export function VideoContentTabs({ video, onChange }: VideoContentTabsProps) {
  return (
    <Tabs defaultValue="notes" className="w-full">
      <TabsList>
        <TabsTrigger value="notes">Learning Notes</TabsTrigger>
        <TabsTrigger value="transcript">Transcript</TabsTrigger>
      </TabsList>
      
      <TabsContent value="notes" className="space-y-2">
        <Label>Learning Notes</Label>
        <Textarea
          value={video.notes || ''}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="Add learning notes, key points, or additional context..."
          rows={3}
        />
      </TabsContent>
      
      <TabsContent value="transcript" className="space-y-2">
        <Label>Video Transcript</Label>
        <Textarea
          value={video.transcript || ''}
          onChange={(e) => onChange('transcript', e.target.value)}
          placeholder="Paste the full video transcript here..."
          rows={4}
        />
      </TabsContent>
    </Tabs>
  );
}