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

type ProfileRow = {
  user_id: string;
  display_name: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
};

type TierRow = { user_id: string; tier_level: string };

function personLabel(p: ProfileRow | undefined, userId: string): string {
  if (!p) return userId.slice(0, 8);
  return (
    p.display_name?.trim() ||
    [p.first_name, p.last_name].filter(Boolean).join(" ").trim() ||
    p.email ||
    userId.slice(0, 8)
  );
}

function addDate(set: Set<string>, iso: string | null | undefined) {
  if (!iso) return;
  set.add(iso.slice(0, 10));
}

async function fetchLeaderboard(currentUserId: string | null): Promise<LeaderboardRow[]> {
  // Step 1: pull the universe of learners — tier rows first, then profiles.
  // Anyone without a tier row is treated as 'explorer' and excluded from the
  // two tier-scoped leaderboards automatically.
  const [tiersRes, profilesRes] = await Promise.all([
    supabase.from("user_access_tiers").select("user_id, tier_level").range(0, 9999),
    supabase
      .from("profiles")
      .select("user_id, display_name, email, first_name, last_name")
      .range(0, 9999),
  ]);
  if (tiersRes.error) throw tiersRes.error;
  if (profilesRes.error) throw profilesRes.error;

  const tiersByUser = new Map<string, TierLevel>();
  for (const r of (tiersRes.data ?? []) as TierRow[]) {
    if (r.tier_level === "papers_taker" || r.tier_level === "post_rnf") {
      tiersByUser.set(r.user_id, r.tier_level as TierLevel);
    } else if (r.tier_level === "level_1") {
      tiersByUser.set(r.user_id, "papers_taker");
    } else if (r.tier_level === "level_2") {
      tiersByUser.set(r.user_id, "post_rnf");
    }
  }

  const relevantIds = Array.from(tiersByUser.keys());
  if (relevantIds.length === 0) return [];

  const profileMap = new Map<string, ProfileRow>();
  for (const p of (profilesRes.data ?? []) as ProfileRow[]) {
    profileMap.set(p.user_id, p);
  }

  // Step 2: aggregate activity in parallel. Scope every query to relevant
  // user IDs so we're not pulling the whole org.
  const [f14, f60, assigns, banks, quizzes, vids, ltProg, ltSubs] = await Promise.all([
    supabase
      .from("first_14_days_progress")
      .select("user_id, quiz_passed_at, reflection_saved_at, updated_at")
      .in("user_id", relevantIds)
      .range(0, 9999),
    supabase
      .from("first_60_days_progress")
      .select(
        "user_id, day_number, quiz_passed_at, reflection_submitted_at, updated_at",
      )
      .in("user_id", relevantIds)
      .range(0, 9999),
    supabase
      .from("assignment_submissions")
      .select("user_id, item_id, submitted_at, created_at")
      .eq("product_id", "first-60-days-assignments")
      .in("user_id", relevantIds)
      .range(0, 9999),
    (supabase.from as any)("user_question_progress")
      .select("user_id, mastered, last_answered_at")
      .in("user_id", relevantIds)
      .range(0, 9999),
    supabase
      .from("quiz_attempts")
      .select("user_id, completed_at")
      .in("user_id", relevantIds)
      .range(0, 9999),
    supabase
      .from("video_progress")
      .select("user_id, completed, completed_at, updated_at")
      .eq("completed", true)
      .in("user_id", relevantIds)
      .range(0, 9999),
    supabase
      .from("learning_track_progress")
      .select("user_id, status, completed_at, updated_at")
      .eq("status", "completed")
      .in("user_id", relevantIds)
      .range(0, 9999),
    supabase
      .from("learning_track_submissions")
      .select("user_id, review_status, submitted_at")
      .in("user_id", relevantIds)
      .range(0, 9999),
  ]);

  if (f14.error) throw f14.error;
  if (f60.error) throw f60.error;
  if (assigns.error) throw assigns.error;
  if (banks.error) throw banks.error;
  if (quizzes.error) throw quizzes.error;
  if (vids.error) throw vids.error;
  if (ltProg.error) throw ltProg.error;
  if (ltSubs.error) throw ltSubs.error;

  type Bucket = {
    breakdown: PointBreakdown;
    days: Set<string>;
    seenAssignments: Set<string>;
  };
  const buckets = new Map<string, Bucket>();
  const bucketFor = (userId: string): Bucket => {
    let b = buckets.get(userId);
    if (!b) {
      b = {
        breakdown: {
          first14Days: 0,
          first14Reflections: 0,
          first60Days: 0,
          first60Reflections: 0,
          assignments: 0,
          questionBank: 0,
          productQuizzes: 0,
          videos: 0,
          learningTrackItems: 0,
          learningTrackSubmissions: 0,
        },
        days: new Set(),
        seenAssignments: new Set(),
      };
      buckets.set(userId, b);
    }
    return b;
  };

  // First 14 Days — 1pt per quiz passed, +0.5pt per reflection saved.
  for (const r of (f14.data ?? []) as Array<{
    user_id: string;
    quiz_passed_at: string | null;
    reflection_saved_at: string | null;
    updated_at: string;
  }>) {
    const b = bucketFor(r.user_id);
    if (r.quiz_passed_at) b.breakdown.first14Days += 1;
    if (r.reflection_saved_at) b.breakdown.first14Reflections += 0.5;
    addDate(b.days, r.quiz_passed_at);
    addDate(b.days, r.reflection_saved_at);
    addDate(b.days, r.updated_at);
  }

  // First 60 Days — 1pt per quiz passed, +0.5pt per reflection submitted.
  for (const r of (f60.data ?? []) as Array<{
    user_id: string;
    quiz_passed_at: string | null;
    reflection_submitted_at: string | null;
    updated_at: string;
  }>) {
    const b = bucketFor(r.user_id);
    if (r.quiz_passed_at) b.breakdown.first60Days += 1;
    if (r.reflection_submitted_at) b.breakdown.first60Reflections += 0.5;
    addDate(b.days, r.quiz_passed_at);
    addDate(b.days, r.reflection_submitted_at);
    addDate(b.days, r.updated_at);
  }

  // Assignments — 5pt per distinct item, dedup so re-submits don't inflate.
  for (const r of (assigns.data ?? []) as Array<{
    user_id: string;
    item_id: string;
    submitted_at: string | null;
    created_at: string | null;
  }>) {
    const b = bucketFor(r.user_id);
    const key = `${r.user_id}:${r.item_id}`;
    if (!b.seenAssignments.has(key)) {
      b.seenAssignments.add(key);
      b.breakdown.assignments += 5;
    }
    addDate(b.days, r.submitted_at ?? r.created_at);
  }

  // Question bank mastery — 0.5pt per mastered question (proxy for bank passed).
  for (const r of (banks.data ?? []) as Array<{
    user_id: string;
    mastered: boolean | null;
    last_answered_at: string | null;
  }>) {
    if (!r.mastered) continue;
    const b = bucketFor(r.user_id);
    b.breakdown.questionBank += 0.5;
    addDate(b.days, r.last_answered_at);
  }

  // Product quizzes — 1pt per attempt row (gamification already dedups per day).
  for (const r of (quizzes.data ?? []) as Array<{
    user_id: string;
    completed_at: string;
  }>) {
    const b = bucketFor(r.user_id);
    b.breakdown.productQuizzes += 1;
    addDate(b.days, r.completed_at);
  }

  // Videos — 0.5pt per completion.
  for (const r of (vids.data ?? []) as Array<{
    user_id: string;
    completed_at: string | null;
    updated_at: string;
  }>) {
    const b = bucketFor(r.user_id);
    b.breakdown.videos += 0.5;
    addDate(b.days, r.completed_at ?? r.updated_at);
  }

  // Learning track items — 1pt per completed item. Covers Post-RNF curriculum
  // and the legacy Pre-RNF "Assignment 1–4" rows that still live here.
  for (const r of (ltProg.data ?? []) as Array<{
    user_id: string;
    status: string;
    completed_at: string | null;
    updated_at: string;
  }>) {
    const b = bucketFor(r.user_id);
    b.breakdown.learningTrackItems += 1;
    addDate(b.days, r.completed_at ?? r.updated_at);
  }

  // Learning track submissions — 3pt per submission, +2pt bonus if approved.
  for (const r of (ltSubs.data ?? []) as Array<{
    user_id: string;
    review_status: string;
    submitted_at: string | null;
  }>) {
    const b = bucketFor(r.user_id);
    b.breakdown.learningTrackSubmissions += 3;
    if (r.review_status === "approved") b.breakdown.learningTrackSubmissions += 2;
    addDate(b.days, r.submitted_at);
  }

  // Step 3: assemble rows, sort, rank.
  const rows: LeaderboardRow[] = [];
  for (const userId of relevantIds) {
    const tier = tiersByUser.get(userId)!;
    const b = buckets.get(userId);
    const breakdown: PointBreakdown = b?.breakdown ?? {
      first14Days: 0,
      first14Reflections: 0,
      first60Days: 0,
      first60Reflections: 0,
      assignments: 0,
      questionBank: 0,
      productQuizzes: 0,
      videos: 0,
      learningTrackItems: 0,
      learningTrackSubmissions: 0,
    };
    const totalPoints =
      breakdown.first14Days +
      breakdown.first14Reflections +
      breakdown.first60Days +
      breakdown.first60Reflections +
      breakdown.assignments +
      breakdown.questionBank +
      breakdown.productQuizzes +
      breakdown.videos +
      breakdown.learningTrackItems +
      breakdown.learningTrackSubmissions;
    const daysActive = b?.days.size ?? 0;
    const profile = profileMap.get(userId);
    rows.push({
      userId,
      name: personLabel(profile, userId),
      email: profile?.email ?? null,
      tier,
      totalPoints: Math.round(totalPoints * 10) / 10,
      daysActive,
      breakdown,
      rank: 0,
      isCurrentUser: userId === currentUserId,
    });
  }

  rows.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.daysActive !== a.daysActive) return b.daysActive - a.daysActive;
    return a.name.localeCompare(b.name);
  });
  rows.forEach((r, idx) => {
    r.rank = idx + 1;
  });
  return rows;
}

export function useLearnerLeaderboard(currentUserId: string | null) {
  return useQuery({
    queryKey: ["learner-leaderboard", currentUserId],
    queryFn: () => fetchLeaderboard(currentUserId),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}
