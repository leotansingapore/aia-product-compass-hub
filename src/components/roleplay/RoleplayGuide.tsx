import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export function RoleplayGuide() {
  return (
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
  );
}