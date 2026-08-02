import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Zap, Loader2 } from "lucide-react";
import { generateSecurePassword } from "@/lib/generatePassword";
import { TIER_LEVELS, TIER_META, DEFAULT_TIER, type TierLevel } from "@/lib/tiers";
import type { UnifiedUser } from "@/hooks/useUserManagement";

interface ProvisionUserDialogProps {
  user: UnifiedUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ProvisionUserDialog({ user, open, onOpenChange, onSuccess }: ProvisionUserDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [selectedTier, setSelectedTier] = useState<TierLevel>(DEFAULT_TIER);

  if (!user) return null;

  const generateRandomPassword = () => {
    try {
      setTempPassword(generateSecurePassword(12));
    } catch (error: any) {
      toast({
        title: 'Could not generate password',
        description: error?.message || 'Secure random generation is unavailable. Enter a password manually.',
        variant: 'destructive',
      });
    }
  };


  const handleProvisionUser = async () => {
    if (!tempPassword || tempPassword.length < 6) {
      toast({
        title: 'Password Required',
        description: 'Please set a temporary password (minimum 6 characters).',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      // Field names must match what create-user-account reads (firstName/lastName/tier).
      // Sending first_name/last_name/no tier meant the names were dropped and every
      // provisioned user silently landed on the default tier.
      const { data, error } = await supabase.functions.invoke('create-user-account', {
        body: {
          email: user.email,
          password: tempPassword,
          firstName: user.profile?.first_name || '',
          lastName: user.profile?.last_name || '',
          tier: selectedTier,
        },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      // The function returns 200 with { error } for handled failures.
      if (data?.error) throw new Error(data.error);

      const newUserId = data?.user?.id;
      if (!newUserId) throw new Error('The account was not created — no user id came back.');

      // Mark approval request as approved.
      if (user.approval_request_id) {
        const { data: approvalRows, error: approvalError } = await supabase
          .from('user_approval_requests')
          .update({ status: 'approved', reviewed_at: new Date().toISOString() })
          .eq('id', user.approval_request_id)
          .select('id');

        if (approvalError) throw approvalError;
        // RLS can filter an UPDATE to zero rows while returning error === null.
        if (!approvalRows || approvalRows.length === 0) {
          throw new Error(
            `Account created for ${user.email}, but the approval request could not be marked approved (no permission or the request no longer exists). Update it manually.`,
          );
        }
      }

      toast({
        title: '✅ User Provisioned',
        description: `${user.email} has been provisioned successfully with ${TIER_META[selectedTier].label} access.`,
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error provisioning user:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to provision user account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const TierIcon = TIER_META[selectedTier].icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Provision User Account
          </DialogTitle>
          <DialogDescription>
            Create account and assign access level for <Badge variant="outline" className="mx-1">{user.email}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              This user has been approved but doesn't have an active account yet. 
              Provisioning will create their account and assign the selected access level.
            </p>
          </div>

          <div>
            <Label htmlFor="access-tier">Access Level</Label>
            <Select value={selectedTier} onValueChange={(v) => setSelectedTier(v as TierLevel)}>
              <SelectTrigger className="mt-1">
                <div className="flex items-center gap-2">
                  <TierIcon className="h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {TIER_LEVELS.map((t) => {
                  const Icon = TIER_META[t].icon;
                  return (
                    <SelectItem key={t} value={t}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {TIER_META[t].label} — {TIER_META[t].description}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p className="text-micro text-muted-foreground mt-1">
              Select the initial access level for this user
            </p>
          </div>

          <div>
            <Label htmlFor="provision-password">Temporary Password</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="provision-password"
                type="text"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                placeholder="Enter temporary password"
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateRandomPassword}
                className="whitespace-nowrap"
              >
                Generate
              </Button>
            </div>
            <p className="text-micro text-muted-foreground mt-1">
              User should change this password after first login
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleProvisionUser}
              disabled={loading || !tempPassword || tempPassword.length < 6}
              className="flex-1 gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Provision Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}