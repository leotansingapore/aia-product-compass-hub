import { useEffect } from 'react';
import { VideoEditForm } from './VideoEditForm';
import QuizEditor from './QuizEditor';
import { AssignmentEditor } from './AssignmentEditor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain, ClipboardList } from 'lucide-react';
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
  onEditingStateChange,
  showActionSteps = false,
}: VideoEditorPanelProps) {
  const currentVideo = editingIndex !== null ? editVideos[editingIndex] : null;

  // Signal to parent that the editor is always in "editing mode" — there is
  // no separate preview. Keeps sidebar + autosave wiring that used to hinge
  // on `isEditing` working correctly.
  useEffect(() => {
    onEditingStateChange?.(currentVideo != null);
  }, [currentVideo, onEditingStateChange]);

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
        ) : (
          /* ========== RICH EDITOR (single mode, no preview/edit toggle) ========== */
          <VideoEditForm
            video={editVideos[editingIndex]}
            onUpdate={(updatedVideo) => onUpdateVideo(editingIndex, updatedVideo)}
            existingCategories={existingCategories}
            hideTranscript={true}
            hideResources={true}
            showActionSteps={showActionSteps}
          />
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
