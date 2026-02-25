import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles } from 'lucide-react';
import { Suspense, lazy, useCallback } from 'react';
import { useVideoForm } from '@/hooks/useVideoForm';
import { VideoBasicInfo } from './VideoBasicInfo';
import { VideoContentTabs } from './VideoContentTabs';
import { structuredToMarkdown, createLegacyBackup } from '@/utils/videoContentConverter';
import type { TrainingVideo, VideoAttachment, UsefulLink } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy-load the rich editor for performance
const RichContentEditor = lazy(() =>
  import('@/components/markdown/RichContentEditor').then((m) => ({
    default: m.RichContentEditor,
  }))
);

interface VideoEditFormProps {
  video: TrainingVideo;
  onUpdate: (updatedVideo: TrainingVideo) => void;
  existingCategories?: string[];
}

export function VideoEditForm({
  video,
  onUpdate,
  existingCategories = [],
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

  // Mode detection: Determine if we should use rich editor or structured form
  const shouldUseRichEditor = (video: TrainingVideo): boolean => {
    return video.rich_content !== undefined;
  };

  const isRichMode = shouldUseRichEditor(editVideo);

  // Conversion function: Switch from structured → rich editor
  const handleSwitchToRichEditor = () => {
    const markdown = structuredToMarkdown(editVideo);
    const backup = createLegacyBackup(editVideo);

    const updatedVideo = {
      ...editVideo,
      rich_content: markdown,
      legacy_fields: backup
    };

    onUpdate(updatedVideo);
  };

  // Resource handlers
  const handleAddLink = useCallback((label: string, url: string) => {
    const currentLinks = editVideo.useful_links || [];
    const newLink: UsefulLink = { name: label, url, icon: '🔗' };
    handleChange('useful_links', [...currentLinks, newLink]);
  }, [editVideo.useful_links, handleChange]);

  const handleAddFile = useCallback((attachment: VideoAttachment) => {
    const currentAttachments = editVideo.attachments || [];
    handleChange('attachments', [...currentAttachments, attachment]);
  }, [editVideo.attachments, handleChange]);

  const handleDeleteLink = useCallback((index: number) => {
    const currentLinks = editVideo.useful_links || [];
    handleChange('useful_links', currentLinks.filter((_, i) => i !== index));
  }, [editVideo.useful_links, handleChange]);

  const handleDeleteAttachment = useCallback((id: string) => {
    const currentAttachments = editVideo.attachments || [];
    handleChange('attachments', currentAttachments.filter(a => a.id !== id));
  }, [editVideo.attachments, handleChange]);

  // Rich Editor Mode — Skool-style: inline title + content + transcript all in one card
  if (isRichMode) {
    return (
      <Suspense fallback={<Skeleton className="h-[500px] w-full rounded-lg" />}>
        <RichContentEditor
          value={editVideo.rich_content || ''}
          onChange={(value) => handleChange('rich_content', value)}
          placeholder="Start writing, or type '/' for commands..."
          title={editVideo.title || ''}
          onTitleChange={(title) => handleChange('title', title)}
          transcript={editVideo.transcript || ''}
          onTranscriptChange={(transcript) => handleChange('transcript', transcript)}
          usefulLinks={editVideo.useful_links || []}
          attachments={editVideo.attachments || []}
          onAddLink={handleAddLink}
          onAddFile={handleAddFile}
          onDeleteLink={handleDeleteLink}
          onDeleteAttachment={handleDeleteAttachment}
          published={editVideo.published ?? true}
          onPublishedChange={(val) => handleChange('published', val)}
        />
      </Suspense>
    );
  }

  // Structured Form Mode: Show traditional form (backwards compatible)
  return (
    <div className="space-y-4">
      <Alert className="bg-primary/5 border-primary/20">
        <Sparkles className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          Try the new Rich Editor for a better editing experience!
          <Button
            onClick={handleSwitchToRichEditor}
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
