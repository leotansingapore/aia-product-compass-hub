import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/hooks/useAuth';
import { HelpCircle, Play, CheckCircle, RotateCcw } from 'lucide-react';

export function OnboardingHelpButton() {
  const { user } = useAuth();
  const { startOnboarding, getProgress, isOnboardingActive } = useOnboarding();
  const [showMenu, setShowMenu] = useState(false);

  if (!user || isOnboardingActive) return null;

  const progress = getProgress();
  const isComplete = progress === 100;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {showMenu && (
        <Card className="mb-4 w-72 shadow-elegant animate-scale-in">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <HelpCircle className="w-5 h-5 text-primary" />
              Need Help?
            </CardTitle>
            <CardDescription>
              Get guided assistance to master the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <div>
                <h4 className="font-medium text-sm">Learning Progress</h4>
                <p className="text-xs text-muted-foreground">
                  {progress}% of onboarding complete
                </p>
              </div>
              <Badge variant={isComplete ? "default" : "secondary"}>
                {isComplete ? "Complete" : "In Progress"}
              </Badge>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  startOnboarding();
                  setShowMenu(false);
                }}
                className="w-full justify-start"
              >
                {isComplete ? (
                  <RotateCcw className="w-4 h-4 mr-2" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isComplete ? "Retake Tour" : "Start Interactive Tour"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  window.open('/how-to-use', '_blank');
                  setShowMenu(false);
                }}
                className="w-full justify-start"
              >
                📖 View Help Guide
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={() => setShowMenu(!showMenu)}
        className="rounded-full w-14 h-14 shadow-elegant hover:shadow-lg transition-all"
        size="icon"
      >
        {isComplete ? (
          <CheckCircle className="w-6 h-6" />
        ) : (
          <HelpCircle className="w-6 h-6" />
        )}
      </Button>
    </div>
  );
}