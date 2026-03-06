import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, TrendingUp, ChevronRight, Play } from "lucide-react";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { formatDuration } from "@/components/video-editing/videoUtils";
import { getProductSlug } from "@/utils/slugUtils";

export const LearningProgressOverview = memo(function LearningProgressOverview() {
  const navigate = useNavigate();
  const { products, loading: productsLoading } = useProducts();
  const { categories } = useCategories();

  // Calculate overall progress across all products
  const progressData = useMemo(() => {
    if (!products || products.length === 0) return null;

    // Products with videos (courses)
    const coursesWithVideos = products.filter(p => 
      p.training_videos && Array.isArray(p.training_videos) && p.training_videos.length > 0
    );

    // Total videos across all courses
    const totalVideos = coursesWithVideos.reduce((sum, p) => 
      sum + (p.training_videos?.length || 0), 0
    );

    // Calculate total duration
    const totalDuration = coursesWithVideos.reduce((sum, p) => {
      const videos = p.training_videos || [];
      return sum + videos.reduce((vSum: number, v: any) => vSum + (v.duration || 0), 0);
    }, 0);

    // Get top 3 courses to show (with most videos)
    const topCourses = coursesWithVideos
      .sort((a, b) => (b.training_videos?.length || 0) - (a.training_videos?.length || 0))
      .slice(0, 3);

    return {
      totalCourses: coursesWithVideos.length,
      totalVideos,
      totalDuration,
      topCourses,
      totalCategories: categories?.length || 0
    };
  }, [products, categories]);

  if (productsLoading || !progressData) {
    return null;
  }

  if (progressData.totalCourses === 0) {
    return null;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Overview
        </h2>
        <span className="text-xs text-muted-foreground">{progressData.totalCategories} categories</span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-2.5 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-primary">
              {progressData.totalCourses}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Products with training</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-secondary/50 to-secondary/30">
          <CardContent className="p-2.5 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold">
              {progressData.totalVideos}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Video lessons</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-muted to-muted/50">
          <CardContent className="p-2.5 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold">
              {progressData.totalDuration > 0 
                ? formatDuration(progressData.totalDuration)
                : "—"
              }
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Content available</div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      {progressData.topCourses.length > 0 && (
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Start Learning — Top Courses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 space-y-1 sm:space-y-3">
            {progressData.topCourses.map((course) => {
              const videoCount = course.training_videos?.length || 0;
              const totalDuration = course.training_videos?.reduce(
                (sum: number, v: any) => sum + (v.duration || 0), 0
              ) || 0;
              
              return (
                  <Button
                  key={course.id}
                  variant="ghost"
                  className="w-full justify-between h-auto py-2 sm:py-3 px-2 sm:px-3"
                  onClick={() => navigate(`/product/${getProductSlug(course.title)}`)}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Play className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate max-w-[180px]">
                        {course.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{videoCount} lessons</span>
                        {totalDuration > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(totalDuration)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </Button>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
});
