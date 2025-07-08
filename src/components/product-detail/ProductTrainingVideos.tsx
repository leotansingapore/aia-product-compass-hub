import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableVideos } from "@/components/EditableVideos";
import type { TrainingVideo } from "@/hooks/useProducts";

interface ProductTrainingVideosProps {
  videos: TrainingVideo[];
  onUpdate: (field: string, value: any) => Promise<void>;
}

export function ProductTrainingVideos({ videos, onUpdate }: ProductTrainingVideosProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🎥</span> Training Videos
        </CardTitle>
        <CardDescription>
          Comprehensive video library for different learning purposes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <EditableVideos
          videos={videos || []}
          onSave={(newVideos) => onUpdate('training_videos', newVideos)}
        />
      </CardContent>
    </Card>
  );
}