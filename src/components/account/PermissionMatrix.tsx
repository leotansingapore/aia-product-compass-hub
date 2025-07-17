import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, X, Save, Plus, Trash2 } from "lucide-react";

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

interface Permission {
  id: string;
  section_id: string;
  permission_type: string;
  lock_message: string | null;
  section_name?: string;
}

interface PermissionMatrixProps {
  user: User | null;
  onClose: () => void;
}

const permissionTypes = [
  { value: 'hidden', label: 'Hidden', description: 'User cannot see this section' },
  { value: 'locked', label: 'Locked', description: 'User can see but cannot access' },
  { value: 'read_only', label: 'Read Only', description: 'User can view but not edit' },
  { value: 'view', label: 'View', description: 'Full access to view and interact' },
  { value: 'edit', label: 'Edit', description: 'Can modify and manage content' },
];

export function PermissionMatrix({ user, onClose }: PermissionMatrixProps) {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSectionId, setNewSectionId] = useState("");
  const [newPermissionType, setNewPermissionType] = useState("view");
  const [newLockMessage, setNewLockMessage] = useState("");

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('app_sections')
        .select('*')
        .order('category', { ascending: true });

      if (sectionsError) throw sectionsError;
      setSections(sectionsData || []);

      // Fetch user permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('user_section_permissions')
        .select('*')
        .eq('user_id', user.id);

      if (permissionsError) throw permissionsError;
      setPermissions(permissionsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPermission = async () => {
    if (!user || !newSectionId || !newPermissionType) return;

    try {
      const { data, error } = await supabase
        .from('user_section_permissions')
        .insert([
          {
            user_id: user.id,
            section_id: newSectionId,
            permission_type: newPermissionType,
            lock_message: newLockMessage || null,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setPermissions(prev => [...prev, data]);
      setNewSectionId("");
      setNewPermissionType("view");
      setNewLockMessage("");

      toast({
        title: "Success",
        description: "Permission added successfully",
      });
    } catch (error) {
      console.error('Error adding permission:', error);
      toast({
        title: "Error",
        description: "Failed to add permission",
        variant: "destructive",
      });
    }
  };

  const handleDeletePermission = async (permissionId: string) => {
    try {
      const { error } = await supabase
        .from('user_section_permissions')
        .delete()
        .eq('id', permissionId);

      if (error) throw error;

      setPermissions(prev => prev.filter(p => p.id !== permissionId));

      toast({
        title: "Success",
        description: "Permission removed successfully",
      });
    } catch (error) {
      console.error('Error deleting permission:', error);
      toast({
        title: "Error",
        description: "Failed to remove permission",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePermission = async (permissionId: string, updates: Partial<Permission>) => {
    try {
      const { error } = await supabase
        .from('user_section_permissions')
        .update(updates)
        .eq('id', permissionId);

      if (error) throw error;

      setPermissions(prev => prev.map(p => p.id === permissionId ? { ...p, ...updates } : p));

      toast({
        title: "Success",
        description: "Permission updated successfully",
      });
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: "Error",
        description: "Failed to update permission",
        variant: "destructive",
      });
    }
  };

  const displayName = user?.profile?.display_name || 
    `${user?.profile?.first_name || ''} ${user?.profile?.last_name || ''}`.trim() || 
    user?.email?.split('@')[0] || 'User';

  const getPermissionBadgeVariant = (type: string) => {
    switch (type) {
      case 'hidden':
        return 'destructive';
      case 'locked':
        return 'secondary';
      case 'read_only':
        return 'outline';
      case 'view':
        return 'default';
      case 'edit':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getUsedSectionIds = () => permissions.map(p => p.section_id);
  const availableSections = sections.filter(s => !getUsedSectionIds().includes(s.id));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Permissions...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permissions for {displayName}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new permission */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-medium">Add New Permission</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="section">Section</Label>
              <Select value={newSectionId} onValueChange={setNewSectionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {availableSections.map(section => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="permission">Permission</Label>
              <Select value={newPermissionType} onValueChange={setNewPermissionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {permissionTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lock-message">Lock Message</Label>
              <Input
                id="lock-message"
                placeholder="Optional message"
                value={newLockMessage}
                onChange={(e) => setNewLockMessage(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddPermission} disabled={!newSectionId}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Current permissions */}
        <div className="space-y-4">
          <h4 className="font-medium">Current Permissions</h4>
          {permissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No specific permissions set. User has default access based on their roles.
            </p>
          ) : (
            <div className="space-y-2">
              {permissions.map(permission => {
                const section = sections.find(s => s.id === permission.section_id);
                return (
                  <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{section?.name || permission.section_id}</p>
                        <p className="text-sm text-muted-foreground">{section?.category}</p>
                      </div>
                      <Badge variant={getPermissionBadgeVariant(permission.permission_type)}>
                        {permission.permission_type}
                      </Badge>
                      {permission.lock_message && (
                        <Badge variant="outline" className="text-xs">
                          {permission.lock_message}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePermission(permission.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}