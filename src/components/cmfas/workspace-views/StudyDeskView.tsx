import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useChecklistProgress } from '@/hooks/useChecklistProgress';
import { cmfasRoom } from '../cmfasTheme';
import type { WorkspaceMode } from '../CMFASWorkspaceNav';
import { GET_READY_STEPS } from './getReadyData';
import { getReadySlideContent } from './getReadySlideContent';
import { StudyDeskProgressHero } from './StudyDeskProgressHero';
import { StudyDeskStepFlow } from './StudyDeskStepFlow';

const DESK_STEP_PARAM = 'deskStep';

export function StudyDeskView({
  readyComplete,
  readyProgress,
  onSelectWorkspaceMode,
}: {
  readyComplete: boolean;
  readyProgress: { done: number; total: number };
  onSelectWorkspaceMode: (mode: WorkspaceMode) => void;
}) {
  const { isItemCompleted } = useChecklistProgress();
  const [, setSearchParams] = useSearchParams();

  const firstIncompleteIndex = useMemo(() => {
    if (readyComplete) return -1;
    return GET_READY_STEPS.findIndex((s) => !isItemCompleted(s.id));
  }, [readyComplete, isItemCompleted]);

  const resumeLine = useMemo(() => {
    if (readyComplete || firstIncompleteIndex < 0) return null;
    const s = GET_READY_STEPS[firstIncompleteIndex];
    const slide = getReadySlideContent(s.id);
    return `Step ${firstIncompleteIndex + 1} — ${slide.slideHeading}`;
  }, [readyComplete, firstIncompleteIndex]);

  const onContinueToSlides = useCallback(() => {
    const i = firstIncompleteIndex < 0 ? 0 : firstIncompleteIndex;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(DESK_STEP_PARAM, String(i));
        return next;
      },
      { replace: true },
    );
    requestAnimationFrame(() => {
      document.getElementById('study-desk-slides')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [firstIncompleteIndex, setSearchParams]);

  return (
    <div
      className={cn(
        'flex w-full min-h-0 flex-col gap-4',
        'lg:min-h-0 lg:flex-1',
      )}
    >
      {!readyComplete && (
        <p className={cn('px-0 sm:px-1 max-w-3xl text-sm leading-relaxed', cmfasRoom.textMuted)}>
          Read each slide here. Use the floating room bar (left) for <strong className="font-medium text-[#e8d4b8]">Syllabus &amp; format</strong> and{' '}
          <strong className="font-medium text-[#e8d4b8]">Exam tutorials</strong> when you need the full lists.
        </p>
      )}

      <StudyDeskProgressHero
        readyComplete={readyComplete}
        readyProgress={readyProgress}
        resumeLine={resumeLine}
        onContinueToSlides={onContinueToSlides}
      />

      <StudyDeskStepFlow
        onSelectWorkspaceMode={onSelectWorkspaceMode}
        roomEyebrow="Your study room"
        roomTitle="CMFAS exam preparation"
      />

    </div>
  );
}
