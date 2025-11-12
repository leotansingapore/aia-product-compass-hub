import { useState } from 'react';
import { VideoEditForm } from './VideoEditForm';
import { AddVideoForm } from './AddVideoForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Eye, Edit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { markdownComponents } from '@/lib/markdown-config';
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
}

export function VideoEditorPanel({
  editVideos,
  editingIndex,
  newVideo,
  existingCategories,
  onEditingIndexChange,
  onUpdateVideo,
  onNewVideoChange,
  onAddVideo,
  onCreateCategory
}: VideoEditorPanelProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(true);

  console.log('🎬 VideoEditorPanel: Rendering', {
    editingIndex,
    hasVideo: editingIndex !== null && editVideos[editingIndex] !== undefined,
    videoTitle: editingIndex !== null ? editVideos[editingIndex]?.title : 'none'
  });

  const handleAddVideo = () => {
    onAddVideo();
    setIsAddDialogOpen(false);
  };

  const currentVideo = editingIndex !== null ? editVideos[editingIndex] : null;

  return (
    <div className="flex-1 h-full">
      {editingIndex !== null ? (
        <div className="border rounded-lg p-6 bg-card h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">
              {isPreviewMode ? 'Preview' : 'Edit Video'}
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant={isPreviewMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              >
                {isPreviewMode ? (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onEditingIndexChange(null);
                  setIsPreviewMode(false);
                }}
              >
                Close
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {isPreviewMode ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <h1 className="text-2xl font-bold mb-2">{currentVideo?.title}</h1>
                {currentVideo?.category && (
                  <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                    {currentVideo.category}
                  </div>
                )}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={markdownComponents}
                >
                  {currentVideo?.rich_content || currentVideo?.description || '*No content available*'}
                </ReactMarkdown>
                {currentVideo?.transcript && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-2">Transcript</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {currentVideo.transcript}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <VideoEditForm
                video={editVideos[editingIndex]}
                onUpdate={(updatedVideo) => onUpdateVideo(editingIndex, updatedVideo)}
                existingCategories={existingCategories}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/30 h-full flex items-center justify-center">
          <p className="text-sm">Select a video from the sidebar to edit</p>
        </div>
      )}
    </div>
  );
}