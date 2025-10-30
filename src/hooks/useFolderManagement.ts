import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { TrainingVideo } from '@/hooks/useProducts';

interface UseFolderManagementProps {
  editVideos: TrainingVideo[];
  onUpdateVideo: (index: number, updatedVideo: TrainingVideo) => void;
  onCreateCategory: (categoryName: string) => void;
  emptyFolders: string[];
  setEmptyFolders: (folders: string[]) => void;
}

export function useFolderManagement({ 
  editVideos, 
  onUpdateVideo, 
  onCreateCategory,
  emptyFolders,
  setEmptyFolders
}: UseFolderManagementProps) {
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderDialogMode, setFolderDialogMode] = useState<'create' | 'edit'>('create');
  const [editingFolderName, setEditingFolderName] = useState('');
  
  // Auto-expand all folders on mount for better discoverability
  const allFolderNames = Array.from(new Set([
    ...editVideos.map(v => v.category || 'Uncategorized'),
    ...emptyFolders
  ]));
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(allFolderNames));
  
  const { toast } = useToast();

  const handleCreateFolder = () => {
    setFolderDialogMode('create');
    setEditingFolderName('');
    setFolderDialogOpen(true);
  };

  const handleEditFolder = (folderName: string) => {
    setFolderDialogMode('edit');
    setEditingFolderName(folderName);
    setFolderDialogOpen(true);
  };

  const handleDeleteFolder = (folderName: string) => {
    // Move all videos from this folder to Uncategorized
    const updatedVideos = editVideos.map(video => 
      video.category === folderName 
        ? { ...video, category: '' }
        : video
    );
    
    // Update all videos at once
    updatedVideos.forEach((video, index) => {
      if (editVideos[index].category === folderName) {
        onUpdateVideo(index, video);
      }
    });

    // Remove from empty folders list
    setEmptyFolders(emptyFolders.filter(folder => folder !== folderName));
    // Remove from expanded folders
    setExpandedFolders(prev => {
      const newExpanded = new Set(prev);
      newExpanded.delete(folderName);
      return newExpanded;
    });

    toast({
      title: "Folder Deleted",
      description: `"${folderName}" folder deleted. Videos moved to Uncategorized.`,
    });
  };

  const handleMoveVideoToFolder = (videoIndex: number, targetFolder: string) => {
    const updatedVideo = { ...editVideos[videoIndex], category: targetFolder };
    onUpdateVideo(videoIndex, updatedVideo);
    
    toast({
      title: "Video Moved",
      description: `Video moved to "${targetFolder}" folder.`,
    });
  };

  const handleFolderSave = (folderName: string) => {
    if (folderDialogMode === 'create') {
      // Add to empty folders list immediately
      setEmptyFolders([...emptyFolders, folderName]);
      // Auto-expand the new folder
      setExpandedFolders(prev => new Set([...prev, folderName]));
      onCreateCategory(folderName);
      toast({
        title: "Folder Created",
        description: `"${folderName}" folder created successfully.`,
      });
    } else {
      // Rename folder - update all videos with the old folder name
      const updatedVideos = editVideos.map(video => 
        video.category === editingFolderName 
          ? { ...video, category: folderName }
          : video
      );
      
      updatedVideos.forEach((video, index) => {
        if (editVideos[index].category === editingFolderName) {
          onUpdateVideo(index, video);
        }
      });

      // Update empty folders list if this was an empty folder
      setEmptyFolders(
        emptyFolders.map(folder => folder === editingFolderName ? folderName : folder)
      );

      toast({
        title: "Folder Renamed",
        description: `Folder renamed to "${folderName}".`,
      });
    }
  };

  return {
    folderDialogOpen,
    setFolderDialogOpen,
    folderDialogMode,
    editingFolderName,
    emptyFolders,
    expandedFolders,
    setExpandedFolders,
    handleCreateFolder,
    handleEditFolder,
    handleDeleteFolder,
    handleMoveVideoToFolder,
    handleFolderSave
  };
}