import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHORTCUTS: { keys: string[]; description: string }[] = [
  { keys: ['Ctrl', 'Z'], description: 'Undo' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
  { keys: ['Delete'], description: 'Delete selected' },
  { keys: ['Ctrl', 'C'], description: 'Copy' },
  { keys: ['Ctrl', 'V'], description: 'Paste' },
  { keys: ['Ctrl', 'D'], description: 'Duplicate' },
  { keys: ['F'], description: 'Fit view' },
  { keys: ['\u2190 \u2191 \u2193 \u2192'], description: 'Nudge selected' },
  { keys: ['Ctrl', 'S'], description: 'Save flow' },
  { keys: ['Ctrl', 'A'], description: 'Select all' },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[11px] font-mono font-medium bg-muted border border-border rounded shadow-sm text-foreground">
      {children}
    </kbd>
  );
}

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Available shortcuts for the flow builder.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-0.5 mt-2">
          {SHORTCUTS.map(({ keys, description }) => (
            <div
              key={description}
              className="flex items-center justify-between py-1.5 px-1"
            >
              <span className="text-sm text-foreground">{description}</span>
              <div className="flex items-center gap-1">
                {keys.map((key, i) => (
                  <span key={i} className="flex items-center gap-0.5">
                    {i > 0 && (
                      <span className="text-[10px] text-muted-foreground mx-0.5">+</span>
                    )}
                    <Kbd>{key}</Kbd>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
