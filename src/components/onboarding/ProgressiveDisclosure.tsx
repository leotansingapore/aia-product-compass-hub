import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/hooks/useAuth';
import { 
  ChevronDown, 
  ChevronRight, 
  Lightbulb, 
  Star, 
  TrendingUp, 
  BookOpen,
  Video,
  Users,
  Target
} from 'lucide-react';

interface FeatureGroup {
  id: string;
  title: string;
  description: string;
  icon: any;
  level: 'beginner' | 'intermediate' | 'advanced';
  unlockCondition: () => boolean;
  features: {
    title: string;
    description: string;
    isNew?: boolean;
    isPremium?: boolean;
  }[];
}

export function ProgressiveDisclosure() {
  const { user } = useAuth();
  const { getProgress, isStepCompleted } = useOnboarding();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['essential']);

  const featureGroups: FeatureGroup[] = [
    {
      id: 'essential',
      title: 'Essential Features',
      description: 'Core functionality to get you started',
      icon: BookOpen,
      level: 'beginner',
      unlockCondition: () => true,
      features: [
        {
          title: 'Product Search & Browse',
          description: 'Find and explore AIA products across all categories',
        },
        {
          title: 'Product Detail Views',
          description: 'Access comprehensive product information and resources',
        },
        {
          title: 'Basic Navigation',
          description: 'Navigate through categories and product pages',
        }
      ]
    },
    {
      id: 'enhanced',
      title: 'Enhanced Tools',
      description: 'Unlock advanced search and personalization',
      icon: TrendingUp,
      level: 'intermediate',
      unlockCondition: () => isStepCompleted('search-product') && isStepCompleted('browse-category'),
      features: [
        {
          title: 'Client Profile Matching',
          description: 'Find products based on client demographics and needs',
        },
        {
          title: 'Bookmarking System',
          description: 'Save and organize your frequently accessed content',
        },
        {
          title: 'Learning Analytics',
          description: 'Track your progress and learning patterns',
          isNew: true,
        }
      ]
    },
    {
      id: 'professional',
      title: 'Professional Tools',
      description: 'Sales-focused features for client interactions',
      icon: Target,
      level: 'intermediate',
      unlockCondition: () => getProgress() >= 40,
      features: [
        {
          title: 'Sales Presentation Tools',
          description: 'Access presentation materials and talking points',
        },
        {
          title: 'Objection Handling Guides',
          description: 'Learn to address common client concerns effectively',
        },
        {
          title: 'Comparison Tools',
          description: 'Compare products side-by-side for client discussions',
          isNew: true,
        }
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced Features',
      description: 'Expert-level tools and AI assistance',
      icon: Star,
      level: 'advanced',
      unlockCondition: () => getProgress() >= 70,
      features: [
        {
          title: 'AI Product Assistant',
          description: 'Get instant answers from product-specific AI assistants',
          isPremium: true,
        },
        {
          title: 'Interactive Video Learning',
          description: 'Engage with interactive training videos and assessments',
          isPremium: true,
        },
        {
          title: 'Custom Learning Paths',
          description: 'Personalized learning recommendations based on your role',
          isPremium: true,
        }
      ]
    }
  ];

  const unlockedGroups = featureGroups.filter(group => group.unlockCondition());
  const lockedGroups = featureGroups.filter(group => !group.unlockCondition());

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-blue-600 bg-blue-100';
      case 'advanced': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Intermediate';
      case 'advanced': return 'Advanced';
      default: return 'Unknown';
    }
  };

  if (!user) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          Available Features
          <Badge variant="outline">{unlockedGroups.length}/{featureGroups.length} unlocked</Badge>
        </CardTitle>
        <CardDescription>
          Features unlock as you progress through the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Unlocked Features */}
          {unlockedGroups.map((group) => {
            const Icon = group.icon;
            const isExpanded = expandedGroups.includes(group.id);

            return (
              <Collapsible
                key={group.id}
                open={isExpanded}
                onOpenChange={() => toggleGroup(group.id)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center gap-4 p-4 rounded-lg border border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{group.title}</h4>
                        <Badge className={`text-micro ${getLevelColor(group.level)}`}>
                          {getLevelLabel(group.level)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{group.description}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="ml-14 mr-4 mt-2 space-y-2">
                    {group.features.map((feature, index) => (
                      <div key={index} className="p-3 rounded-md bg-accent/30 border border-border">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-sm">{feature.title}</h5>
                          <div className="flex gap-1">
                            {feature.isNew && (
                              <Badge variant="default" className="text-micro">New</Badge>
                            )}
                            {feature.isPremium && (
                              <Badge variant="secondary" className="text-micro">Premium</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-micro text-muted-foreground mt-1">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}

          {/* Locked Features */}
          {lockedGroups.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                🔒 Unlock More Features
              </h4>
              {lockedGroups.map((group) => {
                const Icon = group.icon;

                return (
                  <div
                    key={group.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-dashed border-muted opacity-60"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-muted-foreground">{group.title}</h4>
                        <Badge variant="outline" className="text-micro">
                          Locked
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{group.description}</p>
                      <p className="text-micro text-muted-foreground mt-1">
                        Complete more tasks to unlock
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}