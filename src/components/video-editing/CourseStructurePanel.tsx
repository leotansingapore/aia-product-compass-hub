import { FolderTreeView } from './FolderTreeView';
import type { TrainingVideo } from '@/hooks/useProducts';

interface CourseStructurePanelProps {
  videos: TrainingVideo[];
  emptyFolders: string[];
  folderOrders?: Record<string, number>;
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
  onFolderOrdersChange?: (orders: Record<string, number>) => void;
  onCreateSubFolder?: (parentPath: string) => void;
}

export function CourseStructurePanel({
  videos,
  emptyFolders,
  folderOrders,
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
  onReorderFolders,
  onFolderOrdersChange,
  onCreateSubFolder,
}: CourseStructurePanelProps) {
  return (
    <FolderTreeView
      videos={videos}
      emptyFolders={emptyFolders}
      folderOrders={folderOrders}
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
      onFolderOrdersChange={onFolderOrdersChange}
      onCreateSubFolder={onCreateSubFolder}
    />
  );
}
