import type { TrainingVideo } from '@/hooks/useProducts';

export interface CMFASModuleData {
  id: string;
  title: string;
  videos: TrainingVideo[];
}

export const cmfasModuleVideos: Record<string, TrainingVideo[]> = {
  'onboarding': [
    {
      id: 'onboarding-intro',
      title: 'CMFAS Onboarding Overview',
      description: 'Complete guide to getting started with CMFAS exams',
      url: '/lectures/onboarding-intro.mp4',
      duration: 1200,
      order: 0,
      category: 'Getting Started'
    },
    {
      id: 'onboarding-account-setup',
      title: 'Student Account Creation',
      description: 'Step-by-step guide to create your student account',
      url: '/lectures/onboarding-account-setup.mp4',
      duration: 900,
      order: 1,
      category: 'Setup'
    },
    {
      id: 'onboarding-exam-registration',
      title: 'Exam Registration Process',
      description: 'How to register for your first CMFAS exam',
      url: '/lectures/onboarding-exam-registration.mp4',
      duration: 1500,
      order: 2,
      category: 'Setup'
    },
    {
      id: 'onboarding-question-bank',
      title: 'Accessing Question Bank',
      description: 'Complete guide to accessing and using the question bank',
      url: '/lectures/onboarding-question-bank.mp4',
      duration: 1800,
      order: 3,
      category: 'Study Tools'
    },
    {
      id: 'onboarding-study-strategy',
      title: 'Effective Study Strategy',
      description: 'Proven strategies for CMFAS exam success',
      url: '/lectures/onboarding-study-strategy.mp4',
      duration: 2100,
      order: 4,
      category: 'Study Strategy'
    }
  ],
  'm9': [
    {
      id: 'm9-intro',
      title: 'M9 Introduction & Overview',
      description: 'Introduction to life insurance and exam structure',
      url: '/lectures/m9-intro.mp4',
      duration: 1800,
      order: 0,
      category: 'Introduction'
    },
    {
      id: 'm9-risk-insurance',
      title: 'Risk and Life Insurance',
      description: 'Understanding risk concepts and life insurance fundamentals',
      url: '/lectures/m9-risk-insurance.mp4',
      duration: 2400,
      order: 1,
      category: 'Core Concepts'
    },
    {
      id: 'm9-premium-setting',
      title: 'Setting Life Insurance Premium',
      description: 'Premium calculation methods and factors',
      url: '/lectures/m9-premium-setting.mp4',
      duration: 2100,
      order: 2,
      category: 'Core Concepts'
    },
    {
      id: 'm9-traditional-products',
      title: 'Traditional Life Insurance Products',
      description: 'Overview of traditional life insurance products',
      url: '/lectures/m9-traditional-products.mp4',
      duration: 2700,
      order: 3,
      category: 'Products'
    },
    {
      id: 'm9-investment-linked',
      title: 'Investment-Linked Policies',
      description: 'Understanding ILPs and their features',
      url: '/lectures/m9-investment-linked.mp4',
      duration: 3000,
      order: 4,
      category: 'Products'
    }
  ],
  'm9a': [],
  'hi': [],
  'res5': []
};

export const getCMFASModuleVideos = (moduleId: string): TrainingVideo[] => {
  const videos = cmfasModuleVideos[moduleId.toLowerCase()] || [];
  return videos.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

export const getCMFASModuleName = (moduleId: string): string => {
  const moduleNames: Record<string, string> = {
    'onboarding': 'CMFAS Onboarding',
    'm9': 'M9 - Life Insurance',
    'm9a': 'M9A - Life Insurance (Comprehensive)',
    'hi': 'HI - Health Insurance',
    'res5': 'RES5 - Regulatory Framework'
  };
  return moduleNames[moduleId.toLowerCase()] || 'CMFAS Module';
};

export const isCMFASModule = (moduleId: string): boolean => {
  return ['onboarding', 'm9', 'm9a', 'hi', 'res5'].includes(moduleId.toLowerCase());
};

// Map moduleId (from URL) to productId (in database)
export const moduleIdToProductId: Record<string, string> = {
  'onboarding': 'onboarding',
  'm9': 'm9-module',
  'm9a': 'm9a-module',
  'hi': 'hi-module',
  'res5': 'res5-module'
};

export const getProductIdFromModuleId = (moduleId: string): string | undefined => {
  return moduleIdToProductId[moduleId.toLowerCase()];
};
