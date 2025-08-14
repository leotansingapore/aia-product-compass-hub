import { useState } from "react";
import { Helmet } from "react-helmet-async";
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
  const { isMasterAdmin, hasRole } = usePermissions();
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
        <Helmet>
          <title>My Account - Profile & Settings | FINternship</title>
          <meta name="description" content="Manage your FINternship learning platform account. Update profile information, security settings, preferences, and access admin tools for comprehensive account management." />
          <meta name="keywords" content="account settings, profile management, security settings, user preferences, admin tools, learning platform account" />
          <link rel="canonical" href={`${window.location.origin}/my-account`} />
          <meta name="robots" content="noindex, nofollow" />
          
          {/* Open Graph */}
          <meta property="og:title" content="My Account - Profile & Settings | FINternship" />
          <meta property="og:description" content="Manage your learning platform account settings, profile, and preferences." />
          <meta property="og:type" content="profile" />
          <meta property="og:url" content={`${window.location.origin}/my-account`} />
          <meta property="og:image" content={`${window.location.origin}/og-default.jpg`} />
          
          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="My Account - Profile & Settings | FINternship" />
          <meta name="twitter:description" content="Manage your learning platform account settings and preferences." />
          <meta name="twitter:image" content={`${window.location.origin}/og-default.jpg`} />
          
          {/* Structured Data */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfilePage",
              "name": "My Account - FINternship",
              "description": "User account management page for FINternship Learning Platform",
              "url": `${window.location.origin}/my-account`,
              "isPartOf": {
                "@type": "WebSite",
                "name": "FINternship Learning Platform",
                "url": window.location.origin
              },
              "mainEntity": {
                "@type": "Person",
                "name": user?.user_metadata?.display_name || user?.email || "User"
              }
            })}
          </script>
        </Helmet>
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
                <TabsList className="flex gap-2 min-w-max px-1 h-auto bg-transparent">
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
                  
                  {(isMasterAdmin() || hasRole('admin')) && (
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
                </TabsList>
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

            {(isMasterAdmin() || hasRole('admin')) && (
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