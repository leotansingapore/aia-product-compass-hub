import { useToast } from '@/hooks/use-toast';
import type { TrainingVideo } from '@/hooks/useProducts';

interface UseVideoActionsProps {
  newVideo: TrainingVideo;
  onNewVideoChange: (video: TrainingVideo) => void;
}

export function useVideoActions({ newVideo, onNewVideoChange }: UseVideoActionsProps) {
  const { toast } = useToast();

  const handleAddVideoToFolder = (folderName: string) => {
    const videoWithFolder = { ...newVideo, category: folderName };
    onNewVideoChange(videoWithFolder);
    
    toast({
      title: "Ready to Add",
      description: `New video will be added to "${folderName}" folder.`,
    });
  };

  return {
    handleAddVideoToFolder
  };
}