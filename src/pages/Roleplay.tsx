import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Users, TrendingUp, MessageSquare, ArrowLeft } from 'lucide-react';
import { TavusVideoChat } from '@/components/roleplay/TavusVideoChat';
import { ProtectedPage } from '@/components/ProtectedPage';

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
    id: 'sales-pitch-basic',
    title: 'Product Presentation - Life Insurance',
    description: 'Practice presenting AIA life insurance products to potential clients',
    category: 'sales',
    difficulty: 'beginner',
    duration: '10-15 min',
    replicaId: 'your-sales-trainer-replica-id', // Replace with your actual replica ID
    personaId: 'your-sales-trainer-persona-id', // Replace with your actual persona ID
    personaDescription: 'Professional sales trainer persona',
    objectives: [
      'Present product features clearly',
      'Handle basic questions',
      'Close the conversation positively'
    ]
  },
  {
    id: 'objection-handling-price',
    title: 'Price Objection Handling',
    description: 'Learn to address common price-related objections from clients',
    category: 'objection',
    difficulty: 'intermediate',
    duration: '15-20 min',
    replicaId: 'your-objection-trainer-replica-id', // Replace with your actual replica ID
    personaId: 'your-objection-trainer-persona-id', // Replace with your actual persona ID
    personaDescription: 'Challenging client persona for objection training',
    objectives: [
      'Listen actively to objections',
      'Provide value-based responses',
      'Redirect to benefits'
    ]
  },
  {
    id: 'consultation-needs-analysis',
    title: 'Client Needs Analysis',
    description: 'Conduct a comprehensive financial needs assessment',
    category: 'consultation',
    difficulty: 'advanced',
    duration: '20-30 min',
    replicaId: 'your-consultation-client-replica-id', // Replace with your actual replica ID
    personaId: 'your-consultation-client-persona-id', // Replace with your actual persona ID
    personaDescription: 'Realistic client persona for consultation practice',
    objectives: [
      'Ask probing questions',
      'Identify client pain points',
      'Recommend suitable solutions'
    ]
  },
  {
    id: 'cmfas-explanation',
    title: 'CMFAS Concept Explanation',
    description: 'Practice explaining complex financial concepts clearly',
    category: 'exam-prep',
    difficulty: 'intermediate',
    duration: '10-15 min',
    replicaId: 'your-exam-tutor-replica-id', // Replace with your actual replica ID
    personaId: 'your-exam-tutor-persona-id', // Replace with your actual persona ID
    personaDescription: 'CMFAS exam tutor persona',
    objectives: [
      'Explain concepts simply',
      'Use relevant examples',
      'Ensure understanding'
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
      <ProtectedPage pageId="roleplay">
        <div className="container mx-auto p-6 space-y-6">
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
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage pageId="roleplay">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">AI Roleplay Training</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Practice your sales skills, objection handling, and client consultation with AI-powered video avatars
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className="w-full"
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
          <CardContent className="grid md:grid-cols-3 gap-6">
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
    </ProtectedPage>
  );
}