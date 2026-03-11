import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Users, TrendingUp, MessageSquare, BookOpen, Briefcase, Target, Clock } from 'lucide-react';
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

export const RoleplayScenarioCard = memo(function RoleplayScenarioCard({ scenario, onStart }: RoleplayScenarioCardProps) {
  const CategoryIcon = scenarioIcons[scenario.id] || categoryIcons[scenario.category];
  
  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col group border-border/50">
      <CardContent className="p-3 sm:p-5 flex flex-col flex-1">
        {/* Top row: icon + title + badges */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-1.5 sm:p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
            <CategoryIcon className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-semibold group-hover:text-primary transition-colors leading-tight line-clamp-1">{scenario.title}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge className={`${categoryColors[scenario.category]} text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-4 sm:h-5 transition-none pointer-events-none`}>
                {scenario.category}
              </Badge>
              <Badge className={`${difficultyColors[scenario.difficulty]} text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-4 sm:h-5 transition-none pointer-events-none`}>
                {scenario.difficulty}
              </Badge>
              <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-0.5 ml-auto shrink-0">
                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                {scenario.duration}
              </span>
            </div>
          </div>
        </div>

        {/* Description — 1 line on mobile, 2 on desktop */}
        <p className="text-[11px] sm:text-xs text-muted-foreground mt-2 sm:mt-2.5 line-clamp-1 sm:line-clamp-2">{scenario.description}</p>

        {/* Objectives — hidden on mobile, shown on desktop */}
        <div className="hidden sm:block mt-3 pt-3 border-t border-border/50">
          <ul className="text-xs space-y-1">
            {scenario.objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-1.5">
                <span className="text-primary text-[10px] mt-0.5">✓</span>
                <span className="flex-1 text-muted-foreground">{objective}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1" />

        {/* CTA */}
        <Button
          className="w-full mt-2.5 sm:mt-4 min-h-[40px] sm:min-h-[44px] bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 text-xs sm:text-sm"
          onClick={() => onStart(scenario)}
        >
          <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
          Start Roleplay
        </Button>
      </CardContent>
    </Card>
  );
});
