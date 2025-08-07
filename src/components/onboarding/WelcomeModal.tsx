
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/hooks/useAuth';
import { 
  BookOpen, 
  Sparkles, 
  Target, 
  Users, 
  Video, 
  Brain, 
  Play,
  Zap,
  Clock,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Comprehensive Knowledge Base',
    description: 'Access detailed information on all AIA products with AI-powered search',
    badge: 'Essential',
    color: 'bg-blue-500'
  },
  {
    icon: Video,
    title: 'Interactive Learning',
    description: 'Watch explainer videos, tutorials, and interactive training modules',
    badge: 'Popular',
    color: 'bg-purple-500'
  },
  {
    icon: Users,
    title: 'Smart Client Profiling',
    description: 'Find the perfect products for specific client needs and demographics',
    badge: 'Smart',
    color: 'bg-green-500'
  },
  {
    icon: Brain,
    title: 'AI Assistant',
    description: 'Get instant answers and personalized recommendations from AI',
    badge: 'AI-Powered',
    color: 'bg-orange-500'
  },
  {
    icon: Target,
    title: 'Sales Excellence Tools',
    description: 'Access objection handling guides and presentation materials',
    badge: 'Practical',
    color: 'bg-red-500'
  },
  {
    icon: Sparkles,
    title: 'Personalized Experience',
    description: 'Track progress and get tailored learning recommendations',
    badge: 'Premium',
    color: 'bg-pink-500'
  }
];

const tourOptions = [
  {
    id: 'basic',
    title: 'Quick Start',
    subtitle: 'Essential features walkthrough',
    description: 'Perfect for getting started quickly with the core features',
    icon: Play,
    duration: '5 minutes',
    steps: 6,
    color: 'from-blue-500 to-blue-600',
    features: ['Search & Navigation', 'Product Categories', 'Basic Tools'],
  },
  {
    id: 'advanced',
    title: 'Complete Tour',
    subtitle: 'Full platform experience',
    description: 'Comprehensive walkthrough of all features and capabilities',
    icon: Zap,
    duration: '10 minutes',
    steps: 8,
    color: 'from-purple-500 to-purple-600',
    features: ['All Basic Features', 'AI Assistant', 'Analytics', 'Advanced Tools'],
    recommended: true,
  },
];

export function WelcomeModal() {
  const { showWelcome, dismissWelcome, startOnboarding } = useOnboarding();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const userName = user?.email ? user.email.split('@')[0] : 'there';
  const userRole = user?.user_metadata?.role || 'user';

  const slides = [
    {
      title: `Welcome to FINternship Learning Platform, ${userName}! 👋`,
      description: "Your comprehensive resource for product knowledge and sales excellence. Discover what makes this platform special.",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="p-4 hover:shadow-md transition-all duration-300 group cursor-pointer border-border/50 hover:border-primary/50"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {feature.title}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">
              Join thousands of financial advisors who are already using our platform to excel in their careers
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Choose Your Learning Path 🎯",
      description: "We'll customize your experience based on how much time you have and what you want to learn.",
      content: (
        <div className="space-y-4">
          {tourOptions.map((option) => (
            <Card 
              key={option.id}
              className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg border-2 hover:border-primary/50 ${
                option.recommended ? 'border-primary/30 bg-primary/5' : 'border-border/50'
              }`}
              onClick={() => {
                dismissWelcome();
                setTimeout(() => startOnboarding(option.id as any), 300);
              }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${option.color} flex items-center justify-center`}>
                  <option.icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{option.title}</h3>
                    {option.recommended && (
                      <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {option.subtitle}
                  </p>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {option.description}
                  </p>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {option.duration}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3" />
                      {option.steps} steps
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium">What you'll learn:</p>
                    <div className="flex flex-wrap gap-1">
                      {option.features.map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Card>
          ))}
          
          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground mb-3">
              Not ready for a tour? You can always start one later from the help button.
            </p>
            <Button
              variant="ghost"
              onClick={dismissWelcome}
              className="text-sm"
            >
              I'll explore on my own
            </Button>
          </div>
        </div>
      )
    }
  ];

  const handleStartTour = (tourType: 'basic' | 'advanced') => {
    dismissWelcome();
    setTimeout(() => {
      startOnboarding(tourType);
    }, 300);
  };

  const handleSkipTour = () => {
    dismissWelcome();
  };

  return (
    <Dialog open={showWelcome} onOpenChange={dismissWelcome}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {slides[currentSlide].title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {slides[currentSlide].description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {slides[currentSlide].content}
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-primary w-6' 
                    : 'bg-muted hover:bg-muted-foreground/50'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {currentSlide === 0 ? (
              <>
                <Button
                  variant="ghost"
                  onClick={handleSkipTour}
                >
                  Skip for now
                </Button>
                <Button
                  onClick={() => setCurrentSlide(1)}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setCurrentSlide(0)}
                >
                  Back
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSkipTour}
                >
                  Explore on My Own
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
