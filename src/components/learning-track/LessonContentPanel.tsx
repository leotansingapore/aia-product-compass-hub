import { CheckCircle2, Circle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useLearningTrackProgress } from "@/hooks/learning-track/useLearningTrackProgress";
import { ContentBlockEditor } from "./ContentBlockEditor";
import { RelatedResources } from "./RelatedResources";
import { SubmissionPanel } from "./SubmissionPanel";
import type { LearningTrackItem, ItemStatus } from "@/types/learning-track";
import type { LockResult } from "@/lib/learning-track/unlock";
import { cn } from "@/lib/utils";

interface LessonContentPanelProps {
  item: LearningTrackItem;
  lockResult?: LockResult | null;
  onComplete?: (itemId: string) => void;
}

export function LessonContentPanel({ item, lockResult, onComplete }: LessonContentPanelProps) {
  const { user } = useSimplifiedAuth();
  const { setStatus, getStatus, isCompleted: checkCompleted } = useLearningTrackProgress(user?.id);
  const status = getStatus(item.id);
  const completed = checkCompleted(item.id);
  const isLocked = !!lockResult?.locked;

  const handleToggleComplete = () => {
    const next: ItemStatus = completed ? "not_started" : "completed";
    setStatus.mutate({ itemId: item.id, status: next }, {
      onSuccess: () => {
        if (next === "completed" && onComplete) onComplete(item.id);
      },
    });
  };

  if (isLocked) {
    return (
      <div className="p-6 sm:p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mb-3">
          <Lock className="h-6 w-6 text-amber-600" />
        </div>
        <h3 className="font-semibold mb-1">Lesson locked</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          {lockResult?.reason === "phase"
            ? "Complete the previous module first."
            : `Complete first: ${lockResult?.missingTitles.join(", ")}`}
        </p>
      </div>
    );
  }

  const hasObjectives = item.objectives && item.objectives.length > 0;
  const hasActionItems = item.action_items && item.action_items.length > 0;
  const hasContent = item.content_blocks && item.content_blocks.length > 0;

  return (
    <article className="px-5 py-5 sm:px-6 sm:py-6 space-y-5">
      {/* Title */}
      <h2 className="text-lg sm:text-xl font-bold font-serif tracking-tight">
        {item.title}
      </h2>

      {/* Description — flows naturally under title */}
      {item.description && (
        <p className="text-sm text-muted-foreground leading-relaxed -mt-2">
          {item.description}
        </p>
      )}

      {/* Objectives — inline, no box */}
      {hasObjectives && (
        <div>
          <h4 className="text-sm font-semibold mb-1.5">Objectives</h4>
          <ul className="space-y-1 text-sm leading-relaxed">
            {item.objectives!.map((o, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary mt-0.5 shrink-0">•</span>
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action items — inline, no box */}
      {hasActionItems && (
        <div>
          <h4 className="text-sm font-semibold mb-1.5">Action items</h4>
          <ol className="space-y-1 text-sm leading-relaxed list-decimal list-inside">
            {item.action_items!.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Content blocks — the main lesson content, no wrapper label */}
      {hasContent && (
        <ContentBlockEditor blocks={item.content_blocks} itemId={item.id} />
      )}

      {/* Related resources */}
      <RelatedResources item={item} />

      {/* Submission panel */}
      {item.requires_submission && (
        <SubmissionPanel itemId={item.id} userId={user?.id} />
      )}

      {/* Completion — sticky-ish at the bottom, clear CTA */}
      <div className="pt-3 border-t">
        <Button
          variant={completed ? "outline" : "default"}
          disabled={setStatus.isPending}
          onClick={handleToggleComplete}
          className={cn("w-full gap-2", setStatus.isPending && "opacity-50")}
        >
          {completed ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Completed — undo
            </>
          ) : (
            <>
              <Circle className="h-4 w-4" />
              Mark as complete
            </>
          )}
        </Button>
      </div>
    </article>
  );
}
