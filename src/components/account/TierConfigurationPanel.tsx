import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface TierConfigurationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TierPermission {
  id: string;
  tier_level: string;
  access_type: string;
  resource_id: string;
}

const TIERS = [
  { id: 'basic', name: 'Basic', shortName: 'B', color: 'bg-blue-500' },
  { id: 'intermediate', name: 'Intermediate', shortName: 'I', color: 'bg-amber-500' },
  { id: 'advanced', name: 'Advanced', shortName: 'A', color: 'bg-emerald-500' },
];

const AVAILABLE_RESOURCES = [
  { id: 'cmfas-exams', name: 'CMFAS Exams', type: 'page' },
  { id: 'roleplay', name: 'Roleplay Training', type: 'page' },
  { id: 'product-categories', name: 'Product Categories', type: 'section' },
  { id: 'product-category', name: 'Product Category Pages', type: 'page' },
];

export function TierConfigurationPanel({ open, onOpenChange }: TierConfigurationPanelProps) {
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

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-3 sm:p-6">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
          Tier Configuration
        </DialogTitle>
        <DialogDescription className="text-xs sm:text-sm">
          Configure which resources each tier can access. Changes are saved automatically.
        </DialogDescription>
      </DialogHeader>

      {loading ? (
        <div className="text-center py-8">Loading tier configuration...</div>
      ) : (
        <div className="space-y-6">
          {/* Mobile-only tier legend */}
          <div className="sm:hidden flex items-center justify-center gap-3 text-xs pb-2">
            {TIERS.map(tier => (
              <div key={tier.id} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${tier.color}`}></div>
                <span>{tier.shortName} = {tier.name}</span>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-1.5 sm:p-3 font-medium text-xs sm:text-sm">Resource</th>
                  {TIERS.map(tier => (
                    <th key={tier.id} className="text-center p-1.5 sm:p-3 font-medium text-xs sm:text-sm">
                      {/* Mobile: Show abbreviated name only */}
                      <span className="sm:hidden">{tier.shortName}</span>
                      {/* Desktop: Show full name with color dot */}
                      <div className="hidden sm:flex items-center justify-center gap-2">
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
                    <td className="p-1.5 sm:p-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <Badge variant="outline" className="text-[10px] sm:text-xs w-fit">
                          {resource.type}
                        </Badge>
                        <span className="text-xs sm:text-sm">{resource.name}</span>
                      </div>
                    </td>
                    {TIERS.map(tier => (
                      <td key={tier.id} className="p-1.5 sm:p-3 text-center">
                        <input
                          type="checkbox"
                          checked={hasPermission(tier.id, resource.id)}
                          onChange={() => togglePermission(tier.id, resource)}
                          className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-muted/50 p-2 sm:p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-xs sm:text-sm">Current Tier Definitions:</h4>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <div><strong>Basic:</strong> CMFAS Exams access only</div>
              <div><strong>Intermediate:</strong> CMFAS Exams + Roleplay Training</div>
              <div><strong>Advanced:</strong> CMFAS Exams + Roleplay Training + All Product Categories</div>
              <div><strong>Master Admin:</strong> Full system access (cannot be configured)</div>
            </div>
          </div>
        </div>
      )}
    </DialogContent>
  );
}