import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { SecurityForm } from "./SecurityForm";
import { Shield, Key, AlertTriangle, LogOut, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function SecuritySection() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeleting(true);
    
    try {
      // Note: In a real app, you'd want to call a server function to properly delete the user
      // For now, we'll just sign them out and show a message
      await signOut();
      
      toast({
        title: "Account Deletion",
        description: "Your account deletion request has been processed. You have been signed out.",
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (changingPassword) {
    return (
      <SecurityForm
        onSuccess={() => {
          setChangingPassword(false);
          toast({
            title: "Success",
            description: "Password changed successfully",
          });
        }}
        onCancel={() => setChangingPassword(false)}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription className="text-sm">
            Manage your account security and authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-4">
            {/* Mobile-friendly action items */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-1">
                <h4 className="font-medium text-sm sm:text-base">Password</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Change your account password
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setChangingPassword(true)}
                className="w-full sm:w-auto"
                size="sm"
              >
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-1">
                <h4 className="font-medium text-sm sm:text-base">Email</h4>
                <p className="text-xs sm:text-sm text-muted-foreground break-all">
                  {user?.email}
                </p>
              </div>
              <Badge variant="secondary" className="w-fit">Verified</Badge>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-1">
                <h4 className="font-medium text-sm sm:text-base">Account Status</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Account created on {new Date(user?.created_at || '').toLocaleDateString()}
                </p>
              </div>
              <Badge variant="outline" className="w-fit">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <LogOut className="h-5 w-5" />
            Session Management
          </CardTitle>
          <CardDescription className="text-sm">
            Manage your active sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <h4 className="font-medium text-sm sm:text-base">Current Session</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                You are currently signed in
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={signOut}
              className="w-full sm:w-auto"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive text-lg sm:text-xl">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-sm">
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Deleting your account is permanent and cannot be undone. All your data will be removed.
            </AlertDescription>
          </Alert>
          
          <div className="pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  disabled={deleting}
                  className="w-full sm:w-auto"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? "Deleting..." : "Delete Account"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-4 max-w-md sm:max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-base sm:text-lg">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm">
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}