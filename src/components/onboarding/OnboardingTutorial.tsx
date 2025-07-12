import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOnboarding } from '@/hooks/useOnboarding';
import { X, ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react';

interface HighlightOverlayProps {
  target: string;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  step: any;
  currentStep: number;
  totalSteps: number;
}

function HighlightOverlay({ target, onNext, onPrev, onSkip, step, currentStep, totalSteps }: HighlightOverlayProps) {
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [highlightStyle, setHighlightStyle] = useState<any>({});
  const [tooltipStyle, setTooltipStyle] = useState<any>({});

  useEffect(() => {
    const element = document.querySelector(target);
    setTargetElement(element);

    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = 8;
      
      // Highlight style
      setHighlightStyle({
        position: 'fixed',
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + (padding * 2),
        height: rect.height + (padding * 2),
        zIndex: 9999,
        borderRadius: '8px',
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(var(--primary), 0.5)',
        border: '2px solid hsl(var(--primary))',
        pointerEvents: 'none',
      });

      // Tooltip position
      const tooltipPosition = getTooltipPosition(rect, step.position);
      setTooltipStyle({
        position: 'fixed',
        ...tooltipPosition,
        zIndex: 10000,
      });

      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [target, step.position]);

  const getTooltipPosition = (rect: DOMRect, position: string = 'bottom') => {
    const tooltipWidth = 350;
    const tooltipHeight = 200;
    const offset = 20;

    switch (position) {
      case 'top':
        return {
          top: rect.top - tooltipHeight - offset,
          left: rect.left + (rect.width / 2) - (tooltipWidth / 2),
        };
      case 'bottom':
        return {
          top: rect.bottom + offset,
          left: rect.left + (rect.width / 2) - (tooltipWidth / 2),
        };
      case 'left':
        return {
          top: rect.top + (rect.height / 2) - (tooltipHeight / 2),
          left: rect.left - tooltipWidth - offset,
        };
      case 'right':
        return {
          top: rect.top + (rect.height / 2) - (tooltipHeight / 2),
          left: rect.right + offset,
        };
      default:
        return {
          top: rect.bottom + offset,
          left: rect.left + (rect.width / 2) - (tooltipWidth / 2),
        };
    }
  };

  if (!targetElement) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9998]">
      {/* Highlight box */}
      <div style={highlightStyle} className="animate-pulse" />
      
      {/* Tooltip */}
      <Card style={tooltipStyle} className="w-[350px] shadow-elegant border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              Step {currentStep + 1} of {totalSteps}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            {step.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4 text-sm leading-relaxed">
            {step.description}
          </CardDescription>
          
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
              <Button size="sm" onClick={onNext} className="text-xs">
                {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
                <ArrowRight className="w-3 h-3 ml-1" />
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

  if (!isOnboardingActive || !steps[currentStep]) return null;

  const step = steps[currentStep];

  // Skip steps that don't have a target (like the welcome step)
  if (!step.target) {
    setTimeout(nextStep, 100);
    return null;
  }

  return (
    <HighlightOverlay
      target={step.target}
      onNext={nextStep}
      onPrev={prevStep}
      onSkip={skipOnboarding}
      step={step}
      currentStep={currentStep}
      totalSteps={totalSteps}
    />
  );
}