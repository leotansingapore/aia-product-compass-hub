import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ProfileForm } from "./ProfileForm";
import { Edit3, Trophy, Zap, Calendar } from "lucide-react";
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

export function ProfileSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        toast({ title: "Error", description: "Failed to load profile data", variant: "destructive" });
        return;
      }

      if (data) {
        setProfile(data);
      } else {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ user_id: user.id, email: user.email, display_name: user.email?.split('@')[0] || 'User' }])
          .select()
          .single();
        if (!createError) setProfile(newProfile);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    setEditing(false);
  };

  if (loading) {
    return (
      <Card><CardContent className="p-6"><CardTitle>Loading...</CardTitle></CardContent></Card>
    );
  }

  if (editing) {
    return <ProfileForm profile={profile} onSave={handleProfileUpdate} onCancel={() => setEditing(false)} />;
  }

  const displayName = profile?.display_name ||
    `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'User';
  const initials = profile?.display_name?.charAt(0)?.toUpperCase() ||
    profile?.first_name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Profile header card */}
      <Card className="border shadow-sm">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-3 md:gap-5">
            <Avatar className="h-14 w-14 md:h-20 md:w-20 border-2 border-primary/20 shrink-0">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-lg md:text-2xl font-bold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-xl font-bold truncate">{displayName}</h3>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {profile?.email || user?.email}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                className="mt-2 h-8 text-xs gap-1.5"
              >
                <Edit3 className="h-3 w-3" />
                Edit Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats row — compact */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <StatCard icon={Trophy} label="Level" value={profile?.current_level || 1} color="amber" />
        <StatCard icon={Zap} label="XP" value={profile?.total_xp || 0} color="blue" />
        <StatCard icon={Calendar} label="Streak" value={profile?.streak_days || 0} color="emerald" />
      </div>

      {/* Personal info — collapsed on mobile, visible on desktop */}
      <Card className="border shadow-sm">
        <CardContent className="p-4 md:p-6">
          <h4 className="text-sm font-semibold mb-3">Details</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <InfoField label="First Name" value={profile?.first_name} />
            <InfoField label="Last Name" value={profile?.last_name} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string;
}) {
  const colorMap: Record<string, string> = {
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-3 md:p-4 flex flex-col items-center text-center">
        <div className={`p-1.5 rounded-md mb-1 ${colorMap[color]}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="text-xl md:text-2xl font-bold tabular-nums">{value}</div>
        <span className="text-[10px] md:text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

function InfoField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <p className="text-sm font-medium truncate">{value || '—'}</p>
    </div>
  );
}
