import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export function RoleplayGuide() {
  return (
    <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-border/50">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
          <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          How Roleplay Training Works
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 md:grid-cols-3 gap-3 sm:gap-6 md:gap-8 p-4 pt-0 sm:p-6 sm:pt-0">
        {[
          { step: "1", title: "Choose Scenario", desc: "Select a roleplay scenario that matches your learning goals" },
          { step: "2", title: "Practice with AI", desc: "Engage in realistic conversations with AI video avatars" },
          { step: "3", title: "Get Feedback", desc: "Receive AI-powered feedback to improve your performance" },
        ].map((item) => (
          <div key={item.step} className="text-center space-y-2 sm:space-y-3 group">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              <span className="text-primary-foreground font-bold text-sm sm:text-lg">{item.step}</span>
            </div>
            <h3 className="font-semibold text-xs sm:text-base">{item.title}</h3>
            <p className="text-[10px] sm:text-sm text-muted-foreground leading-relaxed hidden sm:block">
              {item.desc}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}