import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Shield, User } from "lucide-react";

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
  onViewPermissions: (user: User) => void;
}

export function UserCard({ user, onRoleUpdate, onViewPermissions }: UserCardProps) {
  const displayName = user.profile?.display_name || 
    `${user.profile?.first_name || ''} ${user.profile?.last_name || ''}`.trim() || 
    user.email.split('@')[0];

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'master_admin':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'moderator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleRoleToggle = (role: string) => {
    const newRoles = user.roles.includes(role)
      ? user.roles.filter(r => r !== role)
      : [...user.roles, role];
    
    onRoleUpdate(user.id, newRoles);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.profile?.avatar_url || undefined} />
              <AvatarFallback>
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{displayName}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                Joined {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
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
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRoleToggle('admin')}
              >
                <Shield className="h-4 w-4 mr-1" />
                {user.roles.includes('admin') ? 'Remove Admin' : 'Make Admin'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewPermissions(user)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Permissions
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}