import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TierLevel } from "@/lib/tiers";

export type PointBreakdown = {
  first14Days: number;
  first14Reflections: number;
  first60Days: number;
  first60Reflections: number;
  assignments: number;
  questionBank: number;
  productQuizzes: number;
  videos: number;
  learningTrackItems: number;
  learningTrackSubmissions: number;
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
  first_14_reflections: number | string;
  first_60_days: number | string;
  first_60_reflections: number | string;
  assignments: number | string;
  question_bank: number | string;
  product_quizzes: number | string;
  videos: number | string;
  learning_track_items: number | string;
  learning_track_submissions: number | string;
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
  if (error) throw error;

  const rows: LeaderboardRow[] = ((data ?? []) as RpcRow[]).map((r, idx) => {
    const breakdown: PointBreakdown = {
      first14Days: toNum(r.first_14_days),
      first14Reflections: toNum(r.first_14_reflections),
      first60Days: toNum(r.first_60_days),
      first60Reflections: toNum(r.first_60_reflections),
      assignments: toNum(r.assignments),
      questionBank: toNum(r.question_bank),
      productQuizzes: toNum(r.product_quizzes),
      videos: toNum(r.videos),
      learningTrackItems: toNum(r.learning_track_items),
      learningTrackSubmissions: toNum(r.learning_track_submissions),
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
  const isScoped = tier === "papers_taker" || tier === "post_rnf";
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
