import { useState, useEffect } from 'react';
import { VideoEditForm } from './VideoEditForm';
import QuizEditor from './QuizEditor';
import { AssignmentEditor } from './AssignmentEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SquarePen, Eye, Brain, ClipboardList } from 'lucide-react';
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
  onEditingStateChange?: (isEditing: boolean) => void;
  showActionSteps?: boolean;
}

export function VideoEditorPanel({
  editVideos,
  editingIndex,
  existingCategories,
  onEditingIndexChange,
  onUpdateVideo,
  lastSavedAt,
  onEditingStateChange,
  showActionSteps = false,
}: VideoEditorPanelProps) {
  const [isEditing, setIsEditingLocal] = useState(false);

  const setIsEditing = (val: boolean) => {
    setIsEditingLocal(val);
    onEditingStateChange?.(val);
  };
  const currentVideo = editingIndex !== null ? editVideos[editingIndex] : null;

  // Auto-enter edit mode for new pages (empty content)
  const shouldAutoEdit = currentVideo && !currentVideo.rich_content && !currentVideo.description;

  // Reset edit state when switching between pages
  useEffect(() => {
    if (shouldAutoEdit) {
      // New pages auto-enter edit mode — notify parent so sidebar sections become editable
      setIsEditingLocal(true);
      onEditingStateChange?.(true);
    } else {
      setIsEditingLocal(false);
      onEditingStateChange?.(false);
    }
  }, [editingIndex]);

  // Switch to preview mode after save completes
  useEffect(() => {
    if (lastSavedAt) {
      setIsEditingLocal(false);
      onEditingStateChange?.(false);
    }
  }, [lastSavedAt]);

  return (
    <div className="flex-1 h-full">
      {editingIndex !== null && currentVideo ? (
        /* ========== QUIZ EDITOR ========== */
        currentVideo.type === 'quiz' ? (
          <div className="border rounded-lg bg-card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Quiz Editor</h2>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quiz Title</Label>
              <Input
                value={currentVideo.title}
                onChange={(e) => onUpdateVideo(editingIndex, { ...currentVideo, title: e.target.value })}
                placeholder="Quiz title"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description (optional)</Label>
              <Input
                value={currentVideo.description || ''}
                onChange={(e) => onUpdateVideo(editingIndex, { ...currentVideo, description: e.target.value })}
                placeholder="Brief description of this quiz"
              />
            </div>
            <QuizEditor
              quizConfig={currentVideo.quiz_config || { questions: [] }}
              onChange={(config) => onUpdateVideo(editingIndex, { ...currentVideo, quiz_config: config })}
              sourceVideos={editVideos
                .filter(v => (!v.type || v.type === 'video') && v.id !== currentVideo.id)
                .map(v => ({ id: v.id, title: v.title, rich_content: v.rich_content, transcript: v.transcript }))}
            />
          </div>
        ) :
        /* ========== ASSIGNMENT EDITOR ========== */
        currentVideo.type === 'assignment' ? (
          <div className="border rounded-lg bg-card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-lg font-semibold">Assignment Editor</h2>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Assignment Title</Label>
              <Input
                value={currentVideo.title}
                onChange={(e) => onUpdateVideo(editingIndex, { ...currentVideo, title: e.target.value })}
                placeholder="Assignment title"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description (optional)</Label>
              <Input
                value={currentVideo.description || ''}
                onChange={(e) => onUpdateVideo(editingIndex, { ...currentVideo, description: e.target.value })}
                placeholder="Brief description shown to learners"
              />
            </div>
            <AssignmentEditor
              assignmentConfig={currentVideo.assignment_config || { submission_type: 'text', prompt: '' }}
              onChange={(config) => onUpdateVideo(editingIndex, { ...currentVideo, assignment_config: config })}
            />
          </div>
        ) :
        isEditing || shouldAutoEdit ? (
          /* ========== VIDEO EDIT MODE ========== */
          <div className="h-full">
            {/* Preview toggle — only show when page has content */}
            {currentVideo.rich_content || currentVideo.description ? (
              <div className="flex justify-end px-2 py-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              </div>
            ) : null}
            <VideoEditForm
              video={editVideos[editingIndex]}
              onUpdate={(updatedVideo) => onUpdateVideo(editingIndex, updatedVideo)}
              existingCategories={existingCategories}
              hideTranscript={true}
              hideResources={true}
              showActionSteps={showActionSteps}
            />
          </div>
        ) : (
          /* ========== PREVIEW MODE ========== */
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
                    {embedInfo.type === 'mp4' ? (
                      <video
                        src={embedInfo.embedUrl}
                        title={currentVideo.title}
                        className="w-full h-full"
                        controls
                        controlsList="nodownload"
                        preload="metadata"
                      />
                    ) : (
                      <iframe
                        src={embedInfo.embedUrl}
                        title={currentVideo.title}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    )}
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
