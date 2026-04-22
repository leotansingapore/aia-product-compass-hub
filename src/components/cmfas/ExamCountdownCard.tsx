import { useState } from 'react';
import { Calendar, CalendarClock, CalendarPlus } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useTargetExamDate } from '@/hooks/useTargetExamDate';
import { cmfasTone } from './cmfasTheme';

/**
 * Personal exam countdown. Learner picks a target date; we show days-until.
 * Stored in localStorage via useTargetExamDate.
 */
export function ExamCountdownCard() {
  const { isoDate, date, daysUntil, setDate, clear } = useTargetExamDate();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(isoDate ?? '');

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) setDraft(isoDate ?? '');
  };

  const handleSave = () => {
    if (draft) setDate(draft);
    setOpen(false);
  };

  // No date set — CTA card.
  if (!isoDate || daysUntil === null || !date) {
    return (
      <>
        <button
          type="button"
          onClick={() => handleOpenChange(true)}
          className={cn(
            'w-full rounded-2xl border-2 border-dashed px-5 py-4 text-left transition-colors',
            cmfasTone.accentBorder,
            cmfasTone.accentHoverBg,
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', cmfasTone.accentBg)}>
              <CalendarPlus className={cn('h-5 w-5', cmfasTone.accentText)} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Set your target exam date</p>
              <p className="text-xs text-muted-foreground">
                A real deadline turns "someday" into "this month". Takes 5 seconds.
              </p>
            </div>
          </div>
        </button>
        <CountdownSheet open={open} onOpenChange={handleOpenChange} draft={draft} setDraft={setDraft} onSave={handleSave} onClear={null} />
      </>
    );
  }

  const isOverdue = daysUntil < 0;
  const isSoon = daysUntil >= 0 && daysUntil <= 7;

  return (
    <>
      <div
        className={cn(
          'rounded-2xl border-2 px-5 py-5 transition-colors',
          isOverdue
            ? 'border-amber-300 bg-amber-50/40 dark:border-amber-700/40 dark:bg-amber-950/10'
            : cn(cmfasTone.accentBorder, cmfasTone.accentBgSoft),
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', cmfasTone.accentBg)}>
              <CalendarClock className={cn('h-6 w-6', cmfasTone.accentText)} />
            </div>
            <div>
              <p className={cn('text-[11px] font-semibold uppercase tracking-wider', cmfasTone.accentText)}>
                {isOverdue ? 'Target date passed' : isSoon ? 'Exam is coming up' : 'Your exam'}
              </p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums text-foreground">
                {isOverdue ? `${Math.abs(daysUntil)} days ago` : daysUntil === 0 ? 'Today' : `${daysUntil} days`}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                <Calendar className="mr-1 inline h-3 w-3" />
                {format(date, 'EEE, d MMM yyyy')}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => handleOpenChange(true)}
          >
            Change
          </Button>
        </div>
      </div>
      <CountdownSheet
        open={open}
        onOpenChange={handleOpenChange}
        draft={draft}
        setDraft={setDraft}
        onSave={handleSave}
        onClear={() => {
          clear();
          setOpen(false);
        }}
      />
    </>
  );
}

function CountdownSheet({
  open,
  onOpenChange,
  draft,
  setDraft,
  onSave,
  onClear,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  draft: string;
  setDraft: (next: string) => void;
  onSave: () => void;
  onClear: (() => void) | null;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Target exam date</SheetTitle>
          <SheetDescription>
            Pick the date you want to sit your first CMFAS paper. We'll show a countdown so the goal stays concrete.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          <Label htmlFor="exam-date">Exam date</Label>
          <Input
            id="exam-date"
            type="date"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
          />
          <p className="text-xs text-muted-foreground">
            You can change this anytime. We only store it on this device.
          </p>
        </div>
        <SheetFooter className="mt-6 flex-col gap-2 sm:flex-row sm:justify-between">
          {onClear ? (
            <Button variant="ghost" onClick={onClear} className="text-muted-foreground">
              Clear date
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button onClick={onSave} disabled={!draft}>
              Save date
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
