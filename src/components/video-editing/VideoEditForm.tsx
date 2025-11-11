import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles } from 'lucide-react';
import { useVideoForm } from '@/hooks/useVideoForm';
import { VideoBasicInfo } from './VideoBasicInfo';
import { CategorySelector } from './CategorySelector';
import { VideoContentTabs } from './VideoContentTabs';
import { RichTextEditor } from '@/components/RichTextEditor';
import { structuredToRichHtml, createLegacyBackup } from '@/utils/videoContentConverter';
import type { TrainingVideo } from '@/hooks/useProducts';

interface VideoEditFormProps {
  video: TrainingVideo;
  onUpdate: (updatedVideo: TrainingVideo) => void;
  existingCategories?: string[];
}

export function VideoEditForm({ 
  video, 
  onUpdate, 
  existingCategories = [] 
}: VideoEditFormProps) {
  const {
    editVideo,
    isDetectingDuration,
    newCategoryName,
    showNewCategoryInput,
    setNewCategoryName,
    setShowNewCategoryInput,
    handleChange
  } = useVideoForm({ initialVideo: video, onUpdate });

  const handleCreateCategory = () => {
    // Category creation logic handled in CategorySelector
  };

  // Mode detection: Determine if we should use rich editor or structured form
  const shouldUseRichEditor = (video: TrainingVideo): boolean => {
    return !!video.rich_content;
  };

  const isRichMode = shouldUseRichEditor(editVideo);

  // Conversion function: Switch from structured → rich editor
  const handleSwitchToRich = () => {
    const richHtml = structuredToRichHtml(editVideo);
    const backup = createLegacyBackup(editVideo);

    const updatedVideo = {
      ...editVideo,
      rich_content: richHtml,
      legacy_fields: backup
    };
    
    onUpdate(updatedVideo);
  };

  // Rich Editor Mode: Show rich text editor for content
  if (isRichMode) {
    const handleRichContentChange = (html: string) => {
      const updatedVideo = { ...editVideo, rich_content: html };
      onUpdate(updatedVideo);
    };

    return (
      <div className="space-y-4">
        <VideoBasicInfo
          video={editVideo}
          isDetectingDuration={isDetectingDuration}
          onChange={handleChange}
        />

        <CategorySelector
          video={editVideo}
          existingCategories={existingCategories}
          newCategoryName={newCategoryName}
          showNewCategoryInput={showNewCategoryInput}
          onCategoryChange={(value) => handleChange('category', value)}
          onNewCategoryNameChange={setNewCategoryName}
          onShowNewCategoryInput={setShowNewCategoryInput}
          onCreateCategory={handleCreateCategory}
        />

        <div>
          <Label>Content (Rich Editor)</Label>
          <RichTextEditor
            value={editVideo.rich_content || ''}
            onChange={handleRichContentChange}
            placeholder="Add video description, notes, transcript, and links..."
          />
        </div>
      </div>
    );
  }

  // Structured Form Mode: Show traditional form (backwards compatible)
  return (
    <div className="space-y-4">
      <Alert className="bg-primary/5 border-primary/20">
        <Sparkles className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          Try the new Rich Text Editor for a better editing experience!
          <Button
            onClick={handleSwitchToRich}
            variant="outline"
            size="sm"
            className="ml-3"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Switch to Rich Editor
          </Button>
        </AlertDescription>
      </Alert>

      <VideoBasicInfo
        video={editVideo}
        isDetectingDuration={isDetectingDuration}
        onChange={handleChange}
      />

      <CategorySelector
        video={editVideo}
        existingCategories={existingCategories}
        newCategoryName={newCategoryName}
        showNewCategoryInput={showNewCategoryInput}
        onCategoryChange={(value) => handleChange('category', value)}
        onNewCategoryNameChange={setNewCategoryName}
        onShowNewCategoryInput={setShowNewCategoryInput}
        onCreateCategory={handleCreateCategory}
      />

      <div>
        <Label>Description</Label>
        <Textarea
          value={editVideo.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Optional description"
          rows={2}
        />
      </div>

      <VideoContentTabs
        video={editVideo}
        onChange={handleChange}
      />
    </div>
  );
}