import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export function RoleplayGuide() {
  const steps = [
    { step: "1", title: "Choose", desc: "Select a roleplay scenario that matches your learning goals" },
    { step: "2", title: "Practice", desc: "Engage in realistic conversations with AI video avatars" },
    { step: "3", title: "Feedback", desc: "Receive AI-powered feedback to improve your performance" },
  ];

  return (
    <Card className="bg-muted/30 border-border/50">
      <CardContent className="p-3 sm:p-6">
        {/* Mobile: inline horizontal steps */}
        <div className="space-y-2 sm:hidden">
          {steps.map((item, i) => (
            <div key={item.step} className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/40 px-3 py-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center shrink-0">
                <span className="text-primary-foreground font-bold text-[10px]">{item.step}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">{item.title}</p>
                <p className="text-[11px] leading-snug text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: full 3-column */}
        <div className="hidden sm:block">
          <h3 className="flex items-center gap-2 text-base font-semibold mb-4">
            <Users className="h-5 w-5 text-primary" />
            How It Works
          </h3>
          <div className="grid grid-cols-3 gap-6">
            {steps.map((item) => (
              <div key={item.step} className="text-center space-y-2 group">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-primary-foreground font-bold">{item.step}</span>
                </div>
                <h4 className="font-semibold text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
