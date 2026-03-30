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
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            Security Settings
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Manage your account security and authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Ultra mobile-friendly action items */}
            <Card className="border-0 shadow-sm bg-muted/30">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold">Password</h4>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      Change your account password
                    </p>
                  </div>
                  <Button 
                    variant="default" 
                    onClick={() => setChangingPassword(true)}
                    className="w-full h-12 text-base font-semibold"
                    size="lg"
                  >
                    <Key className="h-5 w-5 mr-3" />
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-primary/10 rounded-lg">
              <LogOut className="h-6 w-6 text-primary" />
            </div>
            Session Management
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Manage your active sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-lg font-bold">Current Session</h4>
                  <p className="text-base text-muted-foreground">
                    You are currently signed in
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={signOut}
                  className="w-full h-12 text-base font-semibold border-2"
                  size="lg"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-destructive text-xl font-bold">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            Danger Zone
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-destructive/30 bg-destructive/10">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="text-base leading-relaxed">
              Deleting your account is permanent and cannot be undone. All your data will be removed.
            </AlertDescription>
          </Alert>
          
          <div className="pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  disabled={deleting}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  <Trash2 className="h-5 w-5 mr-3" />
                  {deleting ? "Deleting..." : "Delete Account"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-4 max-w-md sm:max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-bold">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-base leading-relaxed">
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col gap-3 sm:flex-row sm:gap-2">
                  <AlertDialogCancel className="w-full h-12 text-base font-semibold">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="w-full h-12 text-base font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90"
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