import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Users,
  AlertCircle,
  Inbox,
  MessageSquare,
} from 'lucide-react';
import {
  useAdminTierRequests,
  type TierUpgradeRequestWithProfile,
  type TierRequestStatus,
} from '@/hooks/useTierRequests';
import { TierBadge } from '@/components/tier/TierBadge';
import { LoadingState } from '@/components/ui/LoadingState';

function formatRelative(iso: string | null): string {
  if (!iso) return '—';
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
}

function displayName(req: TierUpgradeRequestWithProfile): string {
  const p = req.profile;
  return (
    p?.display_name ||
    (p?.first_name && p?.last_name ? `${p.first_name} ${p.last_name}` : null) ||
    p?.email?.split('@')[0] ||
    req.user_id.slice(0, 8)
  );
}

function RequestRow({ request }: { request: TierUpgradeRequestWithProfile }) {
  const [dialogOpen, setDialogOpen] = useState<'approve' | 'reject' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const { approve, reject, isPending } = useAdminTierRequests(request.status);

  const name = displayName(request);
  const initial = name.charAt(0).toUpperCase();
  const isPendingStatus = request.status === 'pending';

  const handleDecide = (action: 'approve' | 'reject') => {
    const mutation = action === 'approve' ? approve : reject;
    mutation(
      { request, adminNote },
      {
        onSuccess: () => {
          setDialogOpen(null);
          setAdminNote('');
        },
      },
    );
  };

  return (
    <>
      <Card className={isPendingStatus ? 'border-amber-200 dark:border-amber-900' : ''}>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{name}</span>
              {request.profile?.email && (
                <span className="text-xs text-muted-foreground">{request.profile.email}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <TierBadge tier={request.from_tier} compact />
              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
              <TierBadge tier={request.to_tier} compact />
              <span className="text-[11px] text-muted-foreground ml-auto sm:ml-2">
                {formatRelative(request.created_at)}
              </span>
            </div>
            {request.reason && (
              <p className="text-xs text-muted-foreground mt-2 italic flex items-start gap-1.5">
                <MessageSquare className="h-3 w-3 shrink-0 mt-0.5" />
                <span className="line-clamp-3">&ldquo;{request.reason}&rdquo;</span>
              </p>
            )}
            {request.admin_note && !isPendingStatus && (
              <p className="text-xs text-muted-foreground mt-1.5">
                <strong>Admin note:</strong> {request.admin_note}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isPendingStatus ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setDialogOpen('reject')}
                  disabled={isPending}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setDialogOpen('approve')}
                  disabled={isPending}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Approve
                </Button>
              </>
            ) : (
              <Badge variant={request.status === 'approved' ? 'default' : 'destructive'} className="gap-1">
                {request.status === 'approved' ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {request.status}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen !== null} onOpenChange={(open) => !open && setDialogOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogOpen === 'approve' ? 'Approve upgrade' : 'Reject upgrade'}
            </DialogTitle>
            <DialogDescription>
              {dialogOpen === 'approve'
                ? `${name} will be moved to ${request.to_tier.replace('_', '-')} and notified by email.`
                : `${name} will be notified that the request was rejected. You can leave a note explaining why.`}
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder={
              dialogOpen === 'approve'
                ? 'Optional note for the user…'
                : "Optional: reason so the user knows what to improve…"
            }
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={3}
            className="resize-none"
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => dialogOpen && handleDecide(dialogOpen)}
              disabled={isPending}
              variant={dialogOpen === 'reject' ? 'destructive' : 'default'}
              className="gap-1.5"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm {dialogOpen}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function TierRequestsPanel() {
  const [statusFilter, setStatusFilter] = useState<TierRequestStatus | 'all'>('pending');
  const { requests, isLoading, error, refetch, isPending } = useAdminTierRequests(statusFilter);

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-10 w-10 mx-auto mb-3 text-destructive opacity-40" />
          <p className="font-medium text-destructive">Could not load tier requests</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <Button size="sm" variant="outline" className="mt-4 gap-1.5" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const counts = {
    pending: requests.filter((r) => r.status === 'pending').length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Tier Upgrade Requests
          </h2>
          <p className="text-sm text-muted-foreground">
            Review users asking to move up a tier. Approving flips their access and emails them.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isPending}>
            <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Loading tier requests…" />
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            {statusFilter === 'pending' ? (
              <>
                <Clock className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="font-medium">No pending requests</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You&rsquo;ll see user tier-upgrade requests here when they come in.
                </p>
              </>
            ) : (
              <>
                <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="font-medium">No {statusFilter} requests</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {requests.map((req) => (
            <RequestRow key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  );
}
