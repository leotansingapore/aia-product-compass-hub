import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles } from 'lucide-react';
import { useVideoForm } from '@/hooks/useVideoForm';
import { VideoBasicInfo } from './VideoBasicInfo';
import { CategorySelector } from './CategorySelector';
import { VideoContentTabs } from './VideoContentTabs';
import { NotionStyleEditor } from '@/components/notion-editor/NotionStyleEditor';
import { structuredToMarkdown, createLegacyBackup } from '@/utils/videoContentConverter';
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

  // Mode detection: Determine if we should use markdown editor or structured form
  const shouldUseMarkdownEditor = (video: TrainingVideo): boolean => {
    // Check if rich_content property exists (not undefined), not just if it's truthy
    return video.rich_content !== undefined;
  };

  const isMarkdownMode = shouldUseMarkdownEditor(editVideo);

  // Conversion function: Switch from structured → markdown editor
  const handleSwitchToMarkdown = () => {
    const markdown = structuredToMarkdown(editVideo);
    const backup = createLegacyBackup(editVideo);

    const updatedVideo = {
      ...editVideo,
      rich_content: markdown,
      legacy_fields: backup
    };
    
    onUpdate(updatedVideo);
  };

  // Markdown Editor Mode: Show markdown textarea for content
  if (isMarkdownMode) {
    const handleMarkdownChange = (markdown: string) => {
      const updatedVideo = { ...editVideo, rich_content: markdown };
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <NotionStyleEditor
              value={editVideo.rich_content || ''}
              onChange={(value) => handleChange('rich_content', value)}
              placeholder="Type '/' for commands or start writing..."
              autoSave={false}
            />
          </div>

        <div>
          <Label>Transcript (Separate Field)</Label>
          <Textarea
            value={editVideo.transcript || ''}
            onChange={(e) => handleChange('transcript', e.target.value)}
            placeholder="Add video transcript here..."
            rows={8}
            className="font-mono text-sm"
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
          Try the new Markdown Editor for a better editing experience!
          <Button
            onClick={handleSwitchToMarkdown}
            variant="outline"
            size="sm"
            className="ml-3"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Switch to Markdown Editor
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