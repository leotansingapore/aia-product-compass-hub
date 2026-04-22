import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { TrainingVideo } from '@/hooks/useProducts';

interface UseFolderManagementProps {
  editVideos: TrainingVideo[];
  onUpdateVideo: (index: number, updatedVideo: TrainingVideo) => void;
  onCreateCategory: (categoryName: string) => void;
  emptyFolders: string[];
  setEmptyFolders: (folders: string[]) => void;
  folderOrders: Record<string, number>;
  setFolderOrders: (orders: Record<string, number>) => void;
}

export function useFolderManagement({
  editVideos,
  onUpdateVideo,
  onCreateCategory,
  emptyFolders,
  setEmptyFolders,
  folderOrders,
  setFolderOrders,
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

    // Drop any tracked orders for the deleted folder + descendants
    const nextOrders: Record<string, number> = {};
    for (const [path, order] of Object.entries(folderOrders)) {
      if (path === folderPath || path.startsWith(folderPath + '/')) continue;
      nextOrders[path] = order;
    }
    setFolderOrders(nextOrders);

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

      // Assign the new empty folder an order one past the current max so it
      // sorts at the end of its sibling list — not to Infinity, which is what
      // a missing order implicitly produces and is what used to drop empty
      // folders to the bottom of the entire tree.
      const siblingParent = pendingSubFolderParent ?? '';
      const isSibling = (cat: string) => {
        if (siblingParent === '') return !cat.includes('/');
        const prefix = siblingParent + '/';
        if (!cat.startsWith(prefix)) return false;
        return !cat.slice(prefix.length).includes('/');
      };
      const videoSiblingOrders = editVideos
        .filter((v) => isSibling(v.category ?? ''))
        .map((v) => v.order ?? 0);
      const folderSiblingOrders = Object.entries(folderOrders)
        .filter(([path]) => {
          const parent = path.split('/').slice(0, -1).join('/');
          return parent === siblingParent;
        })
        .map(([, order]) => order);
      const allSiblingOrders = [...videoSiblingOrders, ...folderSiblingOrders];
      const nextOrder = allSiblingOrders.length > 0 ? Math.max(...allSiblingOrders) + 1 : 0;
      setFolderOrders({ ...folderOrders, [fullPath]: nextOrder });

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

      // Repath folderOrders keys
      const renamedOrders: Record<string, number> = {};
      for (const [path, order] of Object.entries(folderOrders)) {
        if (path === oldPath) renamedOrders[newPath] = order;
        else if (path.startsWith(oldPath + '/')) renamedOrders[newPath + path.slice(oldPath.length)] = order;
        else renamedOrders[path] = order;
      }
      setFolderOrders(renamedOrders);

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
    pendingSubFolderParent,
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
