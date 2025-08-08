import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, User, Award, Star, Mail, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.profile?.avatar_url || undefined} />
        <AvatarFallback>
          {displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <h3 className="font-semibold">{displayName}</h3>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <p className="text-xs text-muted-foreground">
          Joined {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex flex-wrap gap-1">
          {user.roles.map(role => (
            <Badge
              key={role}
              variant={getRoleBadgeVariant(role)}
              className="capitalize"
            >
              {role.replace('_', ' ')}
            </Badge>
          ))}
        </div>
        
        {/* Tier Management */}
        {!user.roles.includes('master_admin') && (
          <div className="flex items-center gap-2">
            <TierIcon className="h-4 w-4 text-muted-foreground" />
            <Select
              value={currentTier}
              onValueChange={handleTierChange}
            >
              <SelectTrigger className="w-32">
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRoleToggle('admin')}
          >
            <Shield className="h-4 w-4 mr-1" />
            {user.roles.includes('admin') ? 'Remove Admin' : 'Make Admin'}
          </Button>
        )}
      </div>
    </div>
  );
}