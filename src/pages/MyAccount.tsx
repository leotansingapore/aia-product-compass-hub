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
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">My Account</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your profile, security settings, and preferences
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
            <ProtectedTabTrigger tabId="profile">
              <TabsTrigger value="profile" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <User className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
            </ProtectedTabTrigger>
            <ProtectedTabTrigger tabId="security">
              <TabsTrigger value="security" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Shield className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
            </ProtectedTabTrigger>
            <ProtectedTabTrigger tabId="preferences">
              <TabsTrigger value="preferences" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Settings className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
            </ProtectedTabTrigger>
            {isMasterAdmin() && (
              <ProtectedTabTrigger tabId="admin">
                <TabsTrigger value="admin" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                  <Users className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Admin</span>
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