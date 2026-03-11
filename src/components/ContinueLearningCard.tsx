import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { Play, Check } from "lucide-react";
import type { Product } from "@/hooks/useProducts";

interface ContinueLearningCardProps {
  product: Product;
  onNavigate: () => void;
}

export const ContinueLearningCard = memo(function ContinueLearningCard({ product, onNavigate }: ContinueLearningCardProps) {
  const { getCourseProgress } = useVideoProgress(product.id);
  
  const videos = Array.isArray(product.training_videos) ? product.training_videos : [];
  const courseProgress = getCourseProgress(videos.length);
  const hasStarted = courseProgress > 0;
  const isCompleted = courseProgress === 100;

  return (
    <Card className="hover:shadow-card transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg truncate">{product.title}</CardTitle>
          {isCompleted ? (
            <Badge variant="secondary" className="text-green-600">
              <Check className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          ) : hasStarted ? (
            <Badge variant="default">
              {courseProgress}%
            </Badge>
          ) : (
            <Badge variant="outline">
              New
            </Badge>
          )}
        </div>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hasStarted && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{courseProgress}%</span>
              </div>
              <Progress value={courseProgress} className="h-2" />
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{videos.length} videos</span>
            <span>{(product as any).categories?.name}</span>
          </div>
          
          <Button 
            onClick={onNavigate}
            className="w-full"
            variant={hasStarted ? "default" : "outline"}
          >
            <Play className="h-4 w-4 mr-2" />
            {isCompleted ? "Review" : hasStarted ? "Continue" : "Start Learning"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});