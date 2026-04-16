import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { TIER_LEVELS, TIER_META, normalizeTier, type TierLevel } from '@/lib/tiers';
import { userTierQueryKey } from '@/hooks/useUserTier';

interface TierControlProps {
  userId: string;
  currentTier: TierLevel | string | null | undefined;
  /** Optional: called after a successful tier change with the new tier. */
  onChange?: (newTier: TierLevel) => void;
  /** Compact trigger (shorter label, narrower). Use in table rows. */
  compact?: boolean;
  className?: string;
}

/**
 * Admin-facing dropdown that reads + writes a user's Academy tier.
 * Upserts into `user_access_tiers` on change and invalidates related caches.
 */
export function TierControl({
  userId,
  currentTier,
  onChange,
  compact,
  className,
}: TierControlProps) {
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const normalized = normalizeTier(currentTier);

  const handleChange = async (nextValue: string) => {
    const nextTier = nextValue as TierLevel;
    if (nextTier === normalized) return;
    setSaving(true);
    try {
      // Delete-then-insert pattern used elsewhere in the admin UI — keeps the
      // row count at 1 per user without requiring an upsert unique constraint.
      const { error: deleteError } = await supabase
        .from('user_access_tiers')
        .delete()
        .eq('user_id', userId);
      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('user_access_tiers')
        .insert({ user_id: userId, tier_level: nextTier });
      if (insertError) throw insertError;

      toast({
        title: 'Tier updated',
        description: `Set to ${TIER_META[nextTier].label}`,
      });

      queryClient.invalidateQueries({ queryKey: userTierQueryKey(userId) });
      queryClient.invalidateQueries({ queryKey: ['user-management'] });
      onChange?.(nextTier);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update tier';
      console.error('TierControl update failed', err);
      toast({
        title: 'Failed to update tier',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Select value={normalized} onValueChange={handleChange} disabled={saving}>
      <SelectTrigger
        className={cn(compact ? 'h-8 text-xs w-[140px]' : 'text-sm w-[180px]', className)}
        aria-label="Change user tier"
      >
        {saving ? (
          <span className="flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving…
          </span>
        ) : (
          <SelectValue />
        )}
      </SelectTrigger>
      <SelectContent>
        {TIER_LEVELS.map((tier) => {
          const meta = TIER_META[tier];
          const Icon = meta.icon;
          return (
            <SelectItem key={tier} value={tier}>
              <span className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="flex flex-col">
                  <span className="font-medium">{meta.label}</span>
                  {!compact && (
                    <span className="text-[11px] text-muted-foreground">{meta.description}</span>
                  )}
                </span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
