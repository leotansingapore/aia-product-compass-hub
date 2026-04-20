import { CheckCircle2, Circle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useLearningTrackProgress } from "@/hooks/learning-track/useLearningTrackProgress";
import { useItemContentBlocks } from "@/hooks/learning-track/useLearningTrackPhases";
import { ContentBlockEditor } from "./ContentBlockEditor";
import { RelatedResources } from "./RelatedResources";
import { SubmissionPanel } from "./SubmissionPanel";
import { isModuleFolder } from "@/lib/learning-track/moduleGrouping";
import { Folder } from "lucide-react";
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

  // Module folders are organizational only — no "Mark as complete" button, no lesson content.
  if (isModuleFolder(item)) {
    return (
      <div className="p-6 sm:p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Folder className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-1">{item.title}</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Select a lesson from the sidebar to begin.
        </p>
      </div>
    );
  }

  // Learner list queries skip content_blocks to stay small — fetch them per
  // item when the panel opens. Admin-mode queries return blocks inline.
  const needsFetch = !item.content_blocks || item.content_blocks.length === 0;
  const blocksQuery = useItemContentBlocks(item.id, { enabled: needsFetch });
  const effectiveBlocks =
    needsFetch ? blocksQuery.data ?? [] : item.content_blocks ?? [];

  const hasObjectives = item.objectives && item.objectives.length > 0;
  const hasActionItems = item.action_items && item.action_items.length > 0;
  const hasContent = effectiveBlocks.length > 0;

  const completeButton = (
    <Button
      variant={completed ? "outline" : "default"}
      size="sm"
      disabled={setStatus.isPending}
      onClick={handleToggleComplete}
      className={cn("gap-2 shrink-0", setStatus.isPending && "opacity-50")}
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
  );

  return (
    <article className="w-full">
      {/* Hero header — establishes context, status, and primary CTA */}
      <header className="border-b bg-gradient-to-br from-primary/5 via-background to-background px-5 sm:px-8 pt-6 pb-5 sm:pt-8 sm:pb-6">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              completed
                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                : status === "in_progress"
                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {completed ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <Circle className="h-3 w-3" />
            )}
            {completed ? "Completed" : status === "in_progress" ? "In Progress" : "Not Started"}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-tight leading-tight">
              {item.title}
            </h2>
            {item.description && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {item.description}
              </p>
            )}
          </div>
          <div className="hidden sm:block">{completeButton}</div>
        </div>

        <div className="sm:hidden mt-4">{completeButton}</div>
      </header>

      {/* Body content */}
      <div className="px-5 py-6 sm:px-8 sm:py-8 space-y-7">
        {/* Objectives + Action items — side-by-side on wider screens */}
        {(hasObjectives || hasActionItems) && (
          <div className="grid gap-4 md:grid-cols-2">
            {hasObjectives && (
              <div className="rounded-xl border bg-card/50 p-4 sm:p-5">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Objectives
                </h4>
                <ul className="space-y-2 text-sm leading-relaxed">
                  {item.objectives!.map((o, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasActionItems && (
              <div className="rounded-xl border bg-card/50 p-4 sm:p-5">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Action items
                </h4>
                <ol className="space-y-2 text-sm leading-relaxed">
                  {item.action_items!.map((a, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary tabular-nums">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{a}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Content blocks — the main lesson content */}
        {hasContent && (
          <ContentBlockEditor blocks={effectiveBlocks} itemId={item.id} />
        )}
        {needsFetch && blocksQuery.isLoading && (
          <div className="space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
          </div>
        )}

        {/* Related resources */}
        <RelatedResources item={item} />

        {/* Submission panel */}
        {item.requires_submission && (
          <SubmissionPanel itemId={item.id} userId={user?.id} />
        )}

        {/* Footer completion CTA — bottom-of-page convenience */}
        <div className="pt-4 border-t flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {completed ? "Nice work — this lesson is complete." : "Done with this lesson?"}
          </p>
          {completeButton}
        </div>
      </div>
    </article>
  );
}
