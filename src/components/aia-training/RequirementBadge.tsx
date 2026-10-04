import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/features/aia-training-directory/filter";

export const TAG = "px-2 py-0.5 text-xs font-medium";

/** Mandatory / Essential / New, the same on the course list, the calendar popup and anywhere else a course shows. */
export function RequirementBadge({ course }: { course: Course }) {
  return (
    <>
      {course.requirement === "mandatory" && (
        <Badge variant="outline" className={cn(TAG, "border-emerald-500/50 text-emerald-700 dark:text-emerald-400")}>
          Mandatory
        </Badge>
      )}
      {course.requirement === "essential" && (
        <Badge variant="outline" className={cn(TAG, "border-amber-500/60 text-amber-700 dark:text-amber-400")}>
          Essential
        </Badge>
      )}
      {course.isNew && <Badge className={cn(TAG, "bg-primary/15 text-primary hover:bg-primary/15")}>New</Badge>}
    </>
  );
}
