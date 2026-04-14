import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  useItemRevisions,
  useRevertItemRevision,
  type ItemRevision,
} from "@/hooks/learning-track/useItemRevisions";

interface Props {
  open: boolean;
  onClose: () => void;
  itemId: string;
  itemTitle: string;
}

export function ItemHistoryDialog({ open, onClose, itemId, itemTitle }: Props) {
  const { data: revisions, isLoading } = useItemRevisions(itemId, open);
  const revert = useRevertItemRevision();

  const handleRevert = (rev: ItemRevision) => {
    const when = formatDistanceToNow(new Date(rev.created_at), { addSuffix: true });
    if (!confirm(`Revert "${itemTitle}" to the version from ${when}? Current state will be saved as a new revision.`))
      return;
    revert.mutate(rev, { onSuccess: () => onClose() });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Version history — {itemTitle}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Each edit to an item is snapshotted automatically. Click a snapshot to revert.
          </p>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto space-y-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading history...</p>
          ) : !revisions || revisions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No edits yet — history starts accumulating from the next change.
            </p>
          ) : (
            revisions.map((rev) => {
              const snap = rev.snapshot;
              const blockCount = snap.content_blocks?.length ?? 0;
              return (
                <div
                  key={rev.id}
                  className="rounded border bg-muted/20 p-3 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(rev.created_at), { addSuffix: true })}
                    </div>
                    <div className="font-medium text-sm mt-0.5">{snap.title}</div>
                    {snap.description && (
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {snap.description}
                      </div>
                    )}
                    <div className="text-[11px] text-muted-foreground mt-1 flex gap-3">
                      <span>{snap.objectives?.length ?? 0} objectives</span>
                      <span>{snap.action_items?.length ?? 0} actions</span>
                      <span>{blockCount} blocks</span>
                      {snap.requires_submission && <span>submission</span>}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRevert(rev)}
                    disabled={revert.isPending}
                  >
                    Revert
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
