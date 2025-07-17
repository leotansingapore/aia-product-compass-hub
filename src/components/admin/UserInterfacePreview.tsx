import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Edit, 
  BookOpen, 
  Users, 
  Star,
  Settings,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email?: string;
  roles?: string[];
}

interface Section {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface UserPermission {
  user_id: string;
  section_id: string;
  permission_type: string;
  lock_message?: string;
}

interface UserInterfacePreviewProps {
  selectedUser: User | null;
  sections: Section[];
  permissions: UserPermission[];
  onPermissionUpdate: () => void;
}

export function UserInterfacePreview({ 
  selectedUser, 
  sections, 
  permissions, 
  onPermissionUpdate 
}: UserInterfacePreviewProps) {
  const { toast } = useToast();
  const [lockMessage, setLockMessage] = useState('');

  if (!selectedUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Interface Preview</CardTitle>
          <CardDescription>
            Select a user above to preview their interface and manage section permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No user selected</p>
        </CardContent>
      </Card>
    );
  }

  const getUserPermission = (sectionId: string): UserPermission | null => {
    return permissions.find(p => p.user_id === selectedUser.id && p.section_id === sectionId) || null;
  };

  const getPermissionType = (sectionId: string): string => {
    const permission = getUserPermission(sectionId);
    return permission?.permission_type || 'view';
  };

  const updateSectionPermission = async (sectionId: string, permissionType: string, lockMsg?: string) => {
    try {
      if (permissionType === 'view') {
        // Remove permission (default to view)
        const { error } = await supabase
          .from('user_section_permissions')
          .delete()
          .eq('user_id', selectedUser.id)
          .eq('section_id', sectionId);

        if (error) throw error;
      } else {
        // Upsert permission
        const { error } = await supabase
          .from('user_section_permissions')
          .upsert({
            user_id: selectedUser.id,
            section_id: sectionId,
            permission_type: permissionType,
            lock_message: lockMsg || null
          }, { onConflict: 'user_id,section_id' });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Section permission updated successfully",
      });

      onPermissionUpdate();
    } catch (error) {
      console.error('Error updating section permission:', error);
      toast({
        title: "Error",
        description: "Failed to update section permission",
        variant: "destructive",
      });
    }
  };

  const getPermissionIcon = (permissionType: string) => {
    switch (permissionType) {
      case 'hidden': return <EyeOff className="h-4 w-4" />;
      case 'locked': return <Lock className="h-4 w-4" />;
      case 'read_only': return <Eye className="h-4 w-4" />;
      case 'edit': return <Edit className="h-4 w-4" />;
      default: return <Unlock className="h-4 w-4" />;
    }
  };

  const getPermissionColor = (permissionType: string) => {
    switch (permissionType) {
      case 'hidden': return 'destructive';
      case 'locked': return 'secondary';
      case 'read_only': return 'outline';
      case 'edit': return 'default';
      default: return 'default';
    }
  };

  const getSectionIcon = (category: string) => {
    switch (category) {
      case 'learning': return <BookOpen className="h-5 w-5" />;
      case 'admin': return <Shield className="h-5 w-5" />;
      case 'settings': return <Settings className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const groupedSections = sections.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, Section[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Interface Preview for {selectedUser.email}
          </CardTitle>
          <CardDescription>
            This shows what the selected user sees in their interface. Toggle permissions to lock/unlock sections.
          </CardDescription>
          <div className="flex gap-2">
            {selectedUser.roles?.map(role => (
              <Badge key={role} variant="outline">{role}</Badge>
            )) || <Badge variant="outline">user</Badge>}
          </div>
        </CardHeader>
      </Card>

      {Object.entries(groupedSections).map(([category, categorySections]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 capitalize">
              {getSectionIcon(category)}
              {category} Sections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categorySections.map(section => {
              const permissionType = getPermissionType(section.id);
              const permission = getUserPermission(section.id);
              const isHidden = permissionType === 'hidden';
              const isLocked = permissionType === 'locked';
              const isReadOnly = permissionType === 'read_only';

              return (
                <div key={section.id} className="space-y-3">
                  <div className={`border rounded-lg p-4 ${isHidden ? 'opacity-50 bg-muted' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{section.name}</h4>
                        <Badge variant={getPermissionColor(permissionType)} className="flex items-center gap-1">
                          {getPermissionIcon(permissionType)}
                          {permissionType}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`permission-${section.id}`} className="text-sm">
                          Permission:
                        </Label>
                        <select
                          id={`permission-${section.id}`}
                          value={permissionType}
                          onChange={(e) => updateSectionPermission(section.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="view">Full Access</option>
                          <option value="read_only">Read Only</option>
                          <option value="locked">Locked</option>
                          <option value="hidden">Hidden</option>
                        </select>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">{section.description}</p>

                    {isHidden && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                        <div className="flex items-center gap-2 text-destructive">
                          <EyeOff className="h-4 w-4" />
                          <span className="text-sm font-medium">Hidden from user</span>
                        </div>
                        <p className="text-xs text-destructive/80 mt-1">
                          This section will not appear in the user's interface.
                        </p>
                      </div>
                    )}

                    {isLocked && (
                      <div className="bg-secondary/50 border border-secondary rounded p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          <span className="text-sm font-medium">Section Locked</span>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`lock-message-${section.id}`} className="text-xs">
                            Lock Message:
                          </Label>
                          <Textarea
                            id={`lock-message-${section.id}`}
                            value={permission?.lock_message || ''}
                            onChange={(e) => setLockMessage(e.target.value)}
                            onBlur={() => {
                              if (lockMessage !== (permission?.lock_message || '')) {
                                updateSectionPermission(section.id, 'locked', lockMessage);
                              }
                            }}
                            placeholder="Enter custom lock message..."
                            className="text-xs h-16"
                          />
                        </div>
                        {permission?.lock_message && (
                          <div className="bg-background border rounded p-2">
                            <p className="text-xs text-muted-foreground">
                              User sees: "{permission.lock_message}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {isReadOnly && (
                      <div className="bg-amber-50 border border-amber-200 rounded p-3">
                        <div className="flex items-center gap-2 text-amber-700">
                          <Eye className="h-4 w-4" />
                          <span className="text-sm font-medium">Read Only Access</span>
                        </div>
                        <p className="text-xs text-amber-600 mt-1">
                          User can view content but cannot make changes.
                        </p>
                      </div>
                    )}

                    {permissionType === 'view' && (
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <div className="flex items-center gap-2 text-green-700">
                          <Unlock className="h-4 w-4" />
                          <span className="text-sm font-medium">Full Access</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          User has complete access to this section.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}