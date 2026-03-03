import { useState, useEffect } from 'react';
import { VideoEditForm } from './VideoEditForm';
import { Button } from '@/components/ui/button';
import { SquarePen, Link2, FileText } from 'lucide-react';
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
          /* ========== PREVIEW MODE (Student POV layout) ========== */
          <div className="flex gap-6">
            {/* Left Sidebar — Transcript & Resources (mirrors student view) */}
            <div className="w-72 shrink-0 space-y-4 hidden lg:block">
              {/* Transcript Accordion */}
              {currentVideo.transcript && (
                <div className="border rounded-lg bg-card">
                  <details className="group">
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <FileText className="h-4 w-4" />
                        Transcript
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <div className="px-4 pb-4">
                      <div className="max-h-[400px] overflow-y-auto">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {currentVideo.transcript}
                        </p>
                      </div>
                    </div>
                  </details>
                </div>
              )}

              {/* Resources */}
              {((currentVideo.useful_links?.length ?? 0) > 0 || (currentVideo.attachments?.length ?? 0) > 0) && (
                <div className="border rounded-lg bg-card p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Resources</h3>
                  <div className="space-y-1.5">
                    {currentVideo.useful_links?.map((link, index) => (
                      <div key={`link-${index}`} className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline truncate"
                        >
                          {link.name}
                        </a>
                      </div>
                    ))}
                    {currentVideo.attachments?.map((attachment) => (
                      <div key={`file-${attachment.id}`} className="flex items-center gap-2">
                        {(attachment.file_type || '').toLowerCase() === 'pdf' ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-red-100 text-red-600 text-[10px] font-bold flex-shrink-0">PDF</span>
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline truncate"
                        >
                          {attachment.name}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              <div className="border rounded-lg bg-card">
                <div className="p-8">
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

                  {/* Video Player */}
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
                </div>
              </div>

              {/* Mobile: Transcript & Resources below content */}
              <div className="lg:hidden space-y-4 mt-4">
                {currentVideo.transcript && (
                  <div className="border rounded-lg bg-card">
                    <details className="group">
                      <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <FileText className="h-4 w-4" />
                          Transcript
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                      </summary>
                      <div className="px-4 pb-4">
                        <div className="max-h-[400px] overflow-y-auto">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {currentVideo.transcript}
                          </p>
                        </div>
                      </div>
                    </details>
                  </div>
                )}

                {((currentVideo.useful_links?.length ?? 0) > 0 || (currentVideo.attachments?.length ?? 0) > 0) && (
                  <div className="border rounded-lg bg-card p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Resources</h3>
                    <div className="space-y-1.5">
                      {currentVideo.useful_links?.map((link, index) => (
                        <div key={`link-${index}`} className="flex items-center gap-2">
                          <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                            {link.name}
                          </a>
                        </div>
                      ))}
                      {currentVideo.attachments?.map((attachment) => (
                        <div key={`file-${attachment.id}`} className="flex items-center gap-2">
                          {(attachment.file_type || '').toLowerCase() === 'pdf' ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-red-100 text-red-600 text-[10px] font-bold flex-shrink-0">PDF</span>
                          ) : (
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                            {attachment.name}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
