import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  BookOpen, 
  Users, 
  Bookmark, 
  Video,
  Target,
  Sparkles
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: () => void;
  points: number;
  category: 'essential' | 'explore' | 'advanced';
}

export function GettingStartedChecklist() {
  const navigate = useNavigate();
  const { completeStep, isStepCompleted, getProgress, startOnboarding } = useOnboarding();
  const [isExpanded, setIsExpanded] = useState(true);

  const checklistItems: ChecklistItem[] = [
    {
      id: 'take-tour',
      title: 'Take the Interactive Tour',
      description: 'Get familiar with the platform through our guided walkthrough',
      icon: Sparkles,
      action: () => startOnboarding(),
      points: 20,
      category: 'essential'
    },
    {
      id: 'search-product',
      title: 'Try the Search Feature',
      description: 'Search for a product or topic to see how our enhanced search works',
      icon: Search,
      action: () => {
        completeStep('search-product');
        navigate('/');
        // Focus search after navigation
        setTimeout(() => {
          const searchInput = document.querySelector('[data-onboarding="search"] input') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        }, 100);
      },
      points: 15,
      category: 'essential'
    },
    {
      id: 'browse-category',
      title: 'Browse a Product Category',
      description: 'Explore one of our product categories to see detailed information',
      icon: BookOpen,
      action: () => {
        completeStep('browse-category');
        navigate('/category/investment');
      },
      points: 15,
      category: 'essential'
    },
    {
      id: 'client-profile',
      title: 'Use Client Profile Search',
      description: 'Find products based on client demographics and needs',
      icon: Users,
      action: () => {
        completeStep('client-profile');
        navigate('/search-by-profile');
      },
      points: 20,
      category: 'explore'
    },
    {
      id: 'bookmark-item',
      title: 'Bookmark Your First Item',
      description: 'Save a product or resource for quick access later',
      icon: Bookmark,
      action: () => {
        completeStep('bookmark-item');
        navigate('/category/investment');
      },
      points: 10,
      category: 'explore'
    },
    {
      id: 'watch-video',
      title: 'Watch a Training Video',
      description: 'View a product explainer video to see our learning materials',
      icon: Video,
      action: () => {
        completeStep('watch-video');
        navigate('/category/investment');
      },
      points: 15,
      category: 'explore'
    },
    {
      id: 'sales-tools',
      title: 'Explore Sales Tools',
      description: 'Check out objection handling guides and presentation materials',
      icon: Target,
      action: () => {
        completeStep('sales-tools');
        navigate('/sales-tools');
      },
      points: 15,
      category: 'advanced'
    }
  ];

  const completedItems = checklistItems.filter(item => isStepCompleted(item.id));
  const totalPoints = checklistItems.reduce((sum, item) => sum + item.points, 0);
  const earnedPoints = completedItems.reduce((sum, item) => sum + item.points, 0);
  const progressPercentage = Math.round((earnedPoints / totalPoints) * 100);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'essential': return 'bg-red-500';
      case 'explore': return 'bg-blue-500';
      case 'advanced': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'essential': return 'Essential';
      case 'explore': return 'Explore';
      case 'advanced': return 'Advanced';
      default: return '';
    }
  };

  return (
    <Card className="mb-8">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/30 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Getting Started Checklist
                  <Badge variant="secondary">{completedItems.length}/{checklistItems.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Complete these tasks to master the platform • {earnedPoints}/{totalPoints} points
                </CardDescription>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2 mt-3">
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progressPercentage}% Complete</span>
                <span>{completedItems.length} of {checklistItems.length} tasks done</span>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent>
            <div className="space-y-3">
              {checklistItems.map((item) => {
                const completed = isStepCompleted(item.id);
                const Icon = item.icon;
                
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      completed 
                        ? 'bg-accent/30 border-primary/20' 
                        : 'hover:bg-accent/20 border-border'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {completed ? (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${completed ? 'text-muted-foreground line-through' : ''}`}>
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getCategoryColor(item.category)}`} />
                          <Badge variant="outline" className="text-xs">
                            {getCategoryLabel(item.category)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            +{item.points} pts
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>

                    {!completed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={item.action}
                        className="flex-shrink-0"
                      >
                        Start
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {progressPercentage === 100 && (
              <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-lg mb-1">Congratulations! 🎉</h3>
                  <p className="text-muted-foreground mb-3">
                    You've completed all the getting started tasks. You're ready to become a product expert!
                  </p>
                  <Button variant="hero" onClick={() => navigate('/category/investment')}>
                    Start Learning Products
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}