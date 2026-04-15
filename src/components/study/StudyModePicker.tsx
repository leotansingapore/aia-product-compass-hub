import { Sparkles, RotateCcw, Layers } from 'lucide-react';

export type StudyMode = 'fresh' | 'review' | 'all';

interface StudyModePickerProps {
  freshCount: number;
  reviewCount: number;
  totalCount: number;
  selectedMode?: StudyMode | null;
  onPick: (mode: StudyMode) => void;
}

const modes: { mode: StudyMode; label: string; count: (p: StudyModePickerProps) => number }[] = [
  { mode: 'fresh', label: 'Fresh — unseen questions', count: (p) => p.freshCount },
  { mode: 'review', label: 'Review — attempted, not mastered', count: (p) => p.reviewCount },
  { mode: 'all', label: 'Redo All — every question', count: (p) => p.totalCount },
];

export function StudyModePicker(props: StudyModePickerProps) {
  const { selectedMode, onPick } = props;

  return (
    <select
      value={selectedMode ?? ''}
      onChange={(e) => e.target.value && onPick(e.target.value as StudyMode)}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">Select a learning mode</option>
      {modes.map(({ mode, label, count }) => {
        const c = count(props);
        return (
          <option key={mode} value={mode} disabled={c === 0}>
            {label} ({c})
          </option>
        );
      })}
    </select>
  );
}
