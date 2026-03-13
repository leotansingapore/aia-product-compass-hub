import { useEffect, useState } from 'react';
import { useAdminFeedback, FeedbackSubmission, FeedbackStatus } from '@/hooks/useFeedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Bug, Lightbulb, MessageCircle, ChevronDown, ChevronUp, Trash2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const TYPE_META = {
  bug: { label: 'Bug', icon: Bug, color: 'text-destructive bg-destructive/10 border-destructive/20' },
  feature: { label: 'Feature', icon: Lightbulb, color: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' },
  feedback: { label: 'Feedback', icon: MessageCircle, color: 'text-primary bg-primary/10 border-primary/20' },
};

const STATUS_META: Record<FeedbackStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400' },
  in_review: { label: 'In Review', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400' },
  dismissed: { label: 'Dismissed', color: 'bg-muted text-muted-foreground border-border' },
};

function FeedbackRow({ item, onUpdate, onDelete }: {
  item: FeedbackSubmission;
  onUpdate: (id: string, status: FeedbackStatus, notes?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(item.admin_notes ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const typeMeta = TYPE_META[item.type as keyof typeof TYPE_META] ?? TYPE_META.feedback;
  const TypeIcon = typeMeta.icon;

  const handleStatusChange = async (status: string) => {
    setSaving(true);
    try {
      await onUpdate(item.id, status as FeedbackStatus);
      toast({ title: 'Status updated' });
    } catch (e: any) {
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await onUpdate(item.id, item.status, notes);
      toast({ title: 'Notes saved' });
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this feedback? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await onDelete(item.id);
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e.message, variant: 'destructive' });
      setDeleting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left"
      >
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-3">
            {/* Type icon */}
            <div className={cn('flex-shrink-0 p-1.5 rounded-md border', typeMeta.color)}>
              <TypeIcon className="h-3.5 w-3.5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="font-medium text-sm truncate">{item.title}</span>
                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 border', STATUS_META[item.status].color)}>
                  {STATUS_META[item.status].label}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                <span>{item.user_name ?? item.user_email ?? 'Unknown user'}</span>
                <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                {item.page_url && <span className="font-mono truncate max-w-[180px]">{item.page_url}</span>}
              </div>
            </div>

            <div className="flex-shrink-0 text-muted-foreground">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
        </CardContent>
      </button>

      {expanded && (
        <div className="border-t border-border px-3 sm:px-4 pb-4 pt-3 space-y-3 bg-muted/20">
          {/* Description */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
            <p className="text-sm whitespace-pre-wrap">{item.description}</p>
          </div>

          {/* Status + Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Status</p>
              <Select value={item.status} onValueChange={handleStatusChange} disabled={saving}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Admin Notes</p>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Internal notes…"
                rows={2}
                className="text-xs resize-none"
              />
              <Button
                size="sm"
                variant="outline"
                className="mt-1.5 h-7 text-xs"
                onClick={handleSaveNotes}
                disabled={saving}
              >
                Save Notes
              </Button>
            </div>
          </div>

          {/* Delete */}
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 h-7 text-xs gap-1.5"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_review', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
];

export function FeedbackPanel() {
  const { items, loading, fetchAll, updateStatus, deleteItem } = useAdminFeedback();
  const [filter, setFilter] = useState('pending');

  useEffect(() => { fetchAll(); }, []);

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);
  const pendingCount = items.filter(i => i.status === 'pending').length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                filter === f.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border text-muted-foreground hover:border-primary/40'
              )}
            >
              {f.label}
              {f.value === 'pending' && pendingCount > 0 && (
                <span className={cn('ml-1.5 px-1 rounded text-[10px]', filter === 'pending' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400')}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading} className="h-7 gap-1.5 text-xs">
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* List */}
      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm gap-2">
          <MessageCircle className="h-8 w-8 opacity-30" />
          <p>No {filter === 'all' ? '' : filter + ' '}submissions</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <FeedbackRow
              key={item.id}
              item={item}
              onUpdate={updateStatus}
              onDelete={deleteItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
