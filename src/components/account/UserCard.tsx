import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, User, Crown, Layers, Mail, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { TierBadge } from "@/components/tier/TierBadge";
import { TierControl } from "@/components/admin/TierControl";
import { normalizeTier } from "@/lib/tiers";

interface User {
  id: string;
  email: string;
  created_at: string;
  admin_role?: string;
  access_tier?: string;
  profile?: {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

interface UserCardProps {
  user: User;
  onRoleUpdate: (userId: string, roles: string[]) => void;
}

export function UserCard({ user, onRoleUpdate }: UserCardProps) {
  const displayName = user.profile?.display_name || 
    `${user.profile?.first_name || ''} ${user.profile?.last_name || ''}`.trim() || 
    user.email.split('@')[0];
  
  // Use admin_role and access_tier from props (single source of truth)
  const adminRole = user.admin_role || 'user';
  const accessTier = normalizeTier(user.access_tier);

  const handleAdminRoleChange = async (newRole: string) => {
    try {
      // Update admin role in user_admin_roles table
      const { error: deleteError } = await supabase
        .from('user_admin_roles')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('user_admin_roles')
        .insert({
          user_id: user.id,
          admin_role: newRole
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: `Admin role updated to ${newRole.replace('_', ' ')}`,
      });
      
      onRoleUpdate(user.id, [newRole]);
    } catch (error: any) {
      console.error('Error updating admin role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update admin role",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'master_admin':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'mentor':
      case 'consultant':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const [loadingAction, setLoadingAction] = useState<'reset' | 'set' | null>(null);

  const handleSendReset = async () => {
    setLoadingAction('reset');
    try {
      const { data: sessionRes } = await supabase.auth.getSession();
      if (!sessionRes?.session) throw new Error('No active session');

      const { data, error } = await supabase.functions.invoke('generate-password-reset-link', {
        body: { email: user.email, send: true },
        headers: { Authorization: `Bearer ${sessionRes.session.access_token}` },
      });
      if (error) throw error as any;

      const { resetUrl, emailSent } = (data as any) ?? {};
      if (resetUrl) {
        try {
          await navigator.clipboard.writeText(resetUrl);
        } catch {}
      }

      toast({
        title: emailSent ? 'Password reset link sent' : 'Link generated',
        description: emailSent ? 'User will receive an email shortly.' : 'Email failed; reset link copied to clipboard.',
      });
    } catch (e: any) {
      toast({ title: 'Failed to send reset link', description: e?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSetTempPassword = async () => {
    const newPassword = prompt('Enter a new temporary password (min 6 characters):');
    if (!newPassword) return;
    if (newPassword.length < 6) {
      toast({ title: 'Password too short', description: 'Must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    setLoadingAction('set');
    try {
      const { error } = await supabase.functions.invoke('admin-change-user-password', {
        body: { userId: user.id, newPassword },
      });
      if (error) throw error as any;
      toast({ title: 'Password updated', description: 'Temporary password set successfully.' });
    } catch (e: any) {
      toast({ title: 'Failed to change password', description: e?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex flex-col lg-admin:flex-row items-start lg-admin:items-center gap-2 sm:gap-4 p-2 sm:p-4 border rounded-lg">
      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
        <AvatarImage src={user.profile?.avatar_url || undefined} />
        <AvatarFallback>
          {displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate text-sm sm:text-base">{displayName}</h3>
        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        <p className="text-micro text-muted-foreground">
          Joined {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full lg-admin:w-auto">
        {/* Display Current Role & Tier Badges */}
        <div className="flex flex-wrap gap-1">
          <Badge
            variant={getRoleBadgeVariant(adminRole)}
            className="capitalize text-xs"
          >
            <Shield className="h-3 w-3 mr-1" />
            {adminRole.replace('_', ' ')}
          </Badge>
          <TierBadge tier={accessTier} compact />
        </div>

        {/* Admin Role Selector - only show if not master admin */}
        {adminRole !== 'master_admin' && (
          <div className="flex items-center gap-1">
            <Crown className="hidden sm:inline-block h-4 w-4 text-muted-foreground" />
            <Select
              value={adminRole}
              onValueChange={handleAdminRoleChange}
            >
              <SelectTrigger className="w-32 sm:w-36 text-xs sm:text-sm">
                <SelectValue placeholder="Admin Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="consultant">Consultant</SelectItem>
                <SelectItem value="mentor">Mentor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Access Tier Selector - only show if not master admin */}
        {adminRole !== 'master_admin' && (
          <div className="flex items-center gap-1">
            <Layers className="hidden sm:inline-block h-4 w-4 text-muted-foreground" />
            <TierControl userId={user.id} currentTier={accessTier} />
          </div>
        )}
        
        {/* Password Management Buttons */}
        {adminRole !== 'master_admin' && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendReset}
              disabled={loadingAction === 'reset'}
              className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">Reset Link</span>
              <span className="sm:hidden">Reset</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSetTempPassword}
              disabled={loadingAction === 'set'}
              className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Key className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">Set Temp</span>
              <span className="sm:hidden">Temp</span>
            </Button>
          </>
        )}

        {/* Master Admin Badge */}
        {adminRole === 'master_admin' && (
          <Badge variant="destructive" className="text-xs">
            <Crown className="h-3 w-3 mr-1" />
            Master Admin (Protected)
          </Badge>
        )}
      </div>
    </div>
  );
}