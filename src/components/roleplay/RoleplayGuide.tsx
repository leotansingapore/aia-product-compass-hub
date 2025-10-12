import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export function RoleplayGuide() {
  return (
    <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Users className="h-6 w-6 text-primary" />
          How Roleplay Training Works
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <div className="text-center space-y-3 group">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
            <span className="text-primary-foreground font-bold text-lg">1</span>
          </div>
          <h3 className="font-semibold text-base">Choose Scenario</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Select a roleplay scenario that matches your learning goals
          </p>
        </div>
        <div className="text-center space-y-3 group">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
            <span className="text-primary-foreground font-bold text-lg">2</span>
          </div>
          <h3 className="font-semibold text-base">Practice with AI</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Engage in realistic conversations with AI video avatars
          </p>
        </div>
        <div className="text-center space-y-3 group">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
            <span className="text-primary-foreground font-bold text-lg">3</span>
          </div>
          <h3 className="font-semibold text-base">Get Feedback</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Receive AI-powered feedback to improve your performance
          </p>
        </div>
      </CardContent>
    </Card>
  );
}