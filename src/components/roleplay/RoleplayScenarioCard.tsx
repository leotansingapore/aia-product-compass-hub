import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Users, TrendingUp, MessageSquare } from 'lucide-react';
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

interface RoleplayScenarioCardProps {
  scenario: RoleplayScenario;
  onStart: (scenario: RoleplayScenario) => void;
}

export function RoleplayScenarioCard({ scenario, onStart }: RoleplayScenarioCardProps) {
  const CategoryIcon = categoryIcons[scenario.category];
  
  return (
    <Card className="hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col group border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between mb-3">
          <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <CategoryIcon className="h-8 w-8 text-primary" />
          </div>
          <div className="flex gap-2">
            <Badge className={`${categoryColors[scenario.category]} transition-all text-xs px-2`}>
              {scenario.category}
            </Badge>
            <Badge className={`${difficultyColors[scenario.difficulty]} transition-all text-xs px-2`}>
              {scenario.difficulty}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors">{scenario.title}</CardTitle>
        <CardDescription className="line-clamp-2">{scenario.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col flex-1">
        <div className="flex-1" />

        <div className="space-y-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
            <strong>Duration:</strong> {scenario.duration}
          </div>

          <div>
            <h4 className="font-medium mb-2 text-sm">Learning Objectives:</h4>
            <ul className="text-sm space-y-1.5">
              {scenario.objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span className="flex-1">{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            className="w-full min-h-[44px] bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
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