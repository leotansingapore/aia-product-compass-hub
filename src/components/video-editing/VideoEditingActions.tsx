import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface VideoEditingActionsProps {
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function VideoEditingActions({ saving, onSave, onCancel }: VideoEditingActionsProps) {
  return (
    <div className={`relative ${saving ? 'opacity-80 pointer-events-none' : ''}`}>
      {saving && (
        <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden rounded-full">
          <div className="h-full w-1/3 bg-primary rounded-full animate-[indeterminate_1.5s_ease-in-out_infinite]"
            style={{
              animation: 'indeterminate 1.5s ease-in-out infinite',
            }}
          />
          <style>{`
            @keyframes indeterminate {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(200%); }
              100% { transform: translateX(400%); }
            }
          `}</style>
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={onSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Save All Changes
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={saving} size="lg">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
