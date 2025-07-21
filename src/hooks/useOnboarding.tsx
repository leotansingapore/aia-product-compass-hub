
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
  actionHint?: string;
  completed: boolean;
  optional?: boolean;
  condition?: () => boolean; // For conditional steps
  celebrationMessage?: string;
}

interface OnboardingContextType {
  isOnboardingActive: boolean;
  currentStep: number;
  totalSteps: number;
  steps: OnboardingStep[];
  startOnboarding: (tourType?: 'basic' | 'advanced' | 'admin') => void;
  nextStep: () => void;
  prevStep: () => void;
  skipStep: () => void;
  skipOnboarding: () => void;
  completeStep: (stepId: string) => void;
  isStepCompleted: (stepId: string) => boolean;
  getProgress: () => number;
  showWelcome: boolean;
  dismissWelcome: () => void;
  canResumeTour: boolean;
  resumeTour: () => void;
  resetTour: () => void;
  tourType: string;
  completedStepsCount: number;
}

const OnboardingContext = createContext<OnboardingContextType>({
  isOnboardingActive: false,
  currentStep: 0,
  totalSteps: 0,
  steps: [],
  startOnboarding: () => {},
  nextStep: () => {},
  prevStep: () => {},
  skipStep: () => {},
  skipOnboarding: () => {},
  completeStep: () => {},
  isStepCompleted: () => false,
  getProgress: () => 0,
  showWelcome: false,
  dismissWelcome: () => {},
  canResumeTour: false,
  resumeTour: () => {},
  resetTour: () => {},
  tourType: 'basic',
  completedStepsCount: 0,
});

// Enhanced onboarding steps with branching logic
const BASIC_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to AIA Learning Platform! 🎉',
    description: 'Let\'s take a quick tour to help you get started with your learning journey.',
    completed: false,
    celebrationMessage: 'Great! Let\'s explore the platform together.',
  },
  {
    id: 'search',
    title: 'Powerful Search 🔍',
    description: 'Use our enhanced search to quickly find products, documents, and learning materials. Try typing a product name!',
    target: '[data-onboarding="search"]',
    position: 'bottom',
    completed: false,
    actionHint: 'Click on the search bar and try searching for something',
  },
  {
    id: 'categories',
    title: 'Product Categories 📂',
    description: 'Browse products organized by type: Investment, Endowment, Whole Life, Term, and Medical Insurance.',
    target: '[data-onboarding="categories"]',
    position: 'top',
    completed: false,
    actionHint: 'Click on any category to explore products',
  },
  {
    id: 'profile-search',
    title: 'Client Profile Search 👥',
    description: 'Find products based on client demographics and life stages for better recommendations.',
    target: '[data-onboarding="profile-search"]',
    position: 'left',
    completed: false,
    actionHint: 'Try the "Search by Client Profile" feature',
  },
  {
    id: 'sidebar',
    title: 'Navigation Sidebar 📱',
    description: 'Access all features through our collapsible sidebar. You can toggle it anytime for a cleaner view.',
    target: '[data-onboarding="sidebar-trigger"]',
    position: 'right',
    completed: false,
    actionHint: 'Click the menu button to open/close the sidebar',
  },
  {
    id: 'bookmarks',
    title: 'Bookmark Content ⭐',
    description: 'Save important products and resources for quick access later. Your bookmarks sync across devices!',
    target: '[data-onboarding="bookmarks"]',
    position: 'bottom',
    completed: false,
    optional: true,
    actionHint: 'Look for the bookmark icon on any product page',
  },
];

const ADVANCED_ONBOARDING_STEPS: OnboardingStep[] = [
  ...BASIC_ONBOARDING_STEPS,
  {
    id: 'ai-assistant',
    title: 'AI Assistant 🤖',
    description: 'Get instant answers and personalized recommendations from our AI-powered assistant.',
    target: '[data-onboarding="ai-assistant"]',
    position: 'left',
    completed: false,
    actionHint: 'Click to start a conversation with the AI',
  },
  {
    id: 'analytics',
    title: 'Learning Analytics 📊',
    description: 'Track your progress, completion rates, and identify areas for improvement.',
    target: '[data-onboarding="analytics"]',
    position: 'bottom',
    completed: false,
    optional: true,
  },
];

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Use a state to track location instead of directly calling useLocation
  const [currentPath, setCurrentPath] = useState('/');
  
  // Try to get location safely
  useEffect(() => {
    try {
      // We'll set this from inside a router context when available
      setCurrentPath(window.location.pathname);
    } catch {
      setCurrentPath('/');
    }
  }, []);
  
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>(BASIC_ONBOARDING_STEPS);
  const [showWelcome, setShowWelcome] = useState(false);
  const [tourType, setTourType] = useState<'basic' | 'advanced' | 'admin'>('basic');
  const [completedStepsCount, setCompletedStepsCount] = useState(0);

  // Enhanced welcome logic with personalization
  useEffect(() => {
    if (user && currentPath === '/') {
      const hasSeenWelcome = localStorage.getItem(`welcome-seen-${user.id}`);
      const lastTourVersion = localStorage.getItem(`tour-version-${user.id}`);
      const currentTourVersion = '2.0'; // Increment when tour changes significantly
      
      if (!hasSeenWelcome || lastTourVersion !== currentTourVersion) {
        setShowWelcome(true);
      }
    }
  }, [user, currentPath]);

  // Load saved progress
  useEffect(() => {
    if (user) {
      const savedProgress = localStorage.getItem(`onboarding-progress-${user.id}`);
      const savedStep = localStorage.getItem(`onboarding-current-step-${user.id}`);
      const savedTourType = localStorage.getItem(`onboarding-tour-type-${user.id}`) as 'basic' | 'advanced' | 'admin';
      
      if (savedProgress) {
        try {
          const progressArray = JSON.parse(savedProgress);
          setSteps(prev => prev.map((step, index) => ({
            ...step,
            completed: progressArray[index] || false
          })));
          
          const completed = progressArray.filter(Boolean).length;
          setCompletedStepsCount(completed);
        } catch (error) {
          console.error('Error loading onboarding progress:', error);
        }
      }
      
      if (savedStep) {
        setCurrentStep(parseInt(savedStep, 10));
      }
      
      if (savedTourType) {
        setTourType(savedTourType);
        const stepSet = savedTourType === 'advanced' ? ADVANCED_ONBOARDING_STEPS : BASIC_ONBOARDING_STEPS;
        setSteps(stepSet);
      }
    }
  }, [user]);

  // Save progress automatically
  useEffect(() => {
    if (user && steps.length > 0) {
      const progressArray = steps.map(s => s.completed);
      localStorage.setItem(`onboarding-progress-${user.id}`, JSON.stringify(progressArray));
      localStorage.setItem(`onboarding-current-step-${user.id}`, currentStep.toString());
      localStorage.setItem(`onboarding-tour-type-${user.id}`, tourType);
      
      const completed = progressArray.filter(Boolean).length;
      setCompletedStepsCount(completed);
    }
  }, [steps, currentStep, user, tourType]);

  const startOnboarding = (selectedTourType: 'basic' | 'advanced' | 'admin' = 'basic') => {
    setTourType(selectedTourType);
    const stepSet = selectedTourType === 'advanced' ? ADVANCED_ONBOARDING_STEPS : BASIC_ONBOARDING_STEPS;
    setSteps(stepSet);
    setIsOnboardingActive(true);
    setCurrentStep(0);
    
    // Add tour start event
    if (user) {
      localStorage.setItem(`tour-started-${user.id}`, new Date().toISOString());
    }
  };

  const nextStep = () => {
    // Mark current step as completed
    if (currentStep < steps.length) {
      completeStep(steps[currentStep].id);
    }

    // Find next valid step (skip conditional steps that don't meet requirements)
    let nextStepIndex = currentStep + 1;
    while (nextStepIndex < steps.length) {
      const nextStep = steps[nextStepIndex];
      if (!nextStep.condition || nextStep.condition()) {
        break;
      }
      nextStepIndex++;
    }

    if (nextStepIndex < steps.length) {
      setCurrentStep(nextStepIndex);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipStep = () => {
    nextStep(); // Same as next, but could add analytics tracking
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  const completeOnboarding = () => {
    setIsOnboardingActive(false);
    if (user) {
      localStorage.setItem(`onboarding-completed-${user.id}`, 'true');
      localStorage.setItem(`tour-completed-${user.id}`, new Date().toISOString());
      localStorage.setItem(`tour-version-${user.id}`, '2.0');
      
      // Show completion celebration
      setTimeout(() => {
        // Could trigger a completion toast or modal here
        console.log('🎉 Onboarding completed!');
      }, 500);
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
      localStorage.setItem(`tour-version-${user.id}`, '2.0');
    }
  };

  const canResumeTour = () => {
    if (!user) return false;
    const hasStarted = localStorage.getItem(`tour-started-${user.id}`);
    const hasCompleted = localStorage.getItem(`onboarding-completed-${user.id}`);
    return hasStarted && !hasCompleted && completedStepsCount > 0 && completedStepsCount < steps.length;
  };

  const resumeTour = () => {
    if (canResumeTour()) {
      setIsOnboardingActive(true);
    }
  };

  const resetTour = () => {
    if (user) {
      localStorage.removeItem(`onboarding-progress-${user.id}`);
      localStorage.removeItem(`onboarding-current-step-${user.id}`);
      localStorage.removeItem(`onboarding-completed-${user.id}`);
      localStorage.removeItem(`tour-started-${user.id}`);
      localStorage.removeItem(`tour-completed-${user.id}`);
    }
    
    setSteps(prev => prev.map(step => ({ ...step, completed: false })));
    setCurrentStep(0);
    setCompletedStepsCount(0);
    setIsOnboardingActive(false);
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
        skipStep,
        skipOnboarding,
        completeStep,
        isStepCompleted,
        getProgress,
        showWelcome,
        dismissWelcome,
        canResumeTour: canResumeTour(),
        resumeTour,
        resetTour,
        tourType,
        completedStepsCount,
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
