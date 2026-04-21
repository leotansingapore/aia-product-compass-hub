import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Compass, BookOpen, TrendingUp, Target, Sparkles, ArrowRight, Lock, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TierBadge } from '@/components/tier/TierBadge';
import { RequestUpgradeButton } from '@/components/tier/RequestUpgradeButton';
import { useLearningTrackPhases } from '@/hooks/learning-track/useLearningTrackPhases';
import { useAdmin } from '@/hooks/useAdmin';
import type { LearningTrackPhase } from '@/types/learning-track';

const PHASE_ICONS: LucideIcon[] = [Compass, BookOpen, Target, TrendingUp];

function pickIcon(orderIndex: number): LucideIcon {
  const i = ((orderIndex % PHASE_ICONS.length) + PHASE_ICONS.length) % PHASE_ICONS.length;
  return PHASE_ICONS[i];
}

function PhaseCard({ phase }: { phase: LearningTrackPhase }) {
  const Icon = pickIcon(phase.order_index);
  const description = phase.description?.trim() || 'Open module to get started.';
  return (
    <Link
      to="/learning-track/first-14-days"
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
    >
      <Card className="relative h-full border-muted transition-all group-hover:border-primary/40 group-hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 shrink-0">
              <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
          </div>
          <CardTitle className="text-base mt-2">{phase.title}</CardTitle>
          <CardDescription className="text-xs sm:text-sm leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

function PhaseCardSkeleton() {
  return (
    <Card className="border-muted">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-3/4 mt-3" />
        <Skeleton className="h-3 w-full mt-2" />
        <Skeleton className="h-3 w-5/6 mt-1" />
      </CardHeader>
    </Card>
  );
}

function EmptyStateCard({ isAdmin }: { isAdmin: boolean }) {
  return (
    <Card className="border-dashed border-muted-foreground/30 bg-muted/30">
      <CardHeader className="pb-3">
        <div className="p-2 rounded-lg bg-muted w-fit">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardTitle className="text-base mt-2">Coming soon</CardTitle>
        <CardDescription className="text-xs sm:text-sm leading-relaxed">
          Your orientation modules will appear here once an admin publishes them.
        </CardDescription>
        {isAdmin && (
          <Link
            to="/learning-track/first-14-days"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-2"
          >
            Add the first phase on the Explorer track <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </CardHeader>
    </Card>
  );
}

export default function ExplorerHome() {
  const { isAdmin } = useAdmin();
  const phasesQuery = useLearningTrackPhases('explorer');
  const phases = phasesQuery.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <TierBadge tier="explorer" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight mb-3">
            Welcome to Academy 👋
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">
            You&rsquo;re here as an <strong className="text-foreground">Explorer</strong> — the start of the
            Finternship journey. Get grounded in the fundamentals before taking your first papers.
          </p>
        </div>

        {/* Orientation modules — live from the Explorer learning track */}
        <section className="mb-10">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-semibold">Start here</h2>
            <Link
              to="/learning-track/first-14-days"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              Open Explorer track <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {phasesQuery.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PhaseCardSkeleton />
              <PhaseCardSkeleton />
            </div>
          ) : phases.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <EmptyStateCard isAdmin={isAdmin} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {phases.map((phase) => (
                <PhaseCard key={phase.id} phase={phase} />
              ))}
            </div>
          )}
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
            <RequestUpgradeButton
              fromTier="explorer"
              toTier="papers_taker"
              className="shrink-0"
            />
          </CardContent>
        </Card>

        <p className="text-[11px] text-muted-foreground mt-6 text-center">
          Need help? <a href="/my-account" className="underline hover:text-foreground">Account settings</a>
        </p>
      </div>
    </div>
  );
}
