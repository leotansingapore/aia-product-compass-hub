import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { ProfileSection } from "@/components/account/ProfileSection";
import { SecuritySection } from "@/components/account/SecuritySection";

import { PageLayout, StructuredData } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { ProtectedPage } from "@/components/ProtectedPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";

export default function MyAccount() {
  const { isAdmin: isAdminUser } = useAdmin();
  const { user } = useAuth();
  const navigate = useNavigate();

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

  return (
    <ProtectedPage pageId="my-account">
      <PageLayout
        title="My Account - Profile & Settings | FINternship"
        description="Manage your FINternship learning platform account. Update profile information, security settings and access admin tools."
        canonical={`${window.location.origin}/my-account`}
        structuredData={structuredData}
        noIndex
      >
        <BrandedPageHeader
          title="👤 My Account"
          subtitle="Manage your profile and security settings"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "My Account" }
          ]}
        />

        <main role="main" aria-label="Account management" className="mx-auto max-w-4xl px-4 sm:px-6 py-4 sm:py-8 md:pb-10 space-y-6">
          {/* Admin Panel Button */}
          {isAdminUser && (
            <Button
              variant="outline"
              className="w-full h-12 text-sm font-semibold gap-2 border-primary/30 bg-primary/5 hover:bg-primary/10"
              onClick={() => navigate("/admin")}
            >
              <Settings className="h-4 w-4" />
              Go to Admin Panel
            </Button>
          )}

          <ProfileSection />

          

          <Separator />

          <SecuritySection />
        </main>
      </PageLayout>
    </ProtectedPage>
  );
}
