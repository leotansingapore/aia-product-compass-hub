import { useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import { ProfileSection } from "@/components/account/ProfileSection";
import { SecuritySection } from "@/components/account/SecuritySection";
import { PreferencesSection } from "@/components/account/PreferencesSection";
import { UserManagementSection } from "@/components/account/UserManagementSection";
import { AccountTabs } from "@/components/account/AccountTabs";
import { PageLayout, StructuredData } from "@/components/layout/PageLayout";
import { ProtectedPage } from "@/components/ProtectedPage";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Shield, Settings, Users, Lock } from "lucide-react";

export default function MyAccount() {
  const { isMasterAdmin, hasRole } = usePermissions();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) {
    return (
      <ProtectedPage pageId="my-account">
        <PageLayout
          title="My Account - Access Required | FINternship"
          description="Account access required to view profile and settings."
          noIndex
        >
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
        </PageLayout>
      </ProtectedPage>
    );
  }

  const structuredData: StructuredData = {
    "@context": "https://schema.org" as const,
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
  };

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: <User className="h-5 w-5" />,
      component: <ProfileSection />,
      protected: true
    },
    {
      id: "security",
      label: "Security",
      icon: <Shield className="h-5 w-5" />,
      component: <SecuritySection />,
      protected: true
    },
    {
      id: "preferences",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      component: <PreferencesSection />,
      protected: true
    },
    {
      id: "admin",
      label: "Admin",
      icon: <Users className="h-5 w-5" />,
      component: <UserManagementSection />,
      protected: true,
      condition: isMasterAdmin() || hasRole('admin')
    }
  ];

  return (
    <ProtectedPage pageId="my-account">
      <PageLayout
        title="My Account - Profile & Settings | FINternship"
        description="Manage your FINternship learning platform account. Update profile information, security settings, preferences, and access admin tools for comprehensive account management."
        keywords="account settings, profile management, security settings, user preferences, admin tools, learning platform account"
        canonical={`${window.location.origin}/my-account`}
        structuredData={structuredData}
        noIndex
      >
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
          <AccountTabs 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={tabs}
          />
        </div>
        
        {/* Mobile-friendly bottom padding for tab bar */}
        <div className="h-20 sm:h-0"></div>
      </PageLayout>
    </ProtectedPage>
  );
}