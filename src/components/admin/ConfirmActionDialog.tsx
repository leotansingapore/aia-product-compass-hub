import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_ITEMS = 8;

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** What the action does and what it cannot undo. */
  description: ReactNode;
  /**
   * The exact rows the action will touch (emails, question titles…). Shown so an
   * admin can see *who* is affected instead of only a count.
   */
  items?: string[];
  itemsLabel?: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
}

/**
 * Confirmation dialog for destructive admin actions.
 *
 * Replaces `window.confirm`, which is unstyled, count-only, blocks the main
 * thread and is suppressible by the browser. Modelled on the AlertDialog in
 * PlatformControls.
 */
export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  items,
  itemsLabel = "Affected",
  confirmLabel,
  destructive = true,
  onConfirm,
}: ConfirmActionDialogProps) {
  const visible = items?.slice(0, MAX_VISIBLE_ITEMS) ?? [];
  const overflow = (items?.length ?? 0) - visible.length;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle
              className={cn("h-5 w-5", destructive ? "text-destructive" : "text-amber-500")}
            />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {items && items.length > 0 && (
          <div className="rounded-md border bg-muted/40 p-3">
            <div className="mb-1.5 text-xs font-medium text-muted-foreground">
              {itemsLabel} ({items.length})
            </div>
            <ul className="max-h-48 space-y-0.5 overflow-y-auto text-sm">
              {visible.map((item, i) => (
                <li key={`${item}-${i}`} className="truncate">
                  {item}
                </li>
              ))}
            </ul>
            {overflow > 0 && (
              <div className="mt-1.5 text-xs text-muted-foreground">+{overflow} more</div>
            )}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              destructive &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            )}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
