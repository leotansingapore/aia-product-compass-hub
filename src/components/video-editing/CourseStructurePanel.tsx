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
  onAddPageToFolder: (folderName: string) => void;
  onReorderVideos?: (updatedVideos: TrainingVideo[]) => void;
  onReorderFolders?: (folderOrder: string[]) => void;
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
  onAddPageToFolder,
  onReorderVideos,
  onReorderFolders
}: CourseStructurePanelProps) {
  return (
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
      onAddPageToFolder={onAddPageToFolder}
      onReorderVideos={onReorderVideos}
      onReorderFolders={onReorderFolders}
    />
  );
}
