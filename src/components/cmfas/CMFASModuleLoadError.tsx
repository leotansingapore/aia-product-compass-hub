import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CMFASModuleLoadErrorProps {
  /** Module label used in the copy, e.g. "M9" or "RES5". */
  moduleName: string;
  onRetry: () => void;
  embedded?: boolean;
}

/**
 * Shown when the CMFAS module row fails to load.
 *
 * These pages used to swallow read errors and fall through to their hardcoded
 * placeholder constants (`https://example.com/...`), which a learner would read
 * as the real curriculum. An explicit error + Retry is the honest answer:
 * placeholders are only a display default when there is genuinely no row.
 */
export function CMFASModuleLoadError({ moduleName, onRetry, embedded }: CMFASModuleLoadErrorProps) {
  return (
    <div
      className={
        embedded
          ? "flex w-full items-center justify-center py-16"
          : "flex min-h-screen items-center justify-center overflow-x-hidden bg-gradient-to-br from-background via-background to-muted/20 px-6"
      }
    >
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <AlertTriangle className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <p className="font-medium">Couldn't load the {moduleName} module</p>
        <p className="text-sm text-muted-foreground">
          We couldn't reach the course content, so nothing is shown here rather than
          out-of-date material. Check your connection and try again.
        </p>
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Retry
        </Button>
      </div>
    </div>
  );
}
