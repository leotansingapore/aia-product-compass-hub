import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AvatarWithProgress } from "@/components/profile/AvatarWithProgress";
import {
  LogOut, Key, Settings, Edit3, CheckCircle2, BookOpen, Video,
  GraduationCap, Swords, BarChart3, ArrowRight, Compass, Clock,
  CalendarCheck, ClipboardCheck, Brain,
} from "lucide-react";
import { SecurityForm } from "@/components/account/SecurityForm";
import { ProfileForm } from "@/components/account/ProfileForm";
import { useToast } from "@/hooks/use-toast";
import { useOnboarding } from "@/hooks/useOnboarding";
import { clearAnimatedTourSeen } from "@/components/onboarding/tourStorage";
// Lazy — only loads when the user actually clicks "Platform Tour".
const AnimatedOnboardingTour = lazy(() =>
  import("@/components/onboarding/AnimatedOnboardingTour").then(m => ({
    default: m.AnimatedOnboardingTour,
  }))
);
import { useUserTier } from "@/hooks/useUserTier";
import { useLearningTrackPhases } from "@/hooks/learning-track/useLearningTrackPhases";
import { useLearningTrackProgress } from "@/hooks/learning-track/useLearningTrackProgress";
import { useMyTierRequests } from "@/hooks/useTierRequests";
import { RequestUpgradeButton } from "@/components/tier/RequestUpgradeButton";
import { TierBadge } from "@/components/tier/TierBadge";
import { isModuleFolder } from "@/lib/learning-track/moduleGrouping";
import { TIER_META, type TierLevel } from "@/lib/tiers";
import type { Track } from "@/types/learning-track";
import { useFirst60DaysProgress } from "@/hooks/first-60-days/useFirst60DaysProgress";
import { TOTAL_DAYS as FIRST_60_DAYS_TOTAL } from "@/features/first-60-days/content";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  current_level: number | null;
  total_xp: number | null;
  streak_days: number | null;
  last_active_date: string | null;
}

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Each tier has a "qualifying" content track — completion of that track
// is what the learner needs to hit to be ready for the next tier.
const TIER_TRACK: Record<TierLevel, Track | null> = {
  explorer: "explorer",
  papers_taker: "pre_rnf",
  post_rnf: "post_rnf",
};
const NEXT_TIER: Record<TierLevel, { to: TierLevel; label: string } | null> = {
  explorer: { to: "papers_taker", label: "Papers-taker" },
  papers_taker: { to: "post_rnf", label: "Post-RNF" },
  post_rnf: null,
};

export function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const { user, signOut } = useAuth();
  const { isAdmin: isAdminUser } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startOnboarding } = useOnboarding();
  const { tier } = useUserTier();
  const { pendingRequest } = useMyTierRequests();

  // Tier-progress data: count completed items in the current tier's qualifying
  // track. Only fetch when the sheet is open so we don't pay for it on every
  // page load.
  //
  // Special case: Papers-taker's qualifying work is the First 60 Days
  // curriculum (60 days) rather than the legacy `learning_track_phases`
  // entries (which only hold 8 placeholder rows). We count First 60 Days
  // completion directly via `useFirst60DaysProgress` so the bar reflects
  // real progress.
  const tierTrack = TIER_TRACK[tier];
  const tierPhasesQuery = useLearningTrackPhases(tierTrack ?? "explorer", {
    enabled: open && !!tierTrack && tier !== "papers_taker",
    includeContent: false,
  });
  const { isCompleted } = useLearningTrackProgress(user?.id);
  const {
    completedCount: first60Completed,
  } = useFirst60DaysProgress();
  const tierStats = useMemo(() => {
    if (tier === "papers_taker") {
      const done = first60Completed();
      const total = FIRST_60_DAYS_TOTAL;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      return { total, done, pct };
    }
    const phases = tierPhasesQuery.data ?? [];
    const lessons = phases.flatMap((p) => p.items.filter((i) => !isModuleFolder(i)));
    const total = lessons.length;
    const done = lessons.filter((i) => isCompleted(i.id)).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, pct };
  }, [tier, first60Completed, tierPhasesQuery.data, isCompleted]);
  const nextTier = NEXT_TIER[tier];
  const tierMeta = TIER_META[tier];

  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [quizCount, setQuizCount] = useState(0);
  const [roleplayCount, setRoleplayCount] = useState(0);
  const [avgQuizScore, setAvgQuizScore] = useState<number | null>(null);
  const [bestRoleplayScore, setBestRoleplayScore] = useState<number | null>(null);
  const [lessonProgress, setLessonProgress] = useState<number | null>(null);
  const [videosCompleted, setVideosCompleted] = useState(0);
  const [totalVideos, setTotalVideos] = useState(0);

  // Cache profile across panel opens so the avatar/name appear instantly
  // on every subsequent open instead of refetching from Supabase each time.
  const { data: fetchedProfile } = useQuery<Profile | null>({
    queryKey: ["profile-sheet-profile", user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') return null;
      return data ?? null;
    },
  });

  const [profileOverride, setProfileOverride] = useState<Profile | null>(null);
  const profile = profileOverride ?? fetchedProfile ?? null;

  // Fetch stats only when panel opens (background, non-blocking)
  useEffect(() => {
    if (user && open) fetchStats();
  }, [user, open]);


  const fetchStats = async () => {
    if (!user) return;
    const [quizRes, roleplayRes, quizScoreRes, roleplayScoreRes, totalItemsRes, completedItemsRes, videoCompletedRes, productVideosRes] = await Promise.all([
      supabase.from('quiz_attempts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('roleplay_sessions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('quiz_attempts').select('score, total_questions').eq('user_id', user.id),
      supabase.from('roleplay_feedback').select('overall_score, session_id').order('overall_score', { ascending: false }).limit(1),
      supabase.from('learning_track_items').select('id', { count: 'exact', head: true }),
      supabase.from('learning_track_progress').select('id', { count: 'exact', head: true })
        .eq('user_id', profile?.id ?? '')
        .eq('status', 'completed'),
      // Video completion: how many videos has this user completed?
      supabase.from('video_progress').select('id', { count: 'exact', head: true })
        .eq('user_id', user.id).eq('completed', true),
      // Total videos across all products (count from products table training_videos JSONB)
      supabase.from('products').select('training_videos'),
    ]);
    setQuizCount(quizRes.count ?? 0);
    setRoleplayCount(roleplayRes.count ?? 0);

    // Calculate average quiz score as percentage
    if (quizScoreRes.data && quizScoreRes.data.length > 0) {
      const totalPercent = quizScoreRes.data.reduce((sum, q) => {
        return sum + (q.total_questions > 0 ? (q.score / q.total_questions) * 100 : 0);
      }, 0);
      setAvgQuizScore(Math.round(totalPercent / quizScoreRes.data.length));
    }

    // Best roleplay score
    if (roleplayScoreRes.data && roleplayScoreRes.data.length > 0) {
      setBestRoleplayScore(roleplayScoreRes.data[0].overall_score);
    }

    // Video completion stats
    const completedVids = videoCompletedRes.count ?? 0;
    setVideosCompleted(completedVids);
    if (productVideosRes.data) {
      const total = productVideosRes.data.reduce((sum, p) => {
        const vids = p.training_videos as any[];
        return sum + (Array.isArray(vids) ? vids.length : 0);
      }, 0);
      setTotalVideos(total);
    }

    // Learning track completion (combine video progress + learning track)
    const ltTotal = totalItemsRes.count ?? 0;
    const ltCompleted = completedItemsRes.count ?? 0;
    // Use whichever gives a more meaningful percentage
    if (ltTotal > 0) {
      setLessonProgress(Math.round((ltCompleted / ltTotal) * 100));
    } else if (totalVideos > 0) {
      setLessonProgress(Math.round((completedVids / totalVideos) * 100));
    }
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfileOverride(updatedProfile);
    setEditing(false);
  };

  const handleSignOut = async () => {
    onOpenChange(false);
    await signOut();
  };

  const goTo = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const emailFallbackName = user?.email?.split('@')[0] || 'User';
  const displayName = profile?.display_name ||
    `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
    emailFallbackName;
  const initials = (
    profile?.display_name?.charAt(0) ||
    profile?.first_name?.charAt(0) ||
    user?.email?.charAt(0) ||
    'U'
  ).toUpperCase();

  const tierComplete = tierStats.total > 0 && tierStats.done === tierStats.total;

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>My Profile</SheetTitle>
        </SheetHeader>

        <div className="px-6 pb-6 space-y-5">
          {editing ? (
            <ProfileForm
              profile={profile}
              onSave={handleProfileUpdate}
              onCancel={() => setEditing(false)}
            />
          ) : changingPassword ? (
            <SecurityForm
              onSuccess={() => {
                setChangingPassword(false);
                toast({ title: "Success", description: "Password changed successfully" });
              }}
              onCancel={() => setChangingPassword(false)}
            />
          ) : (
            <>
              {/* Profile header */}
              <div className="flex items-center gap-4">
                <AvatarWithProgress
                  size={64}
                  initials={initials}
                  avatarUrl={profile?.avatar_url}
                  ringWidth={3}
                  showTooltip={false}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold truncate">{displayName}</h3>
                    <button
                      onClick={() => setEditing(true)}
                      className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                      aria-label="Edit profile"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {profile?.email || user?.email}
                  </p>
                  {isAdminUser && (
                    <span className="text-xs font-medium text-primary">
                      Admin
                    </span>
                  )}
                </div>
              </div>

              {/* Tier progress — replaces Level/XP. Shows current stage and how
                  close the learner is to the next one. */}
              <div className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <TierBadge tier={tier} />
                    <span className="text-xs text-muted-foreground truncate">
                      {tierMeta.description}
                    </span>
                  </div>
                </div>

                {tierPhasesQuery.isLoading ? (
                  <div className="h-2 w-full rounded-full bg-muted animate-pulse" />
                ) : tierStats.total > 0 ? (
                  <div className="space-y-1.5">
                    <Progress value={tierStats.pct} className="h-2" />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        {tierStats.done} / {tierStats.total}{" "}
                        {tier === "papers_taker" ? "days" : "lessons"}
                      </span>
                      <span className="tabular-nums">{tierStats.pct}%</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No lessons published for your tier yet.
                  </p>
                )}

                {/* Next-stage CTA */}
                {nextTier && (
                  <div className="pt-2 border-t border-border/50">
                    {pendingRequest ? (
                      <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                        <Clock className="h-3.5 w-3.5 animate-pulse" />
                        <span>Upgrade to {nextTier.label} pending approval</span>
                      </div>
                    ) : tierComplete ? (
                      <RequestUpgradeButton
                        fromTier={tier}
                        toTier={nextTier.to}
                        label={`Ready — request ${nextTier.label}`}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-[11px] text-muted-foreground">
                        Finish all lessons to unlock{" "}
                        <span className="font-medium text-foreground">{nextTier.label}</span>.
                      </p>
                    )}
                  </div>
                )}
                {!nextTier && (
                  <p className="text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                    You're at the highest tier. Keep reviewing to stay sharp.
                  </p>
                )}
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-3 gap-3">
                <StatCard icon={Video} label="Videos" value={videosCompleted} sub={totalVideos > 0 ? `of ${totalVideos}` : undefined} />
                <StatCard icon={CheckCircle2} label="Quizzes" value={quizCount} sub={avgQuizScore !== null ? `${avgQuizScore}% avg` : undefined} />
                <StatCard icon={Swords} label="Roleplays" value={roleplayCount} sub={bestRoleplayScore !== null ? `Best: ${bestRoleplayScore}%` : undefined} />
              </div>

              <Separator />

              {/* Quick Actions */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">Quick Actions</p>
                <QuickLink icon={GraduationCap} label="Learning Track" onClick={() => goTo('/learning-track')} />
                <QuickLink icon={Swords} label="AI Roleplay" onClick={() => goTo('/roleplay')} />
                <QuickLink icon={BookOpen} label="CMFAS Exams" onClick={() => goTo('/cmfas-exams')} />
                <QuickLink icon={BarChart3} label="Sales Playbooks" onClick={() => goTo('/scripts')} />
              </div>

              <Separator />

              {/* Settings */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">Settings</p>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-11 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50"
                  onClick={() => setChangingPassword(true)}
                >
                  <Key className="h-4 w-4 text-primary" />
                  <span className="flex-1 text-left">Change password</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                <div className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted transition-colors">
                  <span className="text-sm font-medium">Theme</span>
                  <ThemeToggle />
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10"
                  onClick={() => {
                    clearAnimatedTourSeen(user?.id);
                    setTourOpen(true);
                    onOpenChange(false);
                  }}
                >
                  <Compass className="h-4 w-4" />
                  Platform Tour
                </Button>

                {isAdminUser && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10"
                    onClick={() => goTo('/admin')}
                  >
                    <Settings className="h-4 w-4" />
                    Admin Panel
                  </Button>
                )}
              </div>

              <Separator />

              {/* Sign out */}
              <Button
                variant="outline"
                className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
    {tourOpen && (
      <Suspense fallback={null}>
        <AnimatedOnboardingTour
          open={tourOpen}
          onClose={() => setTourOpen(false)}
        />
      </Suspense>
    )}
    </>
  );
}

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3 text-center space-y-0.5">
      <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-xl font-bold tabular-nums">{value}</div>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function QuickLink({ icon: Icon, label, onClick }: {
  icon: React.ElementType; label: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors group"
    >
      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      <span className="flex-1 text-left">{label}</span>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
