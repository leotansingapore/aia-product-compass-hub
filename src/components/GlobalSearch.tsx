import { Suspense, useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { lazyWithRetry } from "@/utils/lazyWithRetry";

// The dialog carries the full content index (heading index, day summaries,
// DB-source hooks) — it must stay out of the app-shell bundle, so it only
// loads the first time the palette is opened.
const GlobalSearchDialog = lazyWithRetry(() =>
  import("@/components/GlobalSearchDialog").then((m) => ({ default: m.GlobalSearchDialog })),
);

// Module-level opener bus: the host dialog mounts once in AppLayout; trigger
// buttons anywhere (TopNav, MobileHeader, admin header, hub pages) call
// openGlobalSearch() without needing shared React context.
let opener: (() => void) | null = null;

export function openGlobalSearch(): void {
  opener?.();
}

/**
 * Mounts the global search palette and owns the Cmd/Ctrl+K shortcut. Rendered
 * once for authenticated users in AppLayout. The dialog chunk is only
 * downloaded on first open.
 */
export function GlobalSearchHost() {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);

  const openPalette = useCallback(() => {
    setEverOpened(true);
    setOpen(true);
  }, []);

  useEffect(() => {
    opener = openPalette;
    return () => {
      if (opener === openPalette) opener = null;
    };
  }, [openPalette]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setEverOpened(true);
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Keep the dialog mounted after first open so its fetched sources (scripts,
  // products, cheat-sheet catalog) persist for the session.
  if (!everOpened) return null;

  return (
    <Suspense fallback={null}>
      <GlobalSearchDialog open={open} onOpenChange={setOpen} />
    </Suspense>
  );
}

/**
 * Search trigger. `bar` renders the full-width "Search anything…" input-like
 * button used on hub pages; `icon` is the compact header button.
 */
export function GlobalSearchTrigger({
  variant = "icon",
  className,
  placeholder = "Search lessons, scripts, products, anything…",
}: {
  variant?: "bar" | "icon";
  className?: string;
  placeholder?: string;
}) {
  if (variant === "bar") {
    return (
      <button
        type="button"
        onClick={openGlobalSearch}
        data-testid="global-search-trigger"
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl border border-border/70 bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/60",
          className,
        )}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate text-left">{placeholder}</span>
        <kbd className="hidden items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openGlobalSearch}
      data-testid="global-search-trigger"
      aria-label="Search everything (Cmd+K)"
      title="Search everything (⌘K)"
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        className,
      )}
    >
      <Search className="h-[18px] w-[18px]" />
    </button>
  );
}
