import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TierLevel } from "@/lib/tiers";

export type PointBreakdown = {
  first14Days: number;
  first60Days: number;
  next60Days: number;
  assignments: number;
  questionBank: number;
  videos: number;
  productMastery: number;
};

export type LeaderboardRow = {
  userId: string;
  name: string;
  email: string | null;
  tier: TierLevel;
  totalPoints: number;
  daysActive: number;
  breakdown: PointBreakdown;
  rank: number;
  isCurrentUser: boolean;
};

type RpcRow = {
  user_id: string;
  name: string;
  email: string | null;
  total_points: number | string;
  days_active: number;
  first_14_days: number | string;
  first_60_days: number | string;
  next_60_days: number | string;
  assignments: number | string;
  question_bank: number | string;
  videos: number | string;
  product_mastery: number | string;
};

const toNum = (v: number | string | null | undefined): number =>
  typeof v === "number" ? v : v ? Number(v) : 0;

/**
 * Pulls the leaderboard for a single tier via `get_learner_leaderboard` RPC.
 * The RPC is SECURITY DEFINER so non-admin learners can read other users'
 * aggregated activity without tripping RLS (which otherwise limits each user
 * to their own profile + tier row — the reason a single learner used to see
 * a leaderboard of one).
 */
async function fetchLeaderboard(
  currentUserId: string | null,
  tier: TierLevel,
): Promise<LeaderboardRow[]> {
  const { data, error } = await (supabase.rpc as any)("get_learner_leaderboard", {
    p_tier: tier,
  });
  if (error) {
    console.error("get_learner_leaderboard failed", error);
    const msg =
      (error as { message?: string })?.message ??
      (error as { details?: string })?.details ??
      JSON.stringify(error);
    throw new Error(`get_learner_leaderboard: ${msg}`);
  }

  const rows: LeaderboardRow[] = ((data ?? []) as RpcRow[]).map((r, idx) => {
    const breakdown: PointBreakdown = {
      first14Days: toNum(r.first_14_days),
      first60Days: toNum(r.first_60_days),
      next60Days: toNum(r.next_60_days),
      assignments: toNum(r.assignments),
      questionBank: toNum(r.question_bank),
      videos: toNum(r.videos),
      productMastery: toNum(r.product_mastery),
    };
    return {
      userId: r.user_id,
      name: r.name,
      email: r.email,
      tier,
      totalPoints: toNum(r.total_points),
      daysActive: r.days_active,
      breakdown,
      rank: idx + 1,
      isCurrentUser: r.user_id === currentUserId,
    };
  });
  return rows;
}

export function useLearnerLeaderboard(
  currentUserId: string | null,
  tier: TierLevel | null,
) {
  const isScoped =
    tier === "explorer" || tier === "papers_taker" || tier === "post_rnf";
  return useQuery({
    queryKey: ["learner-leaderboard", tier, currentUserId],
    queryFn: () => fetchLeaderboard(currentUserId, tier as TierLevel),
    enabled: isScoped,
    // Server-side RPC is cheap, but board only refreshes when activity lands.
    // Hold for 5 min so learning-track pages (which mount LeaderboardRankCard
    // on every visit) don't re-query the RPC each navigation.
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
    refetchOnMount: false,
  });
}
