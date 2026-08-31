import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { markRouteBlocked } from '@/components/RouteTracker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RequestUpgradeButton } from '@/components/tier/RequestUpgradeButton';
import { TIER_META, nextTierAbove, type TierLevel } from '@/lib/tiers';

interface TierLockedScreenProps {
  /** What the user was trying to open, e.g. "Sales Playbooks". */
  sectionLabel: string;
  /** The tier the user is actually on. */
  currentTier: TierLevel;
  /**
   * Lowest tier that would unlock this section, or null when nothing in the
   * matrix grants it (a section an admin has to hand out by other means).
   */
  requiredTier: TierLevel | null;
  /** Where "go back to what I can open" points. */
  homeHref?: string;
  homeLabel?: string;
}

/**
 * Shown in place of a tier-gated page instead of bouncing the user home.
 *
 * The old behaviour was a toast reading "This section is locked - not included
 * in your current access" followed by a redirect to `/`. Someone who opened a
 * playbook link a colleague sent them lost the page AND never learned what it
 * was, which tier includes it, or how to ask. This screen answers all three
 * and keeps a way home so nobody is stranded.
 *
 * Upgrade requests are linear, so the button always asks for the NEXT tier up.
 * When that still would not be enough we say so rather than letting someone
 * spend a request finding out.
 */
export function TierLockedScreen({
  sectionLabel,
  currentTier,
  requiredTier,
  homeHref = '/',
  homeLabel = 'Go to my learning track',
}: TierLockedScreenProps) {
  const location = useLocation();
  const currentMeta = TIER_META[currentTier];
  const nextTier = nextTierAbove(currentTier);
  const requiredMeta = requiredTier ? TIER_META[requiredTier] : null;

  // Keep this path out of "restore my last route", or the next visit to `/`
  // drops the user straight back onto this screen.
  useEffect(() => {
    markRouteBlocked(location.pathname);
  }, [location.pathname]);

  // Asking for the next tier up only helps if that tier actually carries the
  // feature. Explorer -> Papers-taker does nothing for a Post-RNF-only page.
  const nextTierIsEnough =
    !!nextTier && !!requiredTier && TIER_META[nextTier].rank >= TIER_META[requiredTier].rank;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Lock className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>

      <h1 className="mt-5 text-xl font-semibold">{sectionLabel} is locked</h1>

      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {requiredMeta ? (
          <>
            It opens up from <strong className="text-foreground">{requiredMeta.label}</strong> onward.
            You&rsquo;re on {currentMeta.label} right now.
          </>
        ) : (
          <>
            It isn&rsquo;t part of any access level yet, so an admin has to switch it on for you
            directly. You&rsquo;re on {currentMeta.label} right now.
          </>
        )}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <Badge variant="outline" className={currentMeta.badgeClass}>
          {currentMeta.label}
        </Badge>
        {requiredMeta && requiredMeta.label !== currentMeta.label && (
          <>
            <span aria-hidden="true" className="text-muted-foreground">
              &rarr;
            </span>
            <Badge variant="outline" className={requiredMeta.badgeClass}>
              {requiredMeta.label}
            </Badge>
          </>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        {nextTier && (
          <RequestUpgradeButton
            fromTier={currentTier}
            toTier={nextTier}
            label={`Ask to move up to ${TIER_META[nextTier].label}`}
          />
        )}

        {nextTier && !nextTierIsEnough && requiredMeta && (
          <p className="max-w-md text-xs text-muted-foreground">
            Heads up: {TIER_META[nextTier].label} is the next step and still doesn&rsquo;t include{' '}
            {sectionLabel}. You&rsquo;ll reach it at {requiredMeta.label}. Say so in your request and
            an admin can move you straight there.
          </p>
        )}

        {!nextTier && (
          <p className="max-w-md text-xs text-muted-foreground">
            You&rsquo;re already on the highest access level, so this one needs an admin to unlock it
            for you.
          </p>
        )}

        <Button asChild variant="ghost" size="sm">
          <Link to={homeHref}>{homeLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
