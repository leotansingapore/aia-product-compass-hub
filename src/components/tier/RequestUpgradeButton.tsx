import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowRight, Clock, Loader2, Sparkles } from 'lucide-react';
import { TIER_META, type TierLevel } from '@/lib/tiers';
import { useMyTierRequests } from '@/hooks/useTierRequests';
import { cn } from '@/lib/utils';

interface RequestUpgradeButtonProps {
  fromTier: TierLevel;
  toTier: TierLevel;
  /** Button label override. Defaults to "Request upgrade". */
  label?: string;
  /** If true, render a compact inline button suitable for cards / nav bars. */
  compact?: boolean;
  className?: string;
  /** Controlled open state — when provided, the component is externally controlled. */
  open?: boolean;
  /** Callback when the dialog open state changes (for controlled mode). */
  onOpenChange?: (open: boolean) => void;
  /** When true, hide the trigger button and only render the dialog (for programmatic open). */
  dialogOnly?: boolean;
}

/**
 * User-facing button that opens a dialog to submit a tier upgrade request.
 * Disables itself (with a different label) if there's already a pending
 * request for this user.
 */
export function RequestUpgradeButton({
  fromTier,
  toTier,
  label = 'Request upgrade',
  compact,
  className,
  open: controlledOpen,
  onOpenChange,
  dialogOnly,
}: RequestUpgradeButtonProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [reason, setReason] = useState('');
  const { pendingRequest, createRequest, isCreating } = useMyTierRequests();
  const hasPending = !!pendingRequest;

  const fromMeta = TIER_META[fromTier];
  const toMeta = TIER_META[toTier];

  const handleSubmit = () => {
    createRequest(
      { fromTier, toTier, reason },
      {
        onSuccess: () => {
          setOpen(false);
          setReason('');
        },
      },
    );
  };

  if (hasPending) {
    return (
      <Button
        variant="outline"
        disabled
        className={cn('gap-1.5', compact && 'h-8 text-xs', className)}
        title="You already have a pending upgrade request"
      >
        <Clock className="h-4 w-4" />
        Request pending
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!dialogOnly && (
        <DialogTrigger asChild>
          <Button className={cn('gap-1.5', compact && 'h-8 text-xs', className)}>
            <Sparkles className="h-4 w-4" />
            {label}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="outline" className={fromMeta.badgeClass}>{fromMeta.label}</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className={toMeta.badgeClass}>{toMeta.label}</Badge>
          </DialogTitle>
          <DialogDescription className="pt-2">
            Tell us why you&rsquo;re ready to move to <strong>{toMeta.label}</strong>. An admin will review
            your request and unlock the next section for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="upgrade-reason" className="text-sm">
            Why now? <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Textarea
            id="upgrade-reason"
            placeholder="e.g. Finished the orientation videos, confident on the basics, ready to start CMFAS…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-[11px] text-muted-foreground">
            Unlocks: {toMeta.description.toLowerCase()}.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating} className="gap-1.5">
            {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
