import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, X, Users } from "lucide-react";

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

interface RoleSelectorProps {
  user: User;
  onSave: (roles: string[]) => void;
  onCancel: () => void;
}

const availableRoles = [
  {
    id: 'user',
    name: 'User',
    description: 'Basic user access (always required)',
    color: 'bg-gray-500',
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'CMFAS Exams access only',
    color: 'bg-blue-500',
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'CMFAS Exams + Investment Products',
    color: 'bg-amber-500',
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'CMFAS Exams + Investment & Endowment Products',
    color: 'bg-emerald-500',
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'User management and advanced features',
    color: 'bg-red-500',
  },
  {
    id: 'master_admin',
    name: 'Master Admin',
    description: 'Full system access and user management',
    color: 'bg-purple-500',
  },
];

export function RoleSelector({ user, onSave, onCancel }: RoleSelectorProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles);

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(r => r !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const displayName = user.profile?.display_name || 
    `${user.profile?.first_name || ''} ${user.profile?.last_name || ''}`.trim() || 
    user.email.split('@')[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Manage Roles for {displayName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {availableRoles.map((role) => (
            <div key={role.id} className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
              <Checkbox
                id={role.id}
                checked={selectedRoles.includes(role.id)}
                onCheckedChange={() => handleRoleToggle(role.id)}
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${role.color}`}></div>
                  <Label htmlFor={role.id} className="text-sm font-medium cursor-pointer">
                    {role.name}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {role.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Roles:</Label>
          <div className="flex flex-wrap gap-2">
            {selectedRoles.map(role => (
              <Badge key={role} variant="outline" className="capitalize">
                {role.replace('_', ' ')}
              </Badge>
            ))}
            {selectedRoles.length === 0 && (
              <span className="text-sm text-muted-foreground">No roles selected</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => onSave(selectedRoles)}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}