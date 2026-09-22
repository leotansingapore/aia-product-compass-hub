import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { SecurityForm } from "./SecurityForm";
import { Shield, Key, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Account deletion is deliberately NOT offered here. The previous handler only
// signed the user out while telling them "your account deletion request has
// been processed" - nothing was ever deleted. Real deletion needs a server-side
// flow plus a retention decision, so until that exists the UI must not claim it.
export function SecuritySection() {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [changingPassword, setChangingPassword] = useState(false);

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
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Ultra mobile-friendly action items */}
            <Card className="border-0 shadow-sm bg-muted/30">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-bold">Password</h4>
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
        </CardHeader>
        <CardContent>
          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h4 className="text-lg font-bold">Current Session</h4>
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

    </div>
  );
}