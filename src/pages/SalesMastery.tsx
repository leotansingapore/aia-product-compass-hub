import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { PageLayout } from "@/components/layout/PageLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { salesMasteryCourse, getTotalLessonCount, getTotalCourseDuration } from "@/data/salesMasteryCourseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Crown, Phone, DoorOpen, FileText, CheckCircle, RefreshCw,
  Users, BookOpen, Shield, MessageSquare, Play, Clock, ChevronRight,
  GraduationCap, Target, Trophy,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Crown, Phone, DoorOpen, FileText, CheckCircle, RefreshCw,
  Users, BookOpen, Shield, MessageSquare,
};

export default function SalesMastery() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const totalLessons = getTotalLessonCount();
  const totalDuration = getTotalCourseDuration();

  // Track completed lessons via localStorage
  const [completedLessons] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("sales-mastery-completed") || "[]");
    } catch { return []; }
  });

  const completedCount = completedLessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <PageLayout
      title="PWV Sales Mastery"
      description="The Pre-Retiree Flow Bible — master the complete PWV sales cycle"
    >
      <div className="min-h-screen">
        <BrandedPageHeader
          title="PWV Sales Mastery"
          subtitle="The Pre-Retiree Flow Bible — compiled from 255 real meetings"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Sales Mastery" }]}
        />

        <div className={`mx-auto max-w-5xl px-4 pb-24 ${isMobile ? "pt-4" : "pt-8"}`}>
          {/* Course Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-xl border bg-card p-4 text-center">
              <GraduationCap className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{salesMasteryCourse.length}</div>
              <div className="text-xs text-muted-foreground">Modules</div>
            </div>
            <div className="rounded-xl border bg-card p-4 text-center">
              <Play className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{totalLessons}</div>
              <div className="text-xs text-muted-foreground">Video Lessons</div>
            </div>
            <div className="rounded-xl border bg-card p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{totalDuration}</div>
              <div className="text-xs text-muted-foreground">Minutes Total</div>
            </div>
            <div className="rounded-xl border bg-card p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{completedCount}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>

          {/* Overall Progress */}
          {completedCount > 0 && (
            <div className="rounded-xl border bg-card p-5 mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Your Progress</span>
                <span className="text-sm font-semibold tabular-nums">
                  {completedCount}/{totalLessons} ({progressPercent}%)
                </span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>
          )}

          {/* Module Cards */}
          <div className="space-y-4">
            {salesMasteryCourse.map((mod) => {
              const Icon = iconMap[mod.icon] || Target;
              const modCompleted = mod.lessons.filter((l) =>
                completedLessons.includes(l.id)
              ).length;
              const modTotal = mod.lessons.length;
              const modDuration = mod.lessons.reduce((s, l) => s + l.durationMin, 0);

              return (
                <Card
                  key={mod.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => navigate(`/sales-mastery/${mod.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs shrink-0">
                            Module {mod.number}
                          </Badge>
                          {modCompleted === modTotal && modTotal > 0 && (
                            <Badge className="bg-green-600 hover:bg-green-600 text-xs">
                              Complete
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg leading-tight">{mod.title}</CardTitle>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">{mod.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Play className="h-3.5 w-3.5" />
                        {modTotal} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {modDuration} min
                      </span>
                      {modCompleted > 0 && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          {modCompleted}/{modTotal} done
                        </span>
                      )}
                    </div>
                    {modCompleted > 0 && (
                      <Progress
                        value={(modCompleted / modTotal) * 100}
                        className="h-1.5 mt-3"
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
