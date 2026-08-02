import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageLoadErrorProps {
  /** What failed to load, e.g. "this course". */
  title: string;
  description?: string;
  onRetry: () => void;
  /** Optional secondary action, e.g. "Return to Dashboard". */
  secondaryAction?: React.ReactNode;
}

/**
 * Shown when a page's data request FAILED, as opposed to succeeding with no
 * row. These surfaces used to render "Product Not Found" / "Video Not Found" /
 * "Category not found" for both cases, so a dropped connection told a learner
 * their course had been deleted. A 404 is a dead end; a failed load is a retry.
 */
export function PageLoadError({ title, description, onRetry, secondaryAction }: PageLoadErrorProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <AlertTriangle className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {description || "Something went wrong on the way. Check your connection and try again — nothing has been deleted."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </Button>
          {secondaryAction}
        </div>
      </div>
    </div>
  );
}
