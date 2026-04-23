import { cn } from '@/lib/utils';
import type { WorkspaceMode } from '../CMFASWorkspaceNav';
import { StudyDeskStepFlow } from './StudyDeskStepFlow';

export function StudyDeskView({
  onSelectWorkspaceMode,
}: {
  onSelectWorkspaceMode: (mode: WorkspaceMode) => void;
}) {
  return (
    <div
      className={cn(
        'flex w-full min-h-0 flex-col gap-4',
        'lg:min-h-0 lg:flex-1',
      )}
    >
      <StudyDeskStepFlow
        onSelectWorkspaceMode={onSelectWorkspaceMode}
        roomEyebrow="Your study room"
        roomTitle="CMFAS exam preparation"
      />
    </div>
  );
}
