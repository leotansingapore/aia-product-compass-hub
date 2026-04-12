import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, GraduationCap } from "lucide-react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useLearningTrackOverallProgress } from "@/hooks/learning-track/useLearningTrackOverallProgress";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export function LearningTrackHeroCard() {
  const { user } = useSimplifiedAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useLearningTrackOverallProgress(user?.id);

  if (!user || isLoading || !data) return null;

  if (data.combinedPct === 100) {
    return (
      <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 p-3 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <span className="text-sm">Learning track complete</span>
      </div>
    );
  }

  const goNext = () => {
    if (!data.nextItem) {
      navigate("/learning-track/pre-rnf");
      return;
    }
    const trackPath = data.nextItem.track === "pre_rnf" ? "pre-rnf" : "post-rnf";
    navigate(`/learning-track/${trackPath}/${data.nextItem.id}`);
  };

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm" data-testid="lt-hero-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <GraduationCap className="h-5 w-5" />
          Your Learning Track
        </h2>
        <span className="text-sm text-muted-foreground">{data.combinedPct}%</span>
      </div>
      <Progress value={data.combinedPct} className="mb-4" />
      {data.nextItem && (
        <p className="mb-4 text-sm">
          <span className="text-muted-foreground">Next up: </span>
          <span className="font-medium">{data.nextItem.title}</span>
        </p>
      )}
      <div className="flex items-center gap-3">
        <Button onClick={goNext}>
          {data.combinedPct === 0 ? "Start Learning" : "Continue"}{" "}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
