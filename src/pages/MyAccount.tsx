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
      <div className="min-h-screen bg-background">
        {/* Mobile-first container with proper spacing */}
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-6xl">
          {/* Header section - optimized for mobile */}
          <div className="space-y-2 mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">My Account</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your profile, security settings, and preferences
            </p>
          </div>

          {/* Mobile-optimized tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
            {/* Mobile-first tab list with better touch targets */}
            <div className="w-full overflow-x-auto pb-2">
              <TabsList className="inline-flex h-auto p-1 bg-muted/50 rounded-lg min-w-full sm:min-w-0 sm:grid sm:grid-cols-2 lg:grid-cols-4">
                <ProtectedTabTrigger tabId="profile">
                  <TabsTrigger 
                    value="profile" 
                    className="flex-shrink-0 min-w-[100px] sm:min-w-0 px-4 py-3 text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md whitespace-nowrap"
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </div>
                  </TabsTrigger>
                </ProtectedTabTrigger>
                
                <ProtectedTabTrigger tabId="security">
                  <TabsTrigger 
                    value="security" 
                    className="flex-shrink-0 min-w-[100px] sm:min-w-0 px-4 py-3 text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md whitespace-nowrap"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Security</span>
                    </div>
                  </TabsTrigger>
                </ProtectedTabTrigger>
                
                <ProtectedTabTrigger tabId="preferences">
                  <TabsTrigger 
                    value="preferences" 
                    className="flex-shrink-0 min-w-[100px] sm:min-w-0 px-4 py-3 text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md whitespace-nowrap"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <span>Preferences</span>
                    </div>
                  </TabsTrigger>
                </ProtectedTabTrigger>
                
                {isMasterAdmin() && (
                  <ProtectedTabTrigger tabId="admin">
                    <TabsTrigger 
                      value="admin" 
                      className="flex-shrink-0 min-w-[100px] sm:min-w-0 px-4 py-3 text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md whitespace-nowrap"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Admin</span>
                      </div>
                    </TabsTrigger>
                  </ProtectedTabTrigger>
                )}
              </TabsList>
            </div>

            {/* Tab content with mobile spacing */}
            <TabsContent value="profile" className="space-y-4 sm:space-y-6 mt-4">
              <ProtectedTab tabId="profile">
                <ProfileSection />
              </ProtectedTab>
            </TabsContent>

            <TabsContent value="security" className="space-y-4 sm:space-y-6 mt-4">
              <ProtectedTab tabId="security">
                <SecuritySection />
              </ProtectedTab>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4 sm:space-y-6 mt-4">
              <ProtectedTab tabId="preferences">
                <PreferencesSection />
              </ProtectedTab>
            </TabsContent>

            {isMasterAdmin() && (
              <TabsContent value="admin" className="space-y-4 sm:space-y-6 mt-4">
                <ProtectedTab tabId="admin">
                  <UserManagementSection />
                </ProtectedTab>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </ProtectedPage>
  );
}