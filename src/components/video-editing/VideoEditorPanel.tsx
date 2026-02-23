import { useState, useEffect } from 'react';
import { VideoEditForm } from './VideoEditForm';
import { Button } from '@/components/ui/button';
import { SquarePen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { markdownComponents } from '@/lib/markdown-config';
import { getVideoEmbedInfo } from './videoUtils';
import type { TrainingVideo } from '@/hooks/useProducts';

interface VideoEditorPanelProps {
  editVideos: TrainingVideo[];
  editingIndex: number | null;
  newVideo: TrainingVideo;
  existingCategories: string[];
  onEditingIndexChange: (index: number | null) => void;
  onUpdateVideo: (index: number, updatedVideo: TrainingVideo) => void;
  onNewVideoChange: (video: TrainingVideo) => void;
  onAddVideo: () => void;
  onCreateCategory: (categoryName: string) => void;
  lastSavedAt?: number;
}

export function VideoEditorPanel({
  editVideos,
  editingIndex,
  existingCategories,
  onEditingIndexChange,
  onUpdateVideo,
  lastSavedAt,
}: VideoEditorPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const currentVideo = editingIndex !== null ? editVideos[editingIndex] : null;

  // Auto-enter edit mode for new pages (empty content)
  const shouldAutoEdit = currentVideo && !currentVideo.rich_content && !currentVideo.description;

  // Reset edit state when switching between pages
  useEffect(() => {
    setIsEditing(false);
  }, [editingIndex]);

  // Switch to preview mode after save completes
  useEffect(() => {
    if (lastSavedAt) {
      setIsEditing(false);
    }
  }, [lastSavedAt]);

  return (
    <div className="flex-1 h-full">
      {editingIndex !== null && currentVideo ? (
        isEditing || shouldAutoEdit ? (
          /* ========== EDIT MODE ========== */
          <div className="h-full">
            <VideoEditForm
              video={editVideos[editingIndex]}
              onUpdate={(updatedVideo) => onUpdateVideo(editingIndex, updatedVideo)}
              existingCategories={existingCategories}
            />
          </div>
        ) : (
          /* ========== PREVIEW MODE (Skool-style) ========== */
          <div className="border rounded-lg bg-card h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto p-8">
              {/* Title + Edit Button */}
              <div className="flex items-start justify-between mb-6">
                <h1 className="text-2xl font-bold text-foreground leading-tight">
                  {currentVideo.title || 'Untitled'}
                </h1>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="shrink-0"
                  title="Edit"
                >
                  <SquarePen className="h-4 w-4" />
                  Edit
                </Button>
              </div>

              {/* Video Player — show if the page has a video URL */}
              {(() => {
                const embedInfo = currentVideo.url ? getVideoEmbedInfo(currentVideo.url) : null;
                if (!embedInfo) return null;
                return (
                  <div className="relative rounded-lg overflow-hidden bg-muted aspect-video mb-6">
                    <iframe
                      src={embedInfo.embedUrl}
                      title={currentVideo.title}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                );
              })()}

              {/* Rendered Content */}
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={markdownComponents}
                >
                  {currentVideo.rich_content || currentVideo.description || ''}
                </ReactMarkdown>
              </div>

              {/* Transcript (if exists) */}
              {currentVideo.transcript && (
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Transcript</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {currentVideo.transcript}
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        /* ========== EMPTY STATE ========== */
        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/30 h-full flex items-center justify-center">
          <div className="space-y-2">
            <p className="text-sm">Select a page from the sidebar to edit</p>
            <p className="text-xs opacity-60">Or create a new page to get started</p>
          </div>
        </div>
      )}
    </div>
  );
}
