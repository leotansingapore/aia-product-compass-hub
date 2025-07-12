import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
  completed: boolean;
}

interface OnboardingContextType {
  isOnboardingActive: boolean;
  currentStep: number;
  totalSteps: number;
  steps: OnboardingStep[];
  startOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipOnboarding: () => void;
  completeStep: (stepId: string) => void;
  isStepCompleted: (stepId: string) => boolean;
  getProgress: () => number;
  showWelcome: boolean;
  dismissWelcome: () => void;
}

const OnboardingContext = createContext<OnboardingContextType>({
  isOnboardingActive: false,
  currentStep: 0,
  totalSteps: 0,
  steps: [],
  startOnboarding: () => {},
  nextStep: () => {},
  prevStep: () => {},
  skipOnboarding: () => {},
  completeStep: () => {},
  isStepCompleted: () => false,
  getProgress: () => 0,
  showWelcome: false,
  dismissWelcome: () => {},
});

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to AIA Learning Platform!',
    description: 'Let\'s take a quick tour to help you get started with your learning journey.',
    completed: false,
  },
  {
    id: 'search',
    title: 'Powerful Search',
    description: 'Use our enhanced search to quickly find products, documents, and learning materials.',
    target: '[data-onboarding="search"]',
    position: 'bottom',
    completed: false,
  },
  {
    id: 'categories',
    title: 'Product Categories',
    description: 'Browse products organized by type: Investment, Endowment, Whole Life, Term, and Medical Insurance.',
    target: '[data-onboarding="categories"]',
    position: 'top',
    completed: false,
  },
  {
    id: 'profile-search',
    title: 'Client Profile Search',
    description: 'Find products based on client demographics and life stages for better recommendations.',
    target: '[data-onboarding="profile-search"]',
    position: 'left',
    completed: false,
  },
  {
    id: 'sidebar',
    title: 'Navigation Sidebar',
    description: 'Access all features through our collapsible sidebar. You can toggle it anytime.',
    target: '[data-onboarding="sidebar-trigger"]',
    position: 'right',
    completed: false,
  },
  {
    id: 'bookmarks',
    title: 'Bookmark Content',
    description: 'Save important products and resources for quick access later.',
    target: '[data-onboarding="bookmarks"]',
    position: 'bottom',
    completed: false,
  },
];

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>(ONBOARDING_STEPS);
  const [showWelcome, setShowWelcome] = useState(false);

  // Check if user should see onboarding - simplified
  useEffect(() => {
    if (user) {
      const hasSeenWelcome = localStorage.getItem(`welcome-seen-${user.id}`);
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    }
  }, [user]);

  // Simplified progress saving
  useEffect(() => {
    if (user) {
      localStorage.setItem(`onboarding-progress-${user.id}`, JSON.stringify(steps.map(s => s.completed)));
    }
  }, [steps, user]);

  const startOnboarding = () => {
    setIsOnboardingActive(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  const completeOnboarding = () => {
    setIsOnboardingActive(false);
    if (user) {
      localStorage.setItem(`onboarding-completed-${user.id}`, 'true');
    }
  };

  const completeStep = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
  };

  const isStepCompleted = (stepId: string) => {
    return steps.find(step => step.id === stepId)?.completed || false;
  };

  const getProgress = () => {
    const completedSteps = steps.filter(step => step.completed).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  const dismissWelcome = () => {
    setShowWelcome(false);
    if (user) {
      localStorage.setItem(`welcome-seen-${user.id}`, 'true');
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingActive,
        currentStep,
        totalSteps: steps.length,
        steps,
        startOnboarding,
        nextStep,
        prevStep,
        skipOnboarding,
        completeStep,
        isStepCompleted,
        getProgress,
        showWelcome,
        dismissWelcome,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};