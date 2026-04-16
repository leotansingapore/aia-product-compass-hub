import { Card, CardContent } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { useUserTier } from '@/hooks/useUserTier';
import { usePermissions } from '@/hooks/usePermissions';
import { RequestUpgradeButton } from '@/components/tier/RequestUpgradeButton';

/**
 * Auto-hides unless the user is tier = 'papers_taker' (and not an admin).
 * Shows a compact banner nudging them to request Post-RNF when they're
 * ready (i.e. passed CMFAS and joined AIA).
 *
 * Explorer's own upgrade prompt lives inside `ExplorerHome`; this component
 * is only for Papers-takers who land on the main Dashboard.
 */
export function TierUpgradePrompt() {
  const { tier, isLoading } = useUserTier();
  const { hasRole, isMasterAdmin } = usePermissions();

  if (isLoading) return null;
  if (tier !== 'papers_taker') return null;
  // Admins should use the TierControl, not the user-facing request flow.
  if (isMasterAdmin() || hasRole('admin')) return null;

  return (
    <Card className="border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 shrink-0">
          <Trophy className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold mb-0.5">Passed CMFAS and joined AIA?</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Request an upgrade to Post-RNF to unlock playbooks, scripts, servicing flows, and consultant tools.
          </p>
        </div>
        <RequestUpgradeButton
          fromTier="papers_taker"
          toTier="post_rnf"
          label="Request Post-RNF"
          compact
          className="shrink-0"
        />
      </CardContent>
    </Card>
  );
}
