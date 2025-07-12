import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompletionCelebrationProps {
  onStartLearning: () => void;
}

export function CompletionCelebration({ onStartLearning }: CompletionCelebrationProps) {
  return (
    <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
      <div className="text-center">
        <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
        <h3 className="font-semibold text-lg mb-1">Congratulations! 🎉</h3>
        <p className="text-muted-foreground mb-3">
          You've completed all the getting started tasks. You're ready to become a product expert!
        </p>
        <Button variant="default" onClick={onStartLearning}>
          Start Learning Products
        </Button>
      </div>
    </div>
  );
}