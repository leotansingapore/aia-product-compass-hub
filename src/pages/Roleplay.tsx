import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Users, TrendingUp, MessageSquare, ArrowLeft } from 'lucide-react';
import { TavusVideoChat } from '@/components/roleplay/TavusVideoChat';


interface RoleplayScenario {
  id: string;
  title: string;
  description: string;
  category: 'sales' | 'objection' | 'consultation' | 'exam-prep';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  objectives: string[];
  replicaId?: string; // Optional Tavus replica ID for specific avatar appearance
  personaId?: string; // Optional Tavus persona ID for specific personality/behavior
  personaDescription?: string; // Description of the AI persona
}

const roleplayScenarios: RoleplayScenario[] = [
  {
    id: 'samantha-lee',
    title: 'Investment Basics Consultation',
    description: 'Help Samantha, a marketing executive new to investing, understand fundamental concepts and overcome her hesitation about long-term commitments.',
    category: 'consultation',
    difficulty: 'beginner',
    duration: '15-20 min',
    replicaId: 're0eae1fbe11',
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
    replicaId: 're0eae1fbe11',
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
    replicaId: 'rca8a38779a8',
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
    replicaId: 'rca8a38779a8',
    personaDescription: 'You are Gabriel Ong, a 20-year-old NSF who follows finance TikToks and listens to podcast bros like Kelvin Learns Investing. You\'ve set savings goals and are using Excel to track expenses. You want to get a head start on life—maybe start investing early, maybe do part-time studies after NS. You ask smart questions but are still afraid of getting conned. Be logical and concise. You sound calm and focused, but always testing whether the advisor is genuine or just selling.',
    objectives: [
      'Build trust with a skeptical young investor',
      'Provide genuine value without overselling',
      'Address fears about financial scams'
    ]
  }
];

const categoryColors = {
  sales: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  objection: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  consultation: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'exam-prep': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
};

const difficultyColors = {
  beginner: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  advanced: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
};

const categoryIcons = {
  sales: TrendingUp,
  objection: MessageSquare,
  consultation: Users,
  'exam-prep': Play
};

export default function Roleplay() {
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario | null>(null);

  const handleStartRoleplay = (scenario: RoleplayScenario) => {
    setSelectedScenario(scenario);
  };

  const handleBackToSelection = () => {
    setSelectedScenario(null);
  };

  if (selectedScenario) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Helmet>
          <title>Roleplay - {selectedScenario.title}</title>
          <meta name="description" content={selectedScenario.description} />
          <link rel="canonical" href={`${window.location.origin}/roleplay`} />
        </Helmet>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleBackToSelection}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Scenarios
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{selectedScenario.title}</h1>
            <p className="text-muted-foreground">{selectedScenario.description}</p>
          </div>
        </div>
        
        <TavusVideoChat scenario={selectedScenario} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-1 sm:px-4 md:px-6 py-2 sm:py-6 space-y-3 sm:space-y-6">
      <Helmet>
        <title>AI Roleplay Training - FINternship</title>
        <meta name="description" content="Practice sales, objection handling, and consultation skills with AI video avatars." />
        <link rel="canonical" href={`${window.location.origin}/roleplay`} />
      </Helmet>
      <div className="text-center space-y-3 sm:space-y-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">AI Roleplay Training</h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Practice your sales skills, objection handling, and client consultation with AI-powered video avatars
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {roleplayScenarios.map((scenario) => {
          const CategoryIcon = categoryIcons[scenario.category];
          
          return (
            <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CategoryIcon className="h-8 w-8 text-primary" />
                  <div className="flex gap-2">
                    <Badge className={categoryColors[scenario.category]}>
                      {scenario.category}
                    </Badge>
                    <Badge className={difficultyColors[scenario.difficulty]}>
                      {scenario.difficulty}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg">{scenario.title}</CardTitle>
                <CardDescription>{scenario.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <strong>Duration:</strong> {scenario.duration}
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Learning Objectives:</h4>
                  <ul className="text-sm space-y-1">
                    {scenario.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  className="w-full min-h-[44px]"
                  onClick={() => handleStartRoleplay(scenario)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Roleplay
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            How Roleplay Training Works
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
              <span className="text-primary-foreground font-bold">1</span>
            </div>
            <h3 className="font-medium">Choose Scenario</h3>
            <p className="text-sm text-muted-foreground">
              Select a roleplay scenario that matches your learning goals
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
              <span className="text-primary-foreground font-bold">2</span>
            </div>
            <h3 className="font-medium">Practice with AI</h3>
            <p className="text-sm text-muted-foreground">
              Engage in realistic conversations with AI video avatars
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
              <span className="text-primary-foreground font-bold">3</span>
            </div>
            <h3 className="font-medium">Get Feedback</h3>
            <p className="text-sm text-muted-foreground">
              Receive AI-powered feedback to improve your performance
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}