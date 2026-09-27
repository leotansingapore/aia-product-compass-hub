import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNewVersionCheck } from "@/hooks/useNewVersionCheck";
import { CHANGELOG_PATH, fetchRecentChanges, type RecentChange } from "@/lib/whatsNew";

export function NewVersionBanner() {
  const { updateAvailable } = useNewVersionCheck();
  // Loaded before the banner shows, so the lines never push Refresh around.
  const [changes, setChanges] = useState<RecentChange[] | null>(null);

  useEffect(() => {
    if (updateAvailable) void fetchRecentChanges().then(setChanges);
  }, [updateAvailable]);

  if (!updateAvailable || changes === null) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-md">
      <div className="flex items-start gap-3 rounded-xl border border-border bg-popover px-4 py-3 shadow-lg">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
          <RefreshCw className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">A new version is available</p>
          {changes.length > 0 && (
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
              {changes.map((c) => (
                <li key={c.id}>{c.title}</li>
              ))}
            </ul>
          )}
          {/* A new tab loads the new build; this stale one may not have the page's chunk. */}
          <a
            href={CHANGELOG_PATH}
            target="_blank"
            rel="noopener"
            className="mt-1.5 inline-block text-xs font-medium text-primary underline-offset-2 hover:underline"
          >
            See what's new
          </a>
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
