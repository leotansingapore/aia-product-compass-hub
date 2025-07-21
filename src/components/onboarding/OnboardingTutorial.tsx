
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/hooks/useOnboarding';
import { X, ArrowRight, ArrowLeft, Lightbulb, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';

interface HighlightOverlayProps {
  target: string;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onPause: () => void;
  step: any;
  currentStep: number;
  totalSteps: number;
  isPaused: boolean;
}

function HighlightOverlay({ 
  target, 
  onNext, 
  onPrev, 
  onSkip, 
  onPause, 
  step, 
  currentStep, 
  totalSteps, 
  isPaused 
}: HighlightOverlayProps) {
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [highlightStyle, setHighlightStyle] = useState<any>({});
  const [tooltipStyle, setTooltipStyle] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Add delay to allow for smooth entrance animation
    const timer = setTimeout(() => {
      const element = document.querySelector(target);
      setTargetElement(element);

      if (element) {
        const rect = element.getBoundingClientRect();
        const padding = 12;
        
        // Enhanced highlight style with glow effect
        setHighlightStyle({
          position: 'fixed',
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + (padding * 2),
          height: rect.height + (padding * 2),
          zIndex: 9999,
          borderRadius: '12px',
          boxShadow: `
            0 0 0 9999px rgba(0, 0, 0, 0.6),
            0 0 20px 4px hsl(var(--primary) / 0.6),
            inset 0 0 0 3px hsl(var(--primary)),
            0 0 40px 8px hsl(var(--primary) / 0.3)
          `,
          border: '2px solid hsl(var(--primary))',
          pointerEvents: 'none',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        });

        // Smart tooltip positioning
        const tooltipPosition = getSmartTooltipPosition(rect, step.position);
        setTooltipStyle({
          position: 'fixed',
          ...tooltipPosition,
          zIndex: 10000,
          transition: 'all 0.3s ease-out',
        });

        // Smooth scroll to element
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });

        // Add pulsing effect to the target element
        element.classList.add('onboarding-pulse');
        setIsVisible(true);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      // Clean up pulse effect
      const element = document.querySelector(target);
      if (element) {
        element.classList.remove('onboarding-pulse');
      }
    };
  }, [target, step.position]);

  const getSmartTooltipPosition = (rect: DOMRect, position: string = 'bottom') => {
    const tooltipWidth = 380;
    const tooltipHeight = 240;
    const offset = 24;
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let finalPosition = { top: 0, left: 0 };

    switch (position) {
      case 'top':
        finalPosition = {
          top: rect.top - tooltipHeight - offset,
          left: rect.left + (rect.width / 2) - (tooltipWidth / 2),
        };
        break;
      case 'bottom':
        finalPosition = {
          top: rect.bottom + offset,
          left: rect.left + (rect.width / 2) - (tooltipWidth / 2),
        };
        break;
      case 'left':
        finalPosition = {
          top: rect.top + (rect.height / 2) - (tooltipHeight / 2),
          left: rect.left - tooltipWidth - offset,
        };
        break;
      case 'right':
        finalPosition = {
          top: rect.top + (rect.height / 2) - (tooltipHeight / 2),
          left: rect.right + offset,
        };
        break;
      default:
        finalPosition = {
          top: rect.bottom + offset,
          left: rect.left + (rect.width / 2) - (tooltipWidth / 2),
        };
    }

    // Viewport boundary checks and adjustments
    if (finalPosition.left < 16) {
      finalPosition.left = 16;
    } else if (finalPosition.left + tooltipWidth > viewport.width - 16) {
      finalPosition.left = viewport.width - tooltipWidth - 16;
    }

    if (finalPosition.top < 16) {
      finalPosition.top = rect.bottom + offset;
    } else if (finalPosition.top + tooltipHeight > viewport.height - 16) {
      finalPosition.top = rect.top - tooltipHeight - offset;
    }

    return finalPosition;
  };

  if (!targetElement) return null;

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return createPortal(
    <div className="fixed inset-0 z-[9998]">
      {/* Enhanced highlight box with animation */}
      <div 
        style={highlightStyle} 
        className={`animate-in fade-in-0 duration-500 ${isVisible ? 'onboarding-highlight-pulse' : ''}`}
      />
      
      {/* Enhanced tooltip */}
      <Card 
        style={tooltipStyle} 
        className={`w-[380px] shadow-elegant border-primary/20 animate-in slide-in-from-bottom-4 duration-300 ${
          isVisible ? 'scale-in' : ''
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-medium">
                Step {currentStep + 1} of {totalSteps}
              </Badge>
              {isPaused && (
                <Badge variant="secondary" className="text-xs">
                  <Pause className="w-3 h-3 mr-1" />
                  Paused
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={onPause}>
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={onSkip}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{Math.round(progress)}% complete</span>
              <span>{totalSteps - currentStep - 1} steps remaining</span>
            </div>
          </div>

          <CardTitle className="text-lg flex items-center gap-2 mt-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-primary" />
            </div>
            {step.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-6 text-sm leading-relaxed">
            {step.description}
          </CardDescription>

          {/* Interactive action hint */}
          {step.action && (
            <div className="mb-4 p-3 rounded-lg bg-accent/30 border border-accent/50">
              <p className="text-xs font-medium text-accent-foreground">
                💡 Try it: {step.actionHint || "Interact with the highlighted element"}
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrev}
              disabled={currentStep === 0}
              className="text-xs"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onSkip} className="text-xs">
                Skip Tour
              </Button>
              <Button 
                size="sm" 
                onClick={onNext} 
                className="text-xs bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {currentStep === totalSteps - 1 ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>,
    document.body
  );
}

export function OnboardingTutorial() {
  const {
    isOnboardingActive,
    currentStep,
    totalSteps,
    steps,
    nextStep,
    prevStep,
    skipOnboarding,
  } = useOnboarding();

  const [isPaused, setIsPaused] = useState(false);

  // Add CSS for enhanced animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .onboarding-highlight-pulse {
        animation: onboarding-pulse 2s ease-in-out infinite;
      }
      
      .onboarding-pulse {
        animation: onboarding-element-pulse 2s ease-in-out infinite;
      }
      
      @keyframes onboarding-pulse {
        0%, 100% { 
          box-shadow: 
            0 0 0 9999px rgba(0, 0, 0, 0.6),
            0 0 20px 4px hsl(var(--primary) / 0.6),
            inset 0 0 0 3px hsl(var(--primary)),
            0 0 40px 8px hsl(var(--primary) / 0.3);
        }
        50% { 
          box-shadow: 
            0 0 0 9999px rgba(0, 0, 0, 0.6),
            0 0 30px 6px hsl(var(--primary) / 0.8),
            inset 0 0 0 3px hsl(var(--primary)),
            0 0 60px 12px hsl(var(--primary) / 0.5);
        }
      }
      
      @keyframes onboarding-element-pulse {
        0%, 100% { 
          transform: scale(1);
          filter: brightness(1);
        }
        50% { 
          transform: scale(1.02);
          filter: brightness(1.1);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
      // Clean up any remaining pulse classes
      document.querySelectorAll('.onboarding-pulse').forEach(el => {
        el.classList.remove('onboarding-pulse');
      });
    };
  }, []);

  if (!isOnboardingActive || !steps[currentStep]) return null;

  const step = steps[currentStep];

  // Enhanced step handling for non-targeted steps
  if (!step.target) {
    setTimeout(() => {
      if (!isPaused) {
        nextStep();
      }
    }, 100);
    return null;
  }

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <HighlightOverlay
      target={step.target}
      onNext={nextStep}
      onPrev={prevStep}
      onSkip={skipOnboarding}
      onPause={handlePause}
      step={step}
      currentStep={currentStep}
      totalSteps={totalSteps}
      isPaused={isPaused}
    />
  );
}
