import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNewVersionCheck } from "@/hooks/useNewVersionCheck";

export function NewVersionBanner() {
  const { updateAvailable } = useNewVersionCheck();

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-md">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-popover px-4 py-3 shadow-lg">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
          <RefreshCw className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">New version available</p>
          <p className="text-xs text-muted-foreground">Refresh to get the latest updates.</p>
        </div>
        <Button
          size="sm"
          className="flex-shrink-0"
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}
