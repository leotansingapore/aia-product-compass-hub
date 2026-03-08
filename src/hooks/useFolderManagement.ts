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
  // When creating a sub-folder, stores the parent path
  const [pendingSubFolderParent, setPendingSubFolderParent] = useState<string | null>(null);
  
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
    setPendingSubFolderParent(null);
    setFolderDialogOpen(true);
  };

  const handleCreateSubFolder = (parentPath: string) => {
    setFolderDialogMode('create');
    setEditingFolderName('');
    setPendingSubFolderParent(parentPath);
    setFolderDialogOpen(true);
  };

  const handleEditFolder = (folderPath: string) => {
    setFolderDialogMode('edit');
    // Show only the last segment name for editing
    const parts = folderPath.split('/').filter(Boolean);
    setEditingFolderName(parts[parts.length - 1] ?? folderPath);
    setPendingSubFolderParent(null);
    setFolderDialogOpen(true);
    // Store the full old path for renaming
    _setOldFolderPath(folderPath);
  };

  // Internal state to track the full path being renamed
  const [_oldFolderPath, _setOldFolderPath] = useState('');

  const handleDeleteFolder = (folderPath: string) => {
    // Move all videos from this folder (and sub-folders) to root
    const updatedVideos = editVideos.map(video => {
      const cat = video.category ?? '';
      if (cat === folderPath || cat.startsWith(folderPath + '/')) {
        return { ...video, category: '' };
      }
      return video;
    });
    
    updatedVideos.forEach((video, index) => {
      const oldCat = editVideos[index].category ?? '';
      if (oldCat === folderPath || oldCat.startsWith(folderPath + '/')) {
        onUpdateVideo(index, video);
      }
    });

    // Remove folder and all sub-folder paths from emptyFolders
    setEmptyFolders(emptyFolders.filter(f => f !== folderPath && !f.startsWith(folderPath + '/')));

    setExpandedFolders(prev => {
      const next = new Set(prev);
      next.delete(folderPath);
      prev.forEach(p => { if (p.startsWith(folderPath + '/')) next.delete(p); });
      return next;
    });

    const folderName = folderPath.split('/').pop() ?? folderPath;
    toast({
      title: "Folder Deleted",
      description: `"${folderName}" deleted. Videos moved to root.`,
    });
  };

  const handleMoveVideoToFolder = (videoIndex: number, targetFolder: string) => {
    const updatedVideo = { ...editVideos[videoIndex], category: targetFolder };
    onUpdateVideo(videoIndex, updatedVideo);
    
    toast({
      title: "Video Moved",
      description: `Video moved to "${targetFolder.split('/').pop()}" folder.`,
    });
  };

  const handleFolderSave = (folderNameInput: string) => {
    const folderName = folderNameInput.trim();
    if (!folderName) return;

    if (folderDialogMode === 'create') {
      // Build full path: if sub-folder, prepend parent path
      const fullPath = pendingSubFolderParent
        ? `${pendingSubFolderParent}/${folderName}`
        : folderName;

      setEmptyFolders([...emptyFolders, fullPath]);
      setExpandedFolders(prev => {
        const next = new Set([...prev, fullPath]);
        if (pendingSubFolderParent) next.add(pendingSubFolderParent);
        return next;
      });
      onCreateCategory(fullPath);
      toast({
        title: "Folder Created",
        description: pendingSubFolderParent
          ? `Sub-folder "${folderName}" created inside "${pendingSubFolderParent.split('/').pop()}".`
          : `"${folderName}" folder created.`,
      });
      setPendingSubFolderParent(null);
    } else {
      // Rename: rebuild path with new last segment
      const oldPath = _oldFolderPath;
      const parts = oldPath.split('/').filter(Boolean);
      parts[parts.length - 1] = folderName;
      const newPath = parts.join('/');

      if (oldPath === newPath) return;

      // Repath all videos
      const updatedVideos = editVideos.map(video => {
        const cat = video.category ?? '';
        if (cat === oldPath) return { ...video, category: newPath };
        if (cat.startsWith(oldPath + '/')) return { ...video, category: newPath + cat.slice(oldPath.length) };
        return video;
      });
      updatedVideos.forEach((video, index) => {
        if (video.category !== editVideos[index].category) {
          onUpdateVideo(index, video);
        }
      });

      // Repath emptyFolders
      setEmptyFolders(
        emptyFolders.map(f => {
          if (f === oldPath) return newPath;
          if (f.startsWith(oldPath + '/')) return newPath + f.slice(oldPath.length);
          return f;
        })
      );

      // Update expandedFolders
      setExpandedFolders(prev => {
        const next = new Set<string>();
        prev.forEach(p => {
          if (p === oldPath) next.add(newPath);
          else if (p.startsWith(oldPath + '/')) next.add(newPath + p.slice(oldPath.length));
          else next.add(p);
        });
        return next;
      });

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
    handleCreateSubFolder,
    handleEditFolder,
    handleDeleteFolder,
    handleMoveVideoToFolder,
    handleFolderSave
  };
}
