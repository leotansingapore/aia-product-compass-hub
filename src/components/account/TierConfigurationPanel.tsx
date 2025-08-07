import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X, Settings, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TierConfigurationPanelProps {
  onClose: () => void;
}

interface TierPermission {
  id: string;
  tier_level: string;
  access_type: string;
  resource_id: string;
}

const TIERS = [
  { id: 'basic', name: 'Basic', color: 'bg-blue-500' },
  { id: 'intermediate', name: 'Intermediate', color: 'bg-amber-500' },
  { id: 'advanced', name: 'Advanced', color: 'bg-emerald-500' },
];

const AVAILABLE_RESOURCES = [
  { id: 'cmfas-exams', name: 'CMFAS Exams', type: 'page' },
  { id: 'roleplay', name: 'Roleplay Training', type: 'page' },
  { id: 'product-categories', name: 'Product Categories', type: 'section' },
  { id: 'product-category', name: 'Product Category Pages', type: 'page' },
];

export function TierConfigurationPanel({ onClose }: TierConfigurationPanelProps) {
  const [tierPermissions, setTierPermissions] = useState<TierPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTierPermissions();
  }, []);

  const fetchTierPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('tier_permissions')
        .select('*');

      if (error) {
        console.error('Error fetching tier permissions:', error);
        toast.error('Failed to load tier permissions');
      } else {
        setTierPermissions(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (tierLevel: string, resourceId: string): boolean => {
    return tierPermissions.some(
      p => p.tier_level === tierLevel && p.resource_id === resourceId
    );
  };

  const togglePermission = async (tierLevel: string, resource: typeof AVAILABLE_RESOURCES[0]) => {
    const existingPermission = tierPermissions.find(
      p => p.tier_level === tierLevel && p.resource_id === resource.id
    );

    if (existingPermission) {
      // Remove permission
      const { error } = await supabase
        .from('tier_permissions')
        .delete()
        .eq('id', existingPermission.id);

      if (error) {
        console.error('Error removing permission:', error);
        toast.error('Failed to remove permission');
      } else {
        setTierPermissions(prev => prev.filter(p => p.id !== existingPermission.id));
        toast.success('Permission removed');
      }
    } else {
      // Add permission
      const { data, error } = await supabase
        .from('tier_permissions')
        .insert({
          tier_level: tierLevel,
          access_type: resource.type,
          resource_id: resource.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding permission:', error);
        toast.error('Failed to add permission');
      } else {
        setTierPermissions(prev => [...prev, data]);
        toast.success('Permission added');
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading tier configuration...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Tier Configuration
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Configure which resources each tier can access. Changes are saved automatically.
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Resource</th>
                {TIERS.map(tier => (
                  <th key={tier.id} className="text-center p-3 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${tier.color}`}></div>
                      {tier.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AVAILABLE_RESOURCES.map(resource => (
                <tr key={resource.id} className="border-b hover:bg-accent/50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {resource.type}
                      </Badge>
                      {resource.name}
                    </div>
                  </td>
                  {TIERS.map(tier => (
                    <td key={tier.id} className="p-3 text-center">
                      <Checkbox
                        checked={hasPermission(tier.id, resource.id)}
                        onCheckedChange={() => togglePermission(tier.id, resource)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Current Tier Definitions:</h4>
          <div className="space-y-2 text-sm">
            <div><strong>Basic:</strong> CMFAS Exams access only</div>
            <div><strong>Intermediate:</strong> CMFAS Exams + Roleplay Training</div>
            <div><strong>Advanced:</strong> CMFAS Exams + Roleplay Training + All Product Categories</div>
            <div><strong>Master Admin:</strong> Full system access (cannot be configured)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}