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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Key, Loader2, Copy, Eye, EyeOff } from "lucide-react";
import type { UnifiedUser } from "@/hooks/useUserManagement";

interface PasswordResetDialogProps {
  user: UnifiedUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PasswordResetDialog({ user, open, onOpenChange, onSuccess }: PasswordResetDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!user) return null;

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let result = "";
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempPassword(result);
  };

  const handleSendResetLink = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data, error } = await supabase.functions.invoke('generate-password-reset-link', {
        body: { email: user.email, send: true },
        headers: { Authorization: `Bearer ${session.access_token}`, "x-app-origin": window.location.origin },
      });

      if (error) throw error;

      const { resetUrl, emailSent } = (data as any) ?? {};
      if (resetUrl) {
        try {
          await navigator.clipboard.writeText(resetUrl);
        } catch {}
      }

      toast({
        title: emailSent ? '📧 Reset Link Sent' : 'Link Generated',
        description: emailSent
          ? `Password reset instructions have been sent to ${user.email}`
          : 'Email delivery unavailable. Reset link copied to clipboard.',
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error sending reset link:', error);
      toast({
        title: "Error",
        description: "Failed to send reset link",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetTempPassword = async () => {
    if (!tempPassword || tempPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-change-user-password', {
        body: { userId: user.id, newPassword: tempPassword, syncToGrowingAge: true },
      });

      if (error) throw error;

      const ga = (data as any)?.growingAge;
      const syncMsg = ga?.success
        ? ' Also updated on growing-age-calculator.'
        : ga?.skipped
          ? ' (No matching user on growing-age-calculator.)'
          : ga?.error
            ? ` Growing-age sync failed: ${ga.error}`
            : '';

      toast({
        title: '✅ Password Updated',
        description: `Temporary password set on Product Compass Hub.${syncMsg} Share it securely with the user.`,
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error setting temp password:', error);
      toast({
        title: "Error",
        description: "Failed to set temporary password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tempPassword);
      toast({
        title: "Copied to clipboard",
        description: "Password copied successfully",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the password manually",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            Reset password for <Badge variant="outline" className="mx-1">{user.email}</Badge>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              Email Reset
            </TabsTrigger>
            <TabsTrigger value="temp" className="gap-2">
              <Key className="h-4 w-4" />
              Set Temporary
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Send a password reset link to the user's email address. The user will receive 
              instructions to create a new password.
            </div>
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleSendResetLink}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Send Reset Link
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="temp" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Set a temporary password that you can share with the user. 
              They should change it after their first login.
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="temp-password">Temporary Password</Label>
                <div className="flex gap-2 mt-1">
                  <div className="relative flex-1">
                    <Input
                      id="temp-password"
                      type={showPassword ? "text" : "password"}
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      placeholder="Enter temporary password"
                      className="pr-16"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      {tempPassword && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={copyToClipboard}
                          aria-label="Copy password to clipboard"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-micro text-muted-foreground mt-1">
                  Minimum 6 characters required
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateRandomPassword}
                  className="text-micro"
                >
                  Generate Random
                </Button>
              </div>
              
              <Button 
                onClick={handleSetTempPassword}
                disabled={loading || !tempPassword || tempPassword.length < 6}
                className="w-full gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Key className="h-4 w-4" />
                )}
                Set Temporary Password
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}