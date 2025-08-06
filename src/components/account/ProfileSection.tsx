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
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-6">
          {/* Ultra mobile-friendly header */}
          <div className="space-y-4">
            <div>
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-6 w-6 text-primary" />
                </div>
                Profile Information
              </CardTitle>
              <CardDescription className="text-base mt-2 leading-relaxed">
                Your personal information and learning progress
              </CardDescription>
            </div>
            <Button 
              variant="default" 
              onClick={() => setEditing(true)}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              <Edit3 className="h-5 w-5 mr-3" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Ultra mobile-friendly profile header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {profile?.display_name?.charAt(0)?.toUpperCase() || 
                 profile?.first_name?.charAt(0)?.toUpperCase() || 
                 user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">
                {profile?.display_name || 
                 `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 
                 'User'}
              </h3>
              <p className="text-base text-muted-foreground break-all px-4">
                {profile?.email || user?.email}
              </p>
            </div>
          </div>

          {/* Large mobile-friendly stats */}
          <div className="grid grid-cols-1 gap-4">
            <Card className="border-0 shadow-sm bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-yellow-500/20">
                    <Trophy className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-muted-foreground">Current Level</p>
                    <p className="text-4xl font-bold text-yellow-700 dark:text-yellow-400">{profile?.current_level || 1}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-blue-500/20">
                    <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-muted-foreground">Total XP</p>
                    <p className="text-4xl font-bold text-blue-700 dark:text-blue-400">{profile?.total_xp || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-green-500/20">
                    <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-muted-foreground">Streak Days</p>
                    <p className="text-4xl font-bold text-green-700 dark:text-green-400">{profile?.streak_days || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Large, touch-friendly information display */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold">Personal Information</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-base font-semibold text-muted-foreground">Display Name</label>
                <div className="p-4 bg-muted/50 rounded-xl border-2 border-transparent">
                  <p className="text-lg font-medium">
                    {profile?.display_name || 'Not set'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-base font-semibold text-muted-foreground">Email</label>
                <div className="p-4 bg-muted/50 rounded-xl border-2 border-transparent">
                  <p className="text-lg font-medium break-all">
                    {profile?.email || user?.email}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-base font-semibold text-muted-foreground">First Name</label>
                <div className="p-4 bg-muted/50 rounded-xl border-2 border-transparent">
                  <p className="text-lg font-medium">
                    {profile?.first_name || 'Not set'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-base font-semibold text-muted-foreground">Last Name</label>
                <div className="p-4 bg-muted/50 rounded-xl border-2 border-transparent">
                  <p className="text-lg font-medium">
                    {profile?.last_name || 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}