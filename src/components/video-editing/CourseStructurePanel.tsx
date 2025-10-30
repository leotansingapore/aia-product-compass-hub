import { FolderTreeView } from './FolderTreeView';
import type { TrainingVideo } from '@/hooks/useProducts';

interface CourseStructurePanelProps {
  videos: TrainingVideo[];
  emptyFolders: string[];
  expandedFolders: Set<string>;
  onExpandedChange: (expanded: Set<string>) => void;
  onVideoSelect: (index: number) => void;
  onCreateFolder: () => void;
  onEditFolder: (folderName: string) => void;
  onDeleteFolder: (folderName: string) => void;
  onMoveVideoToFolder: (videoIndex: number, targetFolder: string) => void;
  onEditVideo: (index: number) => void;
  onDeleteVideo: (index: number) => void;
  onAddVideoToFolder: (folderName: string) => void;
  onReorderVideos?: (updatedVideos: TrainingVideo[]) => void;
}

export function CourseStructurePanel({
  videos,
  emptyFolders,
  expandedFolders,
  onExpandedChange,
  onVideoSelect,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onMoveVideoToFolder,
  onEditVideo,
  onDeleteVideo,
  onAddVideoToFolder,
  onReorderVideos
}: CourseStructurePanelProps) {
  return (
    <div className="lg:col-span-1 space-y-4">
      <div className="border rounded-lg p-4">
        <div className="mb-4">
          <h3 className="font-semibold">Course Structure</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Organize and reorder your videos with drag-and-drop
          </p>
        </div>
        <FolderTreeView
          videos={videos}
          emptyFolders={emptyFolders}
          expandedFolders={expandedFolders}
          onExpandedChange={onExpandedChange}
          onVideoSelect={onVideoSelect}
          onCreateFolder={onCreateFolder}
          onEditFolder={onEditFolder}
          onDeleteFolder={onDeleteFolder}
          onMoveVideo={onMoveVideoToFolder}
          onEditVideo={onEditVideo}
          onDeleteVideo={onDeleteVideo}
          onAddVideoToFolder={onAddVideoToFolder}
          onReorderVideos={onReorderVideos}
        />
      </div>
    </div>
  );
}