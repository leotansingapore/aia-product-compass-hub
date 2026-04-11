import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  LogOut, Key, Settings, Edit3, CheckCircle2, BookOpen, Video, Sun, Moon,
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

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    const [quizRes, roleplayRes] = await Promise.all([
      supabase.from('quiz_attempts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('roleplay_sessions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]);
    setQuizCount(quizRes.count ?? 0);
    setRoleplayCount(roleplayRes.count ?? 0);
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    setEditing(false);
  };

  const handleSignOut = async () => {
    onOpenChange(false);
    await signOut();
  };

  const displayName = profile?.display_name ||
    `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
    user?.email?.split('@')[0] || 'User';
  const initials = profile?.display_name?.charAt(0)?.toUpperCase() ||
    profile?.first_name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() || 'U';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>My Profile</SheetTitle>
        </SheetHeader>

        <div className="px-6 pb-6 space-y-5">
          {/* Editing profile */}
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
                  <h3 className="text-lg font-bold truncate">{displayName}</h3>
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

              {/* Edit Profile button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                className="w-full gap-2"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit Profile
              </Button>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={CheckCircle2} label="Quizzes" value={quizCount} />
                <StatCard icon={BookOpen} label="Roleplays" value={roleplayCount} />
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-2">
                {/* Theme toggle row */}
                <div className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted transition-colors">
                  <span className="text-sm font-medium">Theme</span>
                  <ThemeToggle />
                </div>

                {/* Change password */}
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10"
                  onClick={() => setChangingPassword(true)}
                >
                  <Key className="h-4 w-4" />
                  Change Password
                </Button>

                {/* Admin Panel */}
                {isAdminUser && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10"
                    onClick={() => {
                      onOpenChange(false);
                      navigate('/admin');
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    Admin Panel
                  </Button>
                )}

                {/* Full account page */}
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10 text-muted-foreground"
                  onClick={() => {
                    onOpenChange(false);
                    navigate('/my-account');
                  }}
                >
                  <Settings className="h-4 w-4" />
                  Full Account Settings
                </Button>
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

function StatCard({ icon: Icon, label, value }: {
  icon: React.ElementType; label: string; value: number;
}) {
  return (
    <div className="rounded-lg border bg-card p-3 text-center">
      <div className="flex items-center justify-center gap-1.5 mb-1 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
