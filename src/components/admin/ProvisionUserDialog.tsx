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
import { Zap, Loader2, User, Shield, Award, Star } from "lucide-react";
import type { UnifiedUser } from "./UnifiedUserDirectory";

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
  const [selectedTier, setSelectedTier] = useState("user");

  if (!user) return null;

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let result = "";
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempPassword(result);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'advanced': return Star;
      case 'intermediate': return Award;
      case 'basic': return Shield;
      default: return User;
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

      // Call the provision-user function
      const { error } = await supabase.functions.invoke('provision-user', {
        body: { 
          request_id: user.approval_request_id,
          temp_password: tempPassword,
          initial_tier: selectedTier === 'user' ? null : selectedTier
        },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      toast({
        title: '✅ User Provisioned',
        description: `${user.email} has been provisioned successfully with ${selectedTier} access.`,
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error provisioning user:', error);
      toast({
        title: "Error",
        description: "Failed to provision user account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const TierIcon = getTierIcon(selectedTier);

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
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger className="mt-1">
                <div className="flex items-center gap-2">
                  <TierIcon className="h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Standard User
                  </div>
                </SelectItem>
                <SelectItem value="basic">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Basic Tier
                  </div>
                </SelectItem>
                <SelectItem value="intermediate">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Intermediate Tier
                  </div>
                </SelectItem>
                <SelectItem value="advanced">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Advanced Tier
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
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
            <p className="text-xs text-muted-foreground mt-1">
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