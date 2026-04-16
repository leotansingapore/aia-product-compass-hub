import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { userTierQueryKey } from '@/hooks/useUserTier';
import { TIER_META, type TierLevel } from '@/lib/tiers';

export type TierRequestStatus = 'pending' | 'approved' | 'rejected';

export interface TierUpgradeRequest {
  id: string;
  user_id: string;
  from_tier: TierLevel;
  to_tier: TierLevel;
  status: TierRequestStatus;
  reason: string | null;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewer_id: string | null;
}

export interface TierUpgradeRequestWithProfile extends TierUpgradeRequest {
  profile: {
    display_name: string | null;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

const TABLE = 'tier_upgrade_requests';

export const tierRequestsQueryKey = (scope: 'user' | 'admin', userId?: string) =>
  ['tier-requests', scope, userId ?? 'all'] as const;

/**
 * User-side hook: list the current user's own upgrade requests + a mutation
 * to create a new one. Enforces linear progression (Explorer → Papers,
 * Papers → Post-RNF) client-side; the DB also enforces via CHECK + unique
 * partial index on pending status.
 */
export function useMyTierRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery<TierUpgradeRequest[]>({
    queryKey: tierRequestsQueryKey('user', user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await (supabase.from(TABLE as never) as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as TierUpgradeRequest[];
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: async ({ fromTier, toTier, reason }: { fromTier: TierLevel; toTier: TierLevel; reason: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await (supabase.from(TABLE as never) as any).insert({
        user_id: user.id,
        from_tier: fromTier,
        to_tier: toTier,
        reason: reason.trim() || null,
        status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast({
        title: 'Request submitted',
        description: `We'll let you know when your upgrade to ${TIER_META[vars.toTier].label} is reviewed.`,
      });
      queryClient.invalidateQueries({ queryKey: tierRequestsQueryKey('user', user?.id) });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      const friendly =
        message.includes('duplicate') || message.includes('tier_upgrade_requests_one_pending_per_user')
          ? 'You already have a pending request.'
          : message;
      toast({ title: 'Could not submit request', description: friendly, variant: 'destructive' });
    },
  });

  const pendingRequest = (query.data ?? []).find((r) => r.status === 'pending') ?? null;

  return {
    requests: query.data ?? [],
    pendingRequest,
    isLoading: query.isLoading,
    createRequest: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}

/**
 * Admin-side hook: list ALL requests, scoped by status filter, with
 * approve/reject mutations. Approve flips the user's tier in
 * `user_access_tiers` AND marks the request approved AND triggers the
 * email edge function.
 */
export function useAdminTierRequests(statusFilter: TierRequestStatus | 'all' = 'pending') {
  const { user: admin } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery<TierUpgradeRequestWithProfile[]>({
    queryKey: tierRequestsQueryKey('admin', statusFilter),
    queryFn: async () => {
      let builder = (supabase.from(TABLE as never) as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (statusFilter !== 'all') {
        builder = builder.eq('status', statusFilter);
      }
      const { data: requests, error } = await builder;
      if (error) throw error;
      const rows = (requests ?? []) as TierUpgradeRequest[];
      if (rows.length === 0) return [];

      // Hydrate profile info in one round-trip
      const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email, first_name, last_name')
        .in('user_id', userIds);
      const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));

      return rows.map((r) => ({
        ...r,
        profile: profileMap.get(r.user_id) ?? null,
      }));
    },
    staleTime: 15_000,
  });

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['tier-requests'] });
  }, [queryClient]);

  const approveMutation = useMutation({
    mutationFn: async ({ request, adminNote }: { request: TierUpgradeRequest; adminNote?: string }) => {
      // 1. Flip the user's tier (same delete-then-insert pattern as TierControl)
      const { error: delErr } = await supabase
        .from('user_access_tiers')
        .delete()
        .eq('user_id', request.user_id);
      if (delErr) throw delErr;
      const { error: insErr } = await supabase
        .from('user_access_tiers')
        .insert({ user_id: request.user_id, tier_level: request.to_tier });
      if (insErr) throw insErr;

      // 2. Mark request approved
      const { error: updErr } = await (supabase.from(TABLE as never) as any)
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewer_id: admin?.id ?? null,
          admin_note: adminNote?.trim() || null,
        })
        .eq('id', request.id);
      if (updErr) throw updErr;

      // 3. Email the user via edge function (best-effort — don't fail the whole flow if this fails)
      try {
        await supabase.functions.invoke('notify-tier-change', {
          body: {
            userId: request.user_id,
            toTier: request.to_tier,
            status: 'approved',
            adminNote: adminNote?.trim() || null,
          },
        });
      } catch (emailErr) {
        console.warn('notify-tier-change email failed (non-blocking):', emailErr);
      }
    },
    onSuccess: (_, vars) => {
      toast({
        title: 'Upgrade approved',
        description: `User moved to ${TIER_META[vars.request.to_tier].label}. Email notification sent.`,
      });
      invalidateAll();
      queryClient.invalidateQueries({ queryKey: userTierQueryKey(vars.request.user_id) });
      queryClient.invalidateQueries({ queryKey: ['user-management'] });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Approval failed';
      toast({ title: 'Could not approve', description: message, variant: 'destructive' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ request, adminNote }: { request: TierUpgradeRequest; adminNote?: string }) => {
      const { error } = await (supabase.from(TABLE as never) as any)
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewer_id: admin?.id ?? null,
          admin_note: adminNote?.trim() || null,
        })
        .eq('id', request.id);
      if (error) throw error;

      try {
        await supabase.functions.invoke('notify-tier-change', {
          body: {
            userId: request.user_id,
            toTier: request.to_tier,
            status: 'rejected',
            adminNote: adminNote?.trim() || null,
          },
        });
      } catch (emailErr) {
        console.warn('notify-tier-change email failed (non-blocking):', emailErr);
      }
    },
    onSuccess: () => {
      toast({ title: 'Request rejected', description: 'The user has been notified.' });
      invalidateAll();
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Rejection failed';
      toast({ title: 'Could not reject', description: message, variant: 'destructive' });
    },
  });

  return {
    requests: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: () => query.refetch(),
    approve: approveMutation.mutate,
    reject: rejectMutation.mutate,
    isPending: approveMutation.isPending || rejectMutation.isPending,
  };
}
