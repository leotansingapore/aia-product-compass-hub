import { useEffect, useState } from 'react';
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
import { useTargetExamDate } from '@/hooks/useTargetExamDate';

interface ExamCountdownDateSheetProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}

/**
 * Standalone target-date picker. Used by the workspace TodayView countdown
 * stat (and any future callers). Keeps `useTargetExamDate` as the source of
 * truth — this component is only the UI surface.
 */
export function ExamCountdownDateSheet({ open, onOpenChange }: ExamCountdownDateSheetProps) {
  const { isoDate, setDate, clear } = useTargetExamDate();
  const [draft, setDraft] = useState(isoDate ?? '');

  useEffect(() => {
    if (open) setDraft(isoDate ?? '');
  }, [open, isoDate]);

  const handleSave = () => {
    if (draft) setDate(draft);
    onOpenChange(false);
  };

  const handleClear = () => {
    clear();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Target exam date</SheetTitle>
          <SheetDescription>
            Pick the date you want to sit your first CMFAS paper. We'll show a countdown so the goal
            stays concrete.
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
          {isoDate ? (
            <Button variant="ghost" onClick={handleClear} className="text-muted-foreground">
              Clear date
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button onClick={handleSave} disabled={!draft}>
              Save date
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
