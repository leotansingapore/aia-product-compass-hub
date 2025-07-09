import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Clock, Loader2, FolderPlus } from 'lucide-react';
import { fetchVideoDuration, formatDuration } from './videoUtils';
import type { TrainingVideo } from '@/hooks/useProducts';

interface VideoEditFormProps {
  video: TrainingVideo;
  onUpdate: (updatedVideo: TrainingVideo) => void;
  onSave: () => void;
  onCancel: () => void;
  existingCategories?: string[];
}

export function VideoEditForm({ video, onUpdate, onSave, onCancel, existingCategories = [] }: VideoEditFormProps) {
  const [editVideo, setEditVideo] = useState<TrainingVideo>(video);
  const [isDetectingDuration, setIsDetectingDuration] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  // Auto-detect duration when URL changes
  useEffect(() => {
    const detectDuration = async () => {
      if (editVideo.url.trim() && editVideo.url !== video.url) {
        setIsDetectingDuration(true);
        try {
          const duration = await fetchVideoDuration(editVideo.url);
          if (duration) {
            const updated = { ...editVideo, duration };
            setEditVideo(updated);
            onUpdate(updated);
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
  }, [editVideo.url, video.url, onUpdate]);

  const handleChange = (field: keyof TrainingVideo, value: any) => {
    const updated = { ...editVideo, [field]: value };
    setEditVideo(updated);
    onUpdate(updated);
  };

  const handleSave = () => {
    onUpdate(editVideo);
    onSave();
  };

  const handleCancel = () => {
    setEditVideo(video);
    onCancel();
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Video Title</Label>
        <Input
          value={editVideo.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Video title"
        />
      </div>

      <div>
        <Label>Video URL</Label>
        <div className="space-y-2">
          <Input
            value={editVideo.url}
            onChange={(e) => handleChange('url', e.target.value)}
            placeholder="🔗 YouTube, Loom, Vimeo, or Wistia link"
          />
          {/* Duration Display */}
          {(editVideo.duration || isDetectingDuration) && (
            <div className="flex items-center gap-2">
              {isDetectingDuration ? (
                <Badge variant="secondary" className="text-xs">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Updating duration...
                </Badge>
              ) : editVideo.duration ? (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDuration(editVideo.duration)}
                </Badge>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div>
        <Label>Category</Label>
        <div className="space-y-2">
          <Select
            value={editVideo.category || ''}
            onValueChange={(value) => {
              if (value === 'create-new') {
                setShowNewCategoryInput(true);
              } else {
                handleChange('category', value);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select or create category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No Category</SelectItem>
              {existingCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
              <SelectItem value="create-new">
                <div className="flex items-center gap-2">
                  <FolderPlus className="h-4 w-4" />
                  Create New Category
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          {showNewCategoryInput && (
            <div className="flex gap-2">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newCategoryName.trim()) {
                    handleChange('category', newCategoryName.trim());
                    setNewCategoryName('');
                    setShowNewCategoryInput(false);
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => {
                  if (newCategoryName.trim()) {
                    handleChange('category', newCategoryName.trim());
                    setNewCategoryName('');
                    setShowNewCategoryInput(false);
                  }
                }}
                disabled={!newCategoryName.trim()}
              >
                Create
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setNewCategoryName('');
                  setShowNewCategoryInput(false);
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={editVideo.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
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
            value={editVideo.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Add learning notes, key points, or additional context..."
            rows={3}
          />
        </TabsContent>
        
        <TabsContent value="transcript" className="space-y-2">
          <Label>Video Transcript</Label>
          <Textarea
            value={editVideo.transcript || ''}
            onChange={(e) => handleChange('transcript', e.target.value)}
            placeholder="Paste the full video transcript here..."
            rows={4}
          />
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave}>
          <Check className="h-4 w-4 mr-1" />
          Save Changes
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancel}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}