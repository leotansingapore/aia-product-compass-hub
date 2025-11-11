import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useVideoForm } from '@/hooks/useVideoForm';
import { VideoBasicInfo } from './VideoBasicInfo';
import { CategorySelector } from './CategorySelector';
import { VideoContentTabs } from './VideoContentTabs';
import { VideoFormActions } from './VideoFormActions';
import { RichTextEditor } from '@/components/RichTextEditor';
import type { TrainingVideo } from '@/hooks/useProducts';

interface VideoEditFormProps {
  video: TrainingVideo;
  onUpdate: (updatedVideo: TrainingVideo) => void;
  onSave: () => void;
  onCancel: () => void;
  existingCategories?: string[];
}

export function VideoEditForm({ 
  video, 
  onUpdate, 
  onSave, 
  onCancel, 
  existingCategories = [] 
}: VideoEditFormProps) {
  const {
    editVideo,
    isDetectingDuration,
    newCategoryName,
    showNewCategoryInput,
    setNewCategoryName,
    setShowNewCategoryInput,
    handleChange,
    resetForm
  } = useVideoForm({ initialVideo: video, onUpdate });

  const handleSave = () => {
    onUpdate(editVideo);
    onSave();
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const handleCreateCategory = () => {
    // Category creation logic handled in CategorySelector
  };

  // Mode detection: Determine if we should use rich editor or structured form
  const shouldUseRichEditor = (video: TrainingVideo): boolean => {
    return !!video.rich_content;
  };

  const isRichMode = shouldUseRichEditor(editVideo);

  // Rich Editor Mode: Show rich text editor for content
  if (isRichMode) {
    const handleRichContentSave = async (html: string) => {
      const updatedVideo = { ...editVideo, rich_content: html };
      onUpdate(updatedVideo);
      onSave();
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
            onSave={handleRichContentSave}
            onCancel={handleCancel}
            placeholder="Add video description, notes, transcript, and links..."
          />
        </div>
      </div>
    );
  }

  // Structured Form Mode: Show traditional form (backwards compatible)
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

      <VideoFormActions
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}