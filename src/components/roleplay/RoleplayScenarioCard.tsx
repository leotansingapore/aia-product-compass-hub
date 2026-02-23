import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Users, TrendingUp, MessageSquare, BookOpen, Briefcase, Target } from 'lucide-react';
import type { RoleplayScenario } from '@/hooks/useRoleplay';

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

const scenarioIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'samantha-lee-v2': BookOpen,
  'rachel-ng': Users,
  'james-liew': Briefcase,
  'gabriel-ong': Target
};

interface RoleplayScenarioCardProps {
  scenario: RoleplayScenario;
  onStart: (scenario: RoleplayScenario) => void;
}

export function RoleplayScenarioCard({ scenario, onStart }: RoleplayScenarioCardProps) {
  const CategoryIcon = scenarioIcons[scenario.id] || categoryIcons[scenario.category];
  
  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col group border-border/50">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-start gap-3 mb-2 sm:mb-3">
          <div className="p-2 sm:p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 border-2 border-transparent group-hover:border-primary group-hover:scale-105 transition-all duration-200 shadow-md shrink-0">
            <CategoryIcon className="h-5 w-5 sm:h-8 sm:w-8 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors leading-tight">{scenario.title}</CardTitle>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <Badge className={`${categoryColors[scenario.category]} text-[10px] sm:text-xs px-1.5 sm:px-2 transition-none pointer-events-none`}>
                {scenario.category}
              </Badge>
              <Badge className={`${difficultyColors[scenario.difficulty]} text-[10px] sm:text-xs px-1.5 sm:px-2 transition-none pointer-events-none`}>
                {scenario.difficulty}
              </Badge>
            </div>
          </div>
        </div>
        <CardDescription className="line-clamp-2 text-xs sm:text-sm">{scenario.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="flex-1" />

        <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
            <strong>Duration:</strong> {scenario.duration}
          </div>

          <div>
            <h4 className="font-medium mb-1.5 sm:mb-2 text-xs sm:text-sm">Learning Objectives:</h4>
            <ul className="text-xs sm:text-sm space-y-1 sm:space-y-1.5">
              {scenario.objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-1.5 sm:gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span className="flex-1">{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            className="w-full min-h-[44px] bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 text-sm"
            onClick={() => onStart(scenario)}
          >
            <Play className="h-4 w-4 mr-2" />
            Start Roleplay
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}