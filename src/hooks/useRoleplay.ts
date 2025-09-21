import { useState } from 'react';

export interface RoleplayScenario {
  id: string;
  title: string;
  description: string;
  category: 'sales' | 'objection' | 'consultation' | 'exam-prep';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  objectives: string[];
  replicaId?: string;
  personaId?: string;
  personaDescription?: string;
}

const roleplayScenarios: RoleplayScenario[] = [
  {
    id: 'samantha-lee-v2',
    title: 'Investment Basics Consultation',
    description: 'Help Samantha, a marketing executive new to investing, understand fundamental concepts and overcome her hesitation about long-term commitments.',
    category: 'consultation',
    difficulty: 'beginner',
    duration: '15-20 min',
    replicaId: 'r9d30b0e55ac',
    personaId: 'p74cc7de032d',
    personaDescription: 'You are Samantha Lee, a 27-year-old marketing executive who wants to start investing but feels overwhelmed. You\'re unsure what \'risk appetite\' means and ask lots of basic questions. You\'re eager to learn but cautious about committing to long-term plans without full understanding. In all your responses, avoid sounding overly eager or excessively friendly. Keep your tone natural, professional, and grounded. Your answers should be succinct, authentic, and realistic, as if you\'re in a real conversation and your time matters, so dont be verbose.',
    objectives: [
      'Explain investment basics in simple terms',
      'Address concerns about risk and commitment',
      'Build confidence in investment decisions'
    ]
  },
  {
    id: 'rachel-ng',
    title: 'Family Financial Planning',
    description: 'Guide Rachel, a busy HR manager and mother, through investment options that align with her family\'s education and retirement goals.',
    category: 'consultation',
    difficulty: 'intermediate',
    duration: '20-25 min',
    replicaId: 'r9d30b0e55ac',
    personaId: 'p74cc7de032d',
    personaDescription: 'You are Rachel Ng, a 40-year-old HR manager and mother of two school-aged children. You\'re trying to balance family responsibilities, work stress, and financial planning. You\'re interested in investing—but only if it helps with your kids\' education or secures your retirement. You\'re emotionally motivated but dislike financial jargon or long explanations. In all your responses, avoid sounding overly eager or excessively friendly. Keep your tone natural, professional, and grounded. Your answers should be succinct, authentic, and realistic—as if you\'re a real person with limited time for fluff.',
    objectives: [
      'Focus on education and retirement planning',
      'Avoid jargon and keep explanations simple',
      'Address emotional concerns about family security'
    ]
  },
  {
    id: 'james-liew',
    title: 'High-Net-Worth Advisory',
    description: 'Advise James, a sophisticated business owner with significant assets, on wealth growth and legacy planning strategies.',
    category: 'consultation',
    difficulty: 'advanced',
    duration: '25-30 min',
    replicaId: 'r9d30b0e55ac',
    personaId: 'p74cc7de032d',
    personaDescription: 'You are James Liew, a 42-year-old business owner with over $500K in liquid assets. You\'re financially savvy, strategic, and value high-ROI, tax-efficient opportunities. You dislike generic sales pitches and expect advisors to speak your language. You think most insurance products are too basic and want sophisticated solutions for wealth growth and legacy planning. In all your responses, avoid sounding overly eager or excessively friendly. Keep your tone natural, professional, and grounded. Your answers should be succinct, authentic, and realistic—as if you\'re a real person with limited time for fluff.',
    objectives: [
      'Present sophisticated investment strategies',
      'Focus on tax efficiency and high ROI',
      'Avoid generic pitches and demonstrate expertise'
    ]
  },
  {
    id: 'gabriel-ong',
    title: 'Young Investor Guidance',
    description: 'Mentor Gabriel, a financially aware young adult, while earning his trust and addressing his concerns about being taken advantage of.',
    category: 'consultation',
    difficulty: 'intermediate',
    duration: '15-20 min',
    replicaId: 'r9d30b0e55ac',
    personaId: 'p74cc7de032d',
    personaDescription: 'You are Gabriel Ong, a 20-year-old NSF who follows finance TikToks and listens to podcast bros like Kelvin Learns Investing. You\'ve set savings goals and are using Excel to track expenses. You want to get a head start on life—maybe start investing early, maybe do part-time studies after NS. You ask smart questions but are still afraid of getting conned. Be logical and concise. You sound calm and focused, but always testing whether the advisor is genuine or just selling.',
    objectives: [
      'Build trust with a skeptical young investor',
      'Provide genuine value without overselling',
      'Address fears about financial scams'
    ]
  }
];

export function useRoleplay() {
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario | null>(null);

  const handleStartRoleplay = (scenario: RoleplayScenario) => {
    setSelectedScenario(scenario);
  };

  const handleBackToSelection = () => {
    setSelectedScenario(null);
  };

  return {
    scenarios: roleplayScenarios,
    selectedScenario,
    handleStartRoleplay,
    handleBackToSelection
  };
}