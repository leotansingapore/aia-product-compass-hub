import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import { ProfileSection } from "@/components/account/ProfileSection";
import { SecuritySection } from "@/components/account/SecuritySection";
import { PreferencesSection } from "@/components/account/PreferencesSection";
import { UserManagementSection } from "@/components/account/UserManagementSection";
import { User, Shield, Settings, Users } from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { ProtectedTab, ProtectedTabTrigger } from "@/components/ProtectedTab";

export default function MyAccount() {
  const { isMasterAdmin } = usePermissions();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) {
    return (
      <ProtectedPage pageId="my-account">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You need to be logged in to access your account.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage pageId="my-account">
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-muted-foreground">
            Manage your profile, security settings, and preferences
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <ProtectedTabTrigger tabId="profile">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
            </ProtectedTabTrigger>
            <ProtectedTabTrigger tabId="security">
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
            </ProtectedTabTrigger>
            <ProtectedTabTrigger tabId="preferences">
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Preferences
              </TabsTrigger>
            </ProtectedTabTrigger>
            {isMasterAdmin() && (
              <ProtectedTabTrigger tabId="admin">
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Admin Panel
                </TabsTrigger>
              </ProtectedTabTrigger>
            )}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <ProtectedTab tabId="profile">
              <ProfileSection />
            </ProtectedTab>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <ProtectedTab tabId="security">
              <SecuritySection />
            </ProtectedTab>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <ProtectedTab tabId="preferences">
              <PreferencesSection />
            </ProtectedTab>
          </TabsContent>

          {isMasterAdmin() && (
            <TabsContent value="admin" className="space-y-6">
              <ProtectedTab tabId="admin">
                <UserManagementSection />
              </ProtectedTab>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </ProtectedPage>
  );
}