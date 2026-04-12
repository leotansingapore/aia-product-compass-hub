import { useState, useEffect } from "react";
import { createPortal } from 'react-dom';
import { MessageSquarePlus, X, Bug, Lightbulb, MessageCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFeedback, FeedbackType } from '@/hooks/useFeedback';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';
import { cn } from '@/lib/utils';

const TYPES: { value: FeedbackType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'bug', label: 'Bug Report', icon: <Bug className="h-4 w-4" />, color: 'text-destructive' },
  { value: 'feature', label: 'Feature Request', icon: <Lightbulb className="h-4 w-4" />, color: 'text-yellow-500' },
  { value: 'feedback', label: 'General Feedback', icon: <MessageCircle className="h-4 w-4" />, color: 'text-primary' },
];

type FeedbackModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Controlled feedback form + panel (portal). Use with sidebar, mobile sheet, etc. */
export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const { user } = useSimplifiedAuth();
  const { submitFeedback, submitting } = useFeedback();
  const [type, setType] = useState<FeedbackType>('feedback');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [typeOpen, setTypeOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) {
      setTitle('');
      setDescription('');
      setType('feedback');
      setSuccess(false);
      setTypeOpen(false);
    }
  }, [open]);

  if (!user) return null;

  const selectedType = TYPES.find(t => t.value === type)!;

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    const ok = await submitFeedback({ type, title: title.trim(), description: description.trim() });
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
      }, 1800);
    }
  };

  if (!open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[9991] flex items-end sm:items-end sm:justify-end pointer-events-none"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/20 sm:hidden pointer-events-auto"
        onClick={handleClose}
      />

      <div
        className={cn(
          'relative pointer-events-auto',
          'w-full sm:w-[380px]',
          'mb-0 sm:mb-8 sm:mr-6',
          'rounded-t-2xl sm:rounded-2xl',
          'bg-card border border-border shadow-2xl',
          'animate-in slide-in-from-bottom-4 duration-200',
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Share Feedback</span>
          </div>
          <button
            onClick={handleClose}
            className="rounded-md p-1 hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold text-sm">Thank you!</p>
            <p className="text-muted-foreground text-xs">Your feedback has been submitted.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div className="relative">
              <Label className="text-xs mb-1.5 block text-muted-foreground">Type</Label>
              <button
                type="button"
                onClick={() => setTypeOpen(v => !v)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border bg-background text-sm hover:border-primary/40 transition-colors"
              >
                <span className={cn('flex items-center gap-2', selectedType.color)}>
                  {selectedType.icon}
                  <span className="text-foreground">{selectedType.label}</span>
                </span>
                <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', typeOpen && 'rotate-180')} />
              </button>
              {typeOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-lg z-10 overflow-hidden">
                  {TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => { setType(t.value); setTypeOpen(false); }}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left',
                        type === t.value && 'bg-muted'
                      )}
                    >
                      <span className={t.color}>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="fb-title" className="text-xs mb-1.5 block text-muted-foreground">Title</Label>
              <Input
                id="fb-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={type === 'bug' ? 'e.g. Video plays twice on mobile' : 'Brief summary…'}
                maxLength={120}
                required
                className="text-sm"
              />
            </div>

            <div>
              <Label htmlFor="fb-desc" className="text-xs mb-1.5 block text-muted-foreground">
                {type === 'bug' ? 'Steps to reproduce / what happened' : 'Details'}
              </Label>
              <Textarea
                id="fb-desc"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={type === 'bug' ? '1. Go to…\n2. Click…\n3. Expected: … Got: …' : 'Tell us more…'}
                rows={4}
                maxLength={2000}
                required
                className="text-sm resize-none"
              />
            </div>

            <p className="text-[11px] text-muted-foreground">
              📍 Page: <span className="font-mono">{window.location.pathname}</span>
            </p>

            <Button type="submit" className="w-full" disabled={submitting || !title.trim() || !description.trim()}>
              {submitting ? 'Submitting…' : 'Submit'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
