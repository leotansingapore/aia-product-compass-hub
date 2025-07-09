import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { VideoListItem } from './VideoListItem';
import { AddVideoForm } from './AddVideoForm';
import { FolderTreeView } from './FolderTreeView';
import { FolderManagementDialog } from './FolderManagementDialog';
import { useToast } from '@/hooks/use-toast';
import type { TrainingVideo } from '@/hooks/useProducts';

interface VideoEditingInterfaceProps {
  editVideos: TrainingVideo[];
  editingIndex: number | null;
  newVideo: TrainingVideo;
  saving: boolean;
  existingCategories: string[];
  onEditingIndexChange: (index: number | null) => void;
  onUpdateVideo: (index: number, updatedVideo: TrainingVideo) => void;
  onRemoveVideo: (index: number) => void;
  onMoveVideo: (index: number, direction: 'up' | 'down') => void;
  onNewVideoChange: (video: TrainingVideo) => void;
  onAddVideo: () => void;
  onSave: () => void;
  onCancel: () => void;
  onCreateCategory: (categoryName: string) => void;
}

export function VideoEditingInterface({
  editVideos,
  editingIndex,
  newVideo,
  saving,
  existingCategories,
  onEditingIndexChange,
  onUpdateVideo,
  onRemoveVideo,
  onMoveVideo,
  onNewVideoChange,
  onAddVideo,
  onSave,
  onCancel,
  onCreateCategory
}: VideoEditingInterfaceProps) {
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderDialogMode, setFolderDialogMode] = useState<'create' | 'edit'>('create');
  const [editingFolderName, setEditingFolderName] = useState('');
  const { toast } = useToast();

  console.log('🎬 VideoEditingInterface: Rendering editing interface');

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

  const handleAddVideoToFolder = (folderName: string) => {
    const videoWithFolder = { ...newVideo, category: folderName };
    onNewVideoChange(videoWithFolder);
    
    toast({
      title: "Ready to Add",
      description: `New video will be added to "${folderName}" folder.`,
    });
  };

  const handleFolderSave = (folderName: string) => {
    if (folderDialogMode === 'create') {
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

      toast({
        title: "Folder Renamed",
        description: `Folder renamed to "${folderName}".`,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Folder Tree */}
      <div className="lg:col-span-1 space-y-4">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Course Structure</h3>
          <FolderTreeView
            videos={editVideos}
            onVideoSelect={(index) => onEditingIndexChange(index)}
            onCreateFolder={handleCreateFolder}
            onEditFolder={handleEditFolder}
            onDeleteFolder={handleDeleteFolder}
            onMoveVideo={handleMoveVideoToFolder}
            onEditVideo={(index) => onEditingIndexChange(index)}
            onDeleteVideo={onRemoveVideo}
            onAddVideoToFolder={handleAddVideoToFolder}
          />
        </div>
      </div>

      {/* Right Panel - Video Editor */}
      <div className="lg:col-span-2 space-y-6">
        {editingIndex !== null && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Edit Video</h3>
            <VideoListItem
              video={editVideos[editingIndex]}
              index={editingIndex}
              isEditing={true}
              canMoveUp={editingIndex > 0}
              canMoveDown={editingIndex < editVideos.length - 1}
              onEdit={() => {}}
              onUpdate={(updatedVideo) => onUpdateVideo(editingIndex, updatedVideo)}
              onSave={() => onEditingIndexChange(null)}
              onCancel={() => onEditingIndexChange(null)}
              onDelete={() => onRemoveVideo(editingIndex)}
              onMoveUp={() => onMoveVideo(editingIndex, 'up')}
              onMoveDown={() => onMoveVideo(editingIndex, 'down')}
              existingCategories={existingCategories}
            />
          </div>
        )}

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Add New Video</h3>
          <AddVideoForm
            newVideo={newVideo}
            onUpdate={onNewVideoChange}
            onAdd={onAddVideo}
            disabled={!newVideo.title.trim() || !newVideo.url.trim()}
            existingCategories={existingCategories}
            onCreateCategory={onCreateCategory}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={onSave} disabled={saving} size="lg">
            <Check className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={saving} size="lg">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Folder Management Dialog */}
      <FolderManagementDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        mode={folderDialogMode}
        initialName={editingFolderName}
        onSave={handleFolderSave}
      />
    </div>
  );
}