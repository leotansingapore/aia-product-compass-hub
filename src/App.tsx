
import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { SimplifiedAuthProvider } from "@/hooks/useSimplifiedAuth";
import { ViewModeProvider, AdminViewSwitcher } from "@/components/admin/AdminViewSwitcher";
import { AdminProvider } from "@/hooks/useAdmin";
import { OnboardingProvider } from "@/hooks/useOnboarding";
import { ChecklistProvider } from "@/hooks/useChecklistProgress";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedPage } from "@/components/ProtectedPage";
import { ProtectedAdminPage } from "@/components/ProtectedAdminPage";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { RouteTracker } from "@/components/RouteTracker";

import { OnboardingTutorial } from "@/components/onboarding/OnboardingTutorial";
import { OnboardingHelpButton } from "@/components/onboarding/OnboardingHelpButton";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import Index from "./pages/Index";
import ProductCategory from "./pages/ProductCategory";
import ProductDetail from "./pages/ProductDetail";
import HowToUsePortal from "./pages/HowToUsePortal";
import SearchByProfile from "./pages/SearchByProfile";
import ForcePasswordChange from "./pages/ForcePasswordChange";
import ResetPassword from "./pages/ResetPassword";
import Bookmarks from "./pages/Bookmarks";
import SimplifiedAuth from "./pages/SimplifiedAuth";
import ConsultantLanding from "./pages/ConsultantLanding";
import CMFASExams from "./pages/CMFASExams";
import CMFASModuleDetail from "./pages/cmfas/CMFASModuleDetail";
import CMFASVideoDetail from "./pages/cmfas/CMFASVideoDetail";
import CMFASChat from "./pages/cmfas/CMFASChat";
import Roleplay from "./pages/Roleplay";
import RoleplayFeedback from "./pages/RoleplayFeedback";
import AdminDashboard from "./pages/AdminDashboard";
import MyAccount from "./pages/MyAccount";
import NotFound from "./pages/NotFound";
import KnowledgeBase from "./pages/KnowledgeBase";
import KBCategory from "./pages/kb/KBCategory";
import KBProduct from "./pages/kb/KBProduct";
import VideoDetail from "./pages/VideoDetail";
import AwaitingApproval from "./pages/AwaitingApproval";
import ManageProductVideos from "./pages/ManageProductVideos";
import ScriptsDatabase from "./pages/ScriptsDatabase";
import Playbooks from "./pages/Playbooks";
import PlaybookDetail from "./pages/PlaybookDetail";
import ScriptFlows from "./pages/ScriptFlows";
import PublicFlowView from "./pages/PublicFlowView";
import PublicPlaybookView from "./pages/PublicPlaybookView";

// Lazy load AI Assistant page for performance optimization
const AIAssistant = lazy(() => import("./pages/AIAssistant"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
  <HelmetProvider>
      <SimplifiedAuthProvider>
        <ViewModeProvider>
          <AdminProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <OnboardingProvider>
                <ChecklistProvider>
                  <AppLayout>
                  <RouteTracker />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<SimplifiedAuth />} />
                    <Route path="/awaiting-approval" element={<AwaitingApproval />} />
                    <Route path="/consultant-landing" element={<ConsultantLanding />} />
                    
                    <Route path="/how-to-use" element={<HowToUsePortal />} />
                    <Route path="/search-by-profile" element={<SearchByProfile />} />
                    
                    <Route path="/bookmarks" element={<Bookmarks />} />
                    <Route path="/cmfas-exams" element={<CMFASExams />} />
                    <Route path="/cmfas/module/:moduleId" element={<CMFASModuleDetail />} />
                    <Route path="/cmfas/module/:moduleId/video/:videoSlugOrId" element={<CMFASVideoDetail />} />
                    <Route path="/cmfas/chat/:moduleId?" element={<CMFASChat />} />
                    <Route path="/roleplay" element={<Roleplay />} />
                    <Route path="/roleplay/feedback/:sessionId" element={<RoleplayFeedback />} />
                    <Route path="/admin" element={
                      <ProtectedAdminPage>
                        <AdminDashboard />
                      </ProtectedAdminPage>
                    } />
                    <Route path="/my-account" element={<MyAccount />} />
<Route path="/category/:categorySlugOrId" element={<ProductCategory />} />
<Route path="/product/:productSlugOrId" element={<ProductDetail />} />
<Route path="/product/:productSlugOrId/:pageId" element={<ProductDetail />} />
<Route path="/product/:productSlugOrId/manage-videos" element={<ManageProductVideos />} />
<Route path="/product/:productId/ai-assistant" element={
  <Suspense fallback={<SkeletonLoader type="product" />}>
    <AIAssistant />
  </Suspense>
} />
<Route path="/product/:productSlugOrId/video/:videoId" element={<VideoDetail />} />
                    <Route path="/force-password" element={<ForcePasswordChange />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

{/* Scripts Database */}
<Route path="/scripts" element={<ScriptsDatabase />} />
<Route path="/scripts/:scriptId" element={<ScriptsDatabase />} />
<Route path="/objections" element={<ScriptsDatabase />} />

{/* Script Playbooks */}
<Route path="/playbooks" element={<Playbooks />} />
<Route path="/playbooks/:playbookId" element={<PlaybookDetail />} />
<Route path="/playbooks/share/:shareToken" element={<PublicPlaybookView />} />

{/* Script Flows */}
<Route path="/flows" element={<ScriptFlows />} />
<Route path="/flows/view/:flowId" element={<PublicFlowView />} />

{/* Knowledge Base */}
<Route path="/kb" element={<KnowledgeBase />} />
<Route path="/kb/:categorySlug" element={<KBCategory />} />
<Route path="/kb/:categorySlug/:productSlug" element={<KBProduct />} />

{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
<Route path="*" element={<NotFound />} />
                  </Routes>
                  
                  {/* Enhanced Onboarding Components */}
                  <OnboardingTutorial />
                  <OnboardingHelpButton />
                  <WelcomeModal />
                  
                  {/* Admin View Switcher - floating button */}
                  <AdminViewSwitcher />
                  </AppLayout>
                </ChecklistProvider>
              </OnboardingProvider>
            </BrowserRouter>
          </TooltipProvider>
        </AdminProvider>
      </ViewModeProvider>
    </SimplifiedAuthProvider>
  </HelmetProvider>
  </QueryClientProvider>
);

export default App;
