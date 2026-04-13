import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  LogOut, Key, Settings, Edit3, CheckCircle2, BookOpen, Video,
  Flame, Trophy, Zap, GraduationCap, Swords, BarChart3, ArrowRight,
} from "lucide-react";
import { SecurityForm } from "@/components/account/SecurityForm";
import { ProfileForm } from "@/components/account/ProfileForm";
import { useToast } from "@/hooks/use-toast";

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

// XP needed per level (simple formula)
const xpForLevel = (level: number) => level * 100;

export function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const { user, signOut } = useAuth();
  const { isMasterAdmin, hasRole } = usePermissions();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [quizCount, setQuizCount] = useState(0);
  const [roleplayCount, setRoleplayCount] = useState(0);
  const [avgQuizScore, setAvgQuizScore] = useState<number | null>(null);
  const [bestRoleplayScore, setBestRoleplayScore] = useState<number | null>(null);

  const isAdminUser = isMasterAdmin() || hasRole('admin');

  useEffect(() => {
    if (user && open) {
      fetchProfile();
      fetchStats();
    }
  }, [user, open]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') return;
      if (data) setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    const [quizRes, roleplayRes, quizScoreRes, roleplayScoreRes] = await Promise.all([
      supabase.from('quiz_attempts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('roleplay_sessions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('quiz_attempts').select('score, total_questions').eq('user_id', user.id),
      supabase.from('roleplay_feedback').select('overall_score, session_id').order('overall_score', { ascending: false }).limit(1),
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
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
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

  const displayName = profile?.display_name ||
    `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
    user?.email?.split('@')[0] || 'User';
  const initials = profile?.display_name?.charAt(0)?.toUpperCase() ||
    profile?.first_name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() || 'U';

  const level = profile?.current_level ?? 1;
  const totalXp = profile?.total_xp ?? 0;
  const streak = profile?.streak_days ?? 0;
  const xpNeeded = xpForLevel(level);
  const xpProgress = xpNeeded > 0 ? Math.min((totalXp / xpNeeded) * 100, 100) : 0;

  return (
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
                <Avatar className="h-16 w-16 border-2 border-primary/20 shrink-0">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
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
                      {isMasterAdmin() ? 'Master Admin' : 'Admin'}
                    </span>
                  )}
                </div>
              </div>

              {/* XP & Level progress */}
              <div className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                      <Trophy className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Level {level}</p>
                      <p className="text-xs text-muted-foreground">{totalXp} XP total</p>
                    </div>
                  </div>
                  {streak > 0 && (
                    <div className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2.5 py-1">
                      <Flame className="h-3.5 w-3.5 text-orange-500" />
                      <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">{streak}d streak</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Progress value={xpProgress} className="h-2" />
                  <p className="text-[11px] text-muted-foreground text-right">
                    {totalXp} / {xpNeeded} XP to Level {level + 1}
                  </p>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={CheckCircle2} label="Quizzes Taken" value={quizCount} sub={avgQuizScore !== null ? `${avgQuizScore}% avg` : undefined} />
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
                <div className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted transition-colors">
                  <span className="text-sm font-medium">Theme</span>
                  <ThemeToggle />
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10"
                  onClick={() => setChangingPassword(true)}
                >
                  <Key className="h-4 w-4" />
                  Change Password
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
  );
}

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType; label: string; value: number; sub?: string;
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
