import { Suspense, lazy, useCallback, useEffect, useRef } from 'react';
import { useVideoForm } from '@/hooks/useVideoForm';
import { ActionStepsEditor } from './ActionStepsEditor';
import { structuredToMarkdown, createLegacyBackup } from '@/utils/videoContentConverter';
import type { TrainingVideo, VideoAttachment, UsefulLink, LessonActionStep } from '@/hooks/useProducts';
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
  hideTranscript?: boolean;
  hideResources?: boolean;
  /** When true, surfaces the ActionStepsEditor above the rich editor. CMFAS
   *  products opt-in via the parent page's category check; other products
   *  keep the generic editor unchanged. */
  showActionSteps?: boolean;
}

export function VideoEditForm({
  video,
  onUpdate,
  existingCategories = [],
  hideTranscript = false,
  hideResources = false,
  showActionSteps = false,
}: VideoEditFormProps) {
  const {
    editVideo,
    handleChange,
  } = useVideoForm({ initialVideo: video, onUpdate });

  // Auto-migrate legacy videos to rich editor on first open: if this video
  // doesn't have `rich_content` yet, convert its structured fields
  // (description / transcript / etc.) to markdown once so admins never see
  // the old bifurcated form. Backs the original fields up in `legacy_fields`
  // before the conversion so nothing is destroyed.
  const migrationRanForVideoIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (editVideo.rich_content !== undefined) return;
    if (migrationRanForVideoIdRef.current === editVideo.id) return;
    migrationRanForVideoIdRef.current = editVideo.id;
    const markdown = structuredToMarkdown(editVideo);
    const backup = createLegacyBackup(editVideo);
    onUpdate({ ...editVideo, rich_content: markdown, legacy_fields: backup });
  }, [editVideo, onUpdate]);

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

  const handleActionStepsChange = useCallback(
    (next: LessonActionStep[]) => {
      handleChange('action_steps', next);
    },
    [handleChange],
  );

  // Only ever the Skool-style rich editor — legacy structured form removed.
  // The migration effect above ensures `rich_content` is populated before
  // render, so the editor always opens with the learner's view of the
  // content pre-filled (title inline, media embeds rendered, markdown live).
  return (
    <div className="space-y-4">
      {showActionSteps && (
        <ActionStepsEditor
          steps={editVideo.action_steps ?? []}
          onChange={handleActionStepsChange}
        />
      )}
      <Suspense fallback={<Skeleton className="h-[500px] w-full rounded-lg" />}>
        <RichContentEditor
          value={editVideo.rich_content ?? ''}
          onChange={(value) => handleChange('rich_content', value)}
          placeholder="Start writing, or type '/' for commands..."
          title={editVideo.title || ''}
          onTitleChange={(title) => handleChange('title', title)}
          transcript={hideTranscript ? undefined : (editVideo.transcript || '')}
          onTranscriptChange={hideTranscript ? undefined : ((transcript) => handleChange('transcript', transcript))}
          usefulLinks={hideResources ? undefined : (editVideo.useful_links || [])}
          attachments={hideResources ? undefined : (editVideo.attachments || [])}
          onAddLink={hideResources ? undefined : handleAddLink}
          onAddFile={hideResources ? undefined : handleAddFile}
          onDeleteLink={hideResources ? undefined : handleDeleteLink}
          onDeleteAttachment={hideResources ? undefined : handleDeleteAttachment}
          published={editVideo.published ?? true}
          onPublishedChange={(val) => handleChange('published', val)}
        />
      </Suspense>
    </div>
  );
}
