import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TIER_META, normalizeTier, type TierLevel } from '@/lib/tiers';

interface TierBadgeProps {
  tier: TierLevel | string | null | undefined;
  /** Show only the icon, no label. */
  iconOnly?: boolean;
  /** Short label ("Papers") instead of full ("Papers-taker"). */
  compact?: boolean;
  className?: string;
}

/**
 * Visual badge for a user's Academy tier (Explorer / Papers / Post-RNF).
 * Accepts raw tier strings (including legacy `level_1` / `level_2`) and
 * normalises them internally.
 */
export function TierBadge({ tier, iconOnly, compact, className }: TierBadgeProps) {
  const normalized = normalizeTier(tier);
  const meta = TIER_META[normalized];
  const Icon = meta.icon;
  const label = compact ? meta.shortLabel : meta.label;

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 font-medium whitespace-nowrap',
        meta.badgeClass,
        className,
      )}
      title={meta.description}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {!iconOnly && <span>{label}</span>}
    </Badge>
  );
}
