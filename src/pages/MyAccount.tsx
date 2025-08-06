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
        {/* Ultra mobile-friendly container */}
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 max-w-4xl">
          {/* Larger mobile header */}
          <div className="space-y-3 mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">My Account</h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Manage your profile, security settings, and preferences
            </p>
          </div>

          {/* Ultra mobile-optimized tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-8">
            {/* Mobile-first tab navigation with larger touch targets */}
            <div className="w-full">
              <div className="flex overflow-x-auto pb-3 scrollbar-hide">
                <div className="flex gap-2 min-w-max px-1">
                  <ProtectedTabTrigger tabId="profile">
                    <TabsTrigger 
                      value="profile" 
                      className="flex-shrink-0 min-w-[120px] px-6 py-4 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-muted/50 hover:bg-muted rounded-xl transition-all duration-200 min-h-[56px]"
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5" />
                        <span className="font-semibold">Profile</span>
                      </div>
                    </TabsTrigger>
                  </ProtectedTabTrigger>
                  
                  <ProtectedTabTrigger tabId="security">
                    <TabsTrigger 
                      value="security" 
                      className="flex-shrink-0 min-w-[120px] px-6 py-4 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-muted/50 hover:bg-muted rounded-xl transition-all duration-200 min-h-[56px]"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5" />
                        <span className="font-semibold">Security</span>
                      </div>
                    </TabsTrigger>
                  </ProtectedTabTrigger>
                  
                  <ProtectedTabTrigger tabId="preferences">
                    <TabsTrigger 
                      value="preferences" 
                      className="flex-shrink-0 min-w-[120px] px-6 py-4 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-muted/50 hover:bg-muted rounded-xl transition-all duration-200 min-h-[56px]"
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="h-5 w-5" />
                        <span className="font-semibold">Settings</span>
                      </div>
                    </TabsTrigger>
                  </ProtectedTabTrigger>
                  
                  {isMasterAdmin() && (
                    <ProtectedTabTrigger tabId="admin">
                      <TabsTrigger 
                        value="admin" 
                        className="flex-shrink-0 min-w-[120px] px-6 py-4 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-muted/50 hover:bg-muted rounded-xl transition-all duration-200 min-h-[56px]"
                      >
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5" />
                          <span className="font-semibold">Admin</span>
                        </div>
                      </TabsTrigger>
                    </ProtectedTabTrigger>
                  )}
                </div>
              </div>
            </div>

            {/* Tab content with enhanced mobile spacing */}
            <TabsContent value="profile" className="space-y-6 mt-6">
              <ProtectedTab tabId="profile">
                <ProfileSection />
              </ProtectedTab>
            </TabsContent>

            <TabsContent value="security" className="space-y-6 mt-6">
              <ProtectedTab tabId="security">
                <SecuritySection />
              </ProtectedTab>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6 mt-6">
              <ProtectedTab tabId="preferences">
                <PreferencesSection />
              </ProtectedTab>
            </TabsContent>

            {isMasterAdmin() && (
              <TabsContent value="admin" className="space-y-6 mt-6">
                <ProtectedTab tabId="admin">
                  <UserManagementSection />
                </ProtectedTab>
              </TabsContent>
            )}
          </Tabs>
        </div>
        
        {/* Mobile-friendly bottom padding for tab bar */}
        <div className="h-20 sm:h-0"></div>
      </div>
    </ProtectedPage>
  );
}