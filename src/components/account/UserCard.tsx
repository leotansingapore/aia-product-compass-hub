import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, User, Award, Star, Mail, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

interface User {
  id: string;
  email: string;
  created_at: string;
  profile?: {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  roles: string[];
}

interface UserCardProps {
  user: User;
  onRoleUpdate: (userId: string, roles: string[]) => void;
}

export function UserCard({ user, onRoleUpdate }: UserCardProps) {
  const displayName = user.profile?.display_name || 
    `${user.profile?.first_name || ''} ${user.profile?.last_name || ''}`.trim() || 
    user.email.split('@')[0];

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'master_admin':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'advanced':
        return 'default';
      case 'intermediate':
        return 'secondary';
      case 'basic':
        return 'outline';
      case 'moderator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getCurrentTier = () => {
    if (user.roles.includes('master_admin')) return 'master_admin';
    if (user.roles.includes('advanced')) return 'advanced';
    if (user.roles.includes('intermediate')) return 'intermediate';
    if (user.roles.includes('basic')) return 'basic';
    return 'user';
  };

  const handleRoleToggle = (role: string) => {
    const newRoles = user.roles.includes(role)
      ? user.roles.filter(r => r !== role)
      : [...user.roles, role];
    
    onRoleUpdate(user.id, newRoles);
  };

  const handleTierChange = (newTier: string) => {
    // Remove all tier-related roles and add the new one
    const nonTierRoles = user.roles.filter(r => !['basic', 'intermediate', 'advanced'].includes(r));
    const newRoles = newTier === 'user' ? nonTierRoles : [...nonTierRoles, newTier];
    
    onRoleUpdate(user.id, newRoles);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'master_admin':
        return Shield;
      case 'advanced':
        return Star;
      case 'intermediate':
        return Award;
      case 'basic':
        return User;
      default:
        return User;
    }
  };

  const currentTier = getCurrentTier();
  const TierIcon = getTierIcon(currentTier);

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
        <div className="flex flex-wrap gap-0.5 sm:gap-1">
          {user.roles.map(role => (
            <Badge
              key={role}
              variant={getRoleBadgeVariant(role)}
              className="capitalize text-xs"
            >
              {role.replace('_', ' ')}
            </Badge>
          ))}
        </div>

        {/* Tier Management */}
        {!user.roles.includes('master_admin') && (
          <div className="flex items-center gap-1 sm:gap-2">
            <TierIcon className="hidden sm:inline-block h-4 w-4 text-muted-foreground" />
            <Select
              value={currentTier}
              onValueChange={handleTierChange}
            >
              <SelectTrigger className="w-24 sm:w-32 text-xs sm:text-sm">
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Standard</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Admin Toggle - only show if not master admin */}
        {!user.roles.includes('master_admin') && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRoleToggle('admin')}
              className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">{user.roles.includes('admin') ? 'Remove Admin' : 'Make Admin'}</span>
              <span className="sm:hidden">{user.roles.includes('admin') ? 'Remove' : 'Admin'}</span>
            </Button>
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
      </div>
    </div>
  );
}