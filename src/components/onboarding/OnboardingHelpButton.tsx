
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/hooks/useAuth';
import { 
  HelpCircle, 
  Play, 
  CheckCircle, 
  RotateCcw, 
  BookOpen, 
  Zap, 
  Users,
  X,
  ChevronUp,
  Sparkles
} from 'lucide-react';

export function OnboardingHelpButton() {
  const { user } = useAuth();
  const { 
    startOnboarding, 
    getProgress, 
    isOnboardingActive, 
    canResumeTour, 
    resumeTour, 
    resetTour,
    completedStepsCount,
    totalSteps,
    tourType
  } = useOnboarding();
  const [showMenu, setShowMenu] = useState(false);
  const [showTourOptions, setShowTourOptions] = useState(false);

  if (!user || isOnboardingActive) return null;

  const progress = getProgress();
  const isComplete = progress === 100;

  const tourOptions = [
    {
      id: 'basic',
      title: 'Quick Start Tour',
      description: 'Essential features in 5 minutes',
      icon: Play,
      duration: '~5 min',
      steps: 6,
      color: 'bg-blue-500',
    },
    {
      id: 'advanced',
      title: 'Complete Tour',
      description: 'Full platform walkthrough',
      icon: Zap,
      duration: '~10 min',
      steps: 8,
      color: 'bg-purple-500',
    },
    {
      id: 'admin',
      title: 'Admin Features',
      description: 'Advanced administrative tools',
      icon: Users,
      duration: '~7 min',
      steps: 5,
      color: 'bg-green-500',
      condition: () => user?.user_metadata?.role === 'admin',
    },
  ];

  const handleStartTour = (selectedTourType: 'basic' | 'advanced' | 'admin') => {
    startOnboarding(selectedTourType);
    setShowMenu(false);
    setShowTourOptions(false);
  };

  const handleResetTour = () => {
    resetTour();
    setShowMenu(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tour Options Menu */}
      {showTourOptions && (
        <Card className="mb-4 w-80 shadow-elegant animate-scale-in">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-primary" />
                Choose Your Tour
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowTourOptions(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription>
              Select the tour that best fits your needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tourOptions
              .filter(option => !option.condition || option.condition())
              .map((option) => (
                <div
                  key={option.id}
                  className="p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-all hover:shadow-sm"
                  onClick={() => handleStartTour(option.id as any)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full ${option.color} flex items-center justify-center`}>
                      <option.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{option.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {option.steps} steps
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {option.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-primary">
                          {option.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Main Help Menu */}
      {showMenu && !showTourOptions && (
        <Card className="mb-4 w-80 shadow-elegant animate-scale-in">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="w-5 h-5 text-primary" />
                Learning Assistant
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowMenu(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription>
              Get guided assistance to master the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Section */}
            <div className="p-3 rounded-lg bg-accent/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Your Progress</h4>
                <Badge variant={isComplete ? "default" : "secondary"}>
                  {isComplete ? "Complete" : `${completedStepsCount}/${totalSteps}`}
                </Badge>
              </div>
              <Progress value={progress} className="h-2 mb-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{progress}% completed</span>
                {tourType && (
                  <span className="capitalize">{tourType} tour</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {canResumeTour && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    resumeTour();
                    setShowMenu(false);
                  }}
                  className="w-full justify-start bg-gradient-to-r from-primary to-primary/80"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume Tour ({completedStepsCount}/{totalSteps})
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTourOptions(true)}
                className="w-full justify-start"
              >
                {isComplete ? (
                  <RotateCcw className="w-4 h-4 mr-2" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isComplete ? "Take Another Tour" : "Start Interactive Tour"}
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
                <BookOpen className="w-4 h-4 mr-2" />
                Help Documentation
              </Button>

              {(progress > 0 || isComplete) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetTour}
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Progress
                </Button>
              )}
            </div>

            {/* Quick Tips */}
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-sm mb-2 text-blue-800 dark:text-blue-200">
                💡 Quick Tip
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {isComplete
                  ? "Explore advanced features or check out the latest updates!"
                  : "Use the search bar to quickly find specific products or features."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowMenu(!showMenu)}
        className={`rounded-full w-14 h-14 shadow-elegant hover:shadow-lg transition-all duration-300 ${
          canResumeTour 
            ? 'bg-gradient-to-r from-primary via-primary to-primary/80 animate-pulse' 
            : isComplete 
              ? 'bg-gradient-to-r from-green-500 to-green-600' 
              : 'bg-gradient-to-r from-primary to-primary/80'
        }`}
        size="icon"
      >
        {showMenu ? (
          <ChevronUp className="w-6 h-6" />
        ) : canResumeTour ? (
          <div className="relative">
            <Play className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-bounce" />
          </div>
        ) : isComplete ? (
          <CheckCircle className="w-6 h-6" />
        ) : (
          <HelpCircle className="w-6 h-6" />
        )}
      </Button>
    </div>
  );
}
