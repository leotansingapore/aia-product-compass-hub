import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TierLevel } from "@/lib/tiers";
import { normalizeTier } from "@/lib/tiers";

export type TeamProgressRow = {
  userId: string;
  name: string;
  email: string | null;
  tier: TierLevel;
  isAdmin: boolean;
  f14Done: number;
  f60Done: number;
  n60Done: number;
  pmDone: number;
  assignmentsDone: number;
  qbCorrect: number;
  videosDone: number;
  totalPoints: number;
  lastActive: string | null;
};

type RpcRow = {
  user_id: string;
  name: string;
  email: string | null;
  tier: string;
  is_admin: boolean;
  f14_done: number;
  f60_done: number;
  n60_done: number;
  pm_done: number;
  assignments_done: number;
  qb_correct: number;
  videos_done: number;
  total_points: number | string;
  last_active: string | null;
};

/**
 * Whole-roster progress counts for the admin/leader Team Progress dashboard,
 * via the admin-only `get_team_progress` RPC (SECURITY DEFINER — it returns
 * every learner's name + email, so keep `enabled` gated on admin).
 */
export function useTeamProgress(enabled: boolean) {
  return useQuery({
    queryKey: ["team-progress"],
    queryFn: async (): Promise<TeamProgressRow[]> => {
      const { data, error } = await (supabase.rpc as any)("get_team_progress");
      if (error) throw new Error(error.message ?? "Failed to load team progress");
      return ((data ?? []) as RpcRow[]).map((r) => ({
        userId: r.user_id,
        name: r.name,
        email: r.email,
        tier: normalizeTier(r.tier),
        isAdmin: r.is_admin,
        f14Done: r.f14_done,
        f60Done: r.f60_done,
        n60Done: r.n60_done,
        pmDone: r.pm_done,
        assignmentsDone: r.assignments_done,
        qbCorrect: r.qb_correct,
        videosDone: r.videos_done,
        totalPoints: typeof r.total_points === "number" ? r.total_points : Number(r.total_points ?? 0),
        lastActive: r.last_active,
      }));
    },
    enabled,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });
}

export type CoreVideoCatalogRow = {
  productId: string;
  productTitle: string;
  videoId: string;
  videoTitle: string;
  sortOrder: number;
};

type CatalogRpcRow = {
  product_id: string;
  product_title: string;
  video_id: string;
  video_title: string;
  sort_order: number;
};

/**
 * Every Core Products training video (module + title only — none of the heavy
 * rich_content/transcript jsonb) via the admin-only `get_core_video_catalog`
 * RPC. Joined against a learner's completed video ids to render per-module
 * done/total in the Team Progress drill-down.
 */
export function useCoreVideoCatalog(enabled: boolean) {
  return useQuery({
    queryKey: ["core-video-catalog"],
    queryFn: async (): Promise<CoreVideoCatalogRow[]> => {
      const { data, error } = await (supabase.rpc as any)("get_core_video_catalog");
      if (error) throw new Error(error.message ?? "Failed to load video catalog");
      // Dedupe on (product, video id): at least one product carries the same
      // lesson entry twice in its training_videos jsonb, which would inflate
      // the done/total denominator (a learner can only ever complete it once)
      // and collide React keys in the drill-down list.
      const seen = new Set<string>();
      const rows: CoreVideoCatalogRow[] = [];
      for (const r of (data ?? []) as CatalogRpcRow[]) {
        const key = `${r.product_id}:${r.video_id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push({
          productId: r.product_id,
          productTitle: r.product_title,
          videoId: r.video_id,
          videoTitle: r.video_title,
          sortOrder: r.sort_order,
        });
      }
      return rows;
    },
    enabled,
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
  });
}
