import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Compass, BookOpen, TrendingUp, Target, Sparkles, ArrowRight, Lock } from 'lucide-react';
import { TierBadge } from '@/components/tier/TierBadge';

interface ExplorerModule {
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'coming-soon';
}

const EXPLORER_MODULES: ExplorerModule[] = [
  {
    title: 'Finternship Orientation',
    description: 'What Academy is, how the journey works, and how to get the most out of your time here.',
    icon: Compass,
    status: 'coming-soon',
  },
  {
    title: 'Financial Planning Basics',
    description: 'The fundamentals every advisor should know before stepping into the industry.',
    icon: BookOpen,
    status: 'coming-soon',
  },
  {
    title: 'Advisory Fundamentals',
    description: 'How great advisors think, communicate, and build trust with clients.',
    icon: Target,
    status: 'coming-soon',
  },
  {
    title: 'Why This Career Matters',
    description: 'Purpose, impact, and what a career in financial advisory can look like.',
    icon: TrendingUp,
    status: 'coming-soon',
  },
];

/**
 * Landing page for users with `tier = 'explorer'`. Minimal and orientation
 * focused — the real content (modules 1–4) is being ported from Skool
 * in Phase 4. For now we render "Coming soon" placeholders plus a nudge
 * toward requesting an upgrade once the user is ready to take papers.
 */
export default function ExplorerHome() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <TierBadge tier="explorer" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Welcome to Academy 👋
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">
            You&rsquo;re here as an <strong className="text-foreground">Explorer</strong> — the start of the
            Finternship journey. Get grounded in the fundamentals before taking your first papers.
          </p>
        </div>

        {/* Orientation modules (placeholder cards until content port in Phase 4) */}
        <section className="mb-10">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-semibold">Start here</h2>
            <span className="text-xs text-muted-foreground">Content coming soon</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXPLORER_MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <Card
                  key={module.title}
                  className="relative border-muted transition-all hover:border-primary/30 hover:shadow-md opacity-80"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 shrink-0">
                        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <Badge variant="outline" className="gap-1 text-[10px] shrink-0">
                        <Lock className="h-3 w-3" />
                        Coming soon
                      </Badge>
                    </div>
                    <CardTitle className="text-base mt-2">{module.title}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm leading-relaxed">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Upgrade nudge */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10 shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold mb-1">Ready to start your papers?</p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                When you&rsquo;re ready to take CMFAS and dive into product knowledge, request an upgrade to the
                Papers tier. An admin will review and unlock the next section for you.
              </p>
            </div>
            <Button disabled className="shrink-0 gap-1.5" title="Request upgrade — wiring in Phase 3">
              Request upgrade
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <p className="text-[11px] text-muted-foreground mt-6 text-center">
          Need help? <a href="/my-account" className="underline hover:text-foreground">Account settings</a>
        </p>
      </div>
    </div>
  );
}
