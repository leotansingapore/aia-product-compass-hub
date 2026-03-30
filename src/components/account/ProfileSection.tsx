import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ProfileForm } from "./ProfileForm";
import { User, Edit3, Trophy, Zap, Calendar } from "lucide-react";
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
    if (user) {
      fetchProfile();
    }
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
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setProfile(data);
      } else {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: user.id,
              email: user.email,
              display_name: user.email?.split('@')[0] || 'User',
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
        } else {
          setProfile(newProfile);
        }
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
      <Card>
        <CardHeader>
          <CardTitle>Loading Profile...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (editing) {
    return (
      <ProfileForm
        profile={profile}
        onSave={handleProfileUpdate}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 md:p-8">
          {/* Desktop: horizontal layout | Mobile: stacked */}
          <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
            {/* Avatar + name block */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left shrink-0">
              <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-primary/20">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {profile?.display_name?.charAt(0)?.toUpperCase() || 
                   profile?.first_name?.charAt(0)?.toUpperCase() || 
                   user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="mt-3 space-y-1">
                <h3 className="text-xl md:text-2xl font-bold">
                  {profile?.display_name || 
                   `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 
                   'User'}
                </h3>
                <p className="text-sm text-muted-foreground break-all">
                  {profile?.email || user?.email}
                </p>
              </div>
              <Button 
                variant="default" 
                onClick={() => setEditing(true)}
                className="mt-4 h-10 text-sm font-semibold w-full md:w-auto"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            {/* Stats + personal info */}
            <div className="flex-1 space-y-6 min-w-0">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <Card className="hover:shadow-md transition-all border-border/50 group">
                  <CardContent className="p-3 md:p-4 flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 rounded-md bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                        <Trophy className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground hidden md:inline">Level</span>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold">{profile?.current_level || 1}</div>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Current Level</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-all border-border/50 group">
                  <CardContent className="p-3 md:p-4 flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 rounded-md bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                        <Zap className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground hidden md:inline">XP</span>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold">{profile?.total_xp || 0}</div>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Total XP</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-all border-border/50 group">
                  <CardContent className="p-3 md:p-4 flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 rounded-md bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                        <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground hidden md:inline">Streak</span>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold">{profile?.streak_days || 0}</div>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Streak Days</p>
                  </CardContent>
                </Card>
              </div>

              {/* Personal info — 2-col grid on desktop */}
              <div>
                <h4 className="text-base font-semibold mb-3">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Display Name</label>
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      <p className="text-sm font-medium">{profile?.display_name || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      <p className="text-sm font-medium break-all">{profile?.email || user?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">First Name</label>
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      <p className="text-sm font-medium">{profile?.first_name || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Name</label>
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      <p className="text-sm font-medium">{profile?.last_name || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
