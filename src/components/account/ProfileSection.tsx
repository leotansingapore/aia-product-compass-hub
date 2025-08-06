import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
        // Create a default profile if none exists
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
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          {/* Mobile-stacked header */}
          <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                Your personal information and learning progress
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setEditing(true)}
              className="w-full sm:w-auto"
              size="sm"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Mobile-friendly profile header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {profile?.display_name?.charAt(0)?.toUpperCase() || 
                 profile?.first_name?.charAt(0)?.toUpperCase() || 
                 user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left space-y-1 sm:space-y-2">
              <h3 className="text-lg sm:text-xl font-semibold">
                {profile?.display_name || 
                 `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 
                 'User'}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {profile?.email || user?.email}
              </p>
            </div>
          </div>

          {/* Mobile-responsive stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card className="border-0 shadow-sm bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Current Level</p>
                    <p className="text-lg sm:text-2xl font-bold">{profile?.current_level || 1}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total XP</p>
                    <p className="text-lg sm:text-2xl font-bold">{profile?.total_xp || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-muted/30 sm:col-span-1 col-span-1">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Streak Days</p>
                    <p className="text-lg sm:text-2xl font-bold">{profile?.streak_days || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile-responsive information grid */}
          <div className="space-y-4">
            <h4 className="font-medium text-base sm:text-lg">Personal Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">Display Name</label>
                <p className="text-sm sm:text-base bg-muted/30 p-3 rounded-md">
                  {profile?.display_name || 'Not set'}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm sm:text-base bg-muted/30 p-3 rounded-md break-all">
                  {profile?.email || user?.email}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">First Name</label>
                <p className="text-sm sm:text-base bg-muted/30 p-3 rounded-md">
                  {profile?.first_name || 'Not set'}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">Last Name</label>
                <p className="text-sm sm:text-base bg-muted/30 p-3 rounded-md">
                  {profile?.last_name || 'Not set'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}