import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Sparkles, Target, Users, Video, Brain } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Product Knowledge Base',
    description: 'Access comprehensive information on all AIA products',
    badge: 'Essential'
  },
  {
    icon: Video,
    title: 'Interactive Learning',
    description: 'Watch explainer videos and training materials',
    badge: 'Popular'
  },
  {
    icon: Users,
    title: 'Client Profiling',
    description: 'Find the right products for specific client needs',
    badge: 'Smart'
  },
  {
    icon: Brain,
    title: 'AI Assistance',
    description: 'Get instant answers from product-specific AI assistants',
    badge: 'New'
  },
  {
    icon: Target,
    title: 'Sales Tools',
    description: 'Access objection handling guides and presentation materials',
    badge: 'Practical'
  },
  {
    icon: Sparkles,
    title: 'Personalized Experience',
    description: 'Track progress and get personalized recommendations',
    badge: 'Premium'
  }
];

export function WelcomeModal() {
  const { showWelcome, dismissWelcome, startOnboarding } = useOnboarding();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: `Welcome to AIA Learning Platform${user?.email ? `, ${user.email.split('@')[0]}` : ''}!`,
      description: "Your comprehensive resource for product knowledge and sales excellence. Let's explore what you can achieve here.",
      content: (
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="p-4 hover:shadow-card transition-all duration-300">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{feature.title}</h4>
                    <Badge variant="secondary" className="text-xs">{feature.badge}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )
    },
    {
      title: "Ready to Get Started?",
      description: "We'll guide you through the key features with a quick interactive tour, or you can explore on your own.",
      content: (
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-accent/30">
                <h4 className="font-semibold mb-2">🎯 Take the Tour</h4>
                <p className="text-muted-foreground">5-minute guided walkthrough of key features</p>
              </div>
              <div className="p-4 rounded-lg bg-accent/30">
                <h4 className="font-semibold mb-2">🚀 Explore Freely</h4>
                <p className="text-muted-foreground">Jump right in and discover at your own pace</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleStartTour = () => {
    dismissWelcome();
    setTimeout(() => {
      startOnboarding();
    }, 300);
  };

  const handleSkipTour = () => {
    dismissWelcome();
  };

  return (
    <Dialog open={showWelcome} onOpenChange={dismissWelcome}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{slides[currentSlide].title}</DialogTitle>
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
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-primary' : 'bg-muted'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {currentSlide === 0 ? (
              <Button
                variant="outline"
                onClick={() => setCurrentSlide(1)}
              >
                Next
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setCurrentSlide(0)}
                >
                  Back
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSkipTour}
                >
                  Explore on My Own
                </Button>
                <Button
                  variant="hero"
                  onClick={handleStartTour}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  Start Interactive Tour
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}