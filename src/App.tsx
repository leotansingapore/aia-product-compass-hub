
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
// Eagerly loaded pages (lightweight / critical path)
import Index from "./pages/Index";
import SimplifiedAuth from "./pages/SimplifiedAuth";
import AwaitingApproval from "./pages/AwaitingApproval";
import ForcePasswordChange from "./pages/ForcePasswordChange";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// Lazy loaded pages (heavy / secondary routes)
const ProductCategory = lazy(() => import("./pages/ProductCategory"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const HowToUsePortal = lazy(() => import("./pages/HowToUsePortal"));
const SearchByProfile = lazy(() => import("./pages/SearchByProfile"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));
const ConsultantLanding = lazy(() => import("./pages/ConsultantLanding"));
const CMFASExams = lazy(() => import("./pages/CMFASExams"));
const CMFASModuleDetail = lazy(() => import("./pages/cmfas/CMFASModuleDetail"));
const CMFASVideoDetail = lazy(() => import("./pages/cmfas/CMFASVideoDetail"));
const CMFASChat = lazy(() => import("./pages/cmfas/CMFASChat"));
const Roleplay = lazy(() => import("./pages/Roleplay"));
const RoleplayFeedback = lazy(() => import("./pages/RoleplayFeedback"));
const PitchAnalysis = lazy(() => import("./pages/PitchAnalysis"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const MyAccount = lazy(() => import("./pages/MyAccount"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const KBCategory = lazy(() => import("./pages/kb/KBCategory"));
const KBProduct = lazy(() => import("./pages/kb/KBProduct"));
const VideoDetail = lazy(() => import("./pages/VideoDetail"));
const ManageProductVideos = lazy(() => import("./pages/ManageProductVideos"));
const ScriptsDatabase = lazy(() => import("./pages/ScriptsDatabase"));
const Changelog = lazy(() => import("./pages/Changelog"));
const ServicingPage = lazy(() => import("./pages/ServicingPage"));
const Playbooks = lazy(() => import("./pages/Playbooks"));
const PlaybookDetail = lazy(() => import("./pages/PlaybookDetail"));
const ScriptFlows = lazy(() => import("./pages/ScriptFlows"));
const PublicFlowView = lazy(() => import("./pages/PublicFlowView"));
const PublicPlaybookView = lazy(() => import("./pages/PublicPlaybookView"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const ConceptCards = lazy(() => import("./pages/ConceptCards"));

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
                  <Suspense fallback={<SkeletonLoader type="product" />}>
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
                    <Route path="/roleplay/pitch-analysis" element={<PitchAnalysis />} />
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
                    <Route path="/product/:productId/ai-assistant" element={<AIAssistant />} />
                    <Route path="/product/:productSlugOrId/video/:videoId" element={<VideoDetail />} />
                    <Route path="/force-password" element={<ForcePasswordChange />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Changelog */}
                    <Route path="/changelog" element={<Changelog />} />

                    {/* Scripts Database */}
                    <Route path="/scripts" element={<ScriptsDatabase />} />
                    <Route path="/scripts/:scriptId" element={<ScriptsDatabase />} />
                    <Route path="/objections" element={<ScriptsDatabase />} />

                    {/* Servicing Templates */}
                    <Route path="/servicing" element={<ServicingPage />} />
                    <Route path="/servicing/:scriptId" element={<ServicingPage />} />

                    {/* Script Playbooks */}
                    <Route path="/playbooks" element={<Playbooks />} />
                    <Route path="/playbooks/:playbookId" element={<PlaybookDetail />} />
                    <Route path="/playbooks/share/:shareToken" element={<PublicPlaybookView />} />

                    {/* Script Flows */}
                    <Route path="/flows" element={<ScriptFlows />} />
                    <Route path="/flows/:flowId" element={<ScriptFlows />} />
                    <Route path="/flows/view/:flowId" element={<PublicFlowView />} />

                    {/* Concept Cards */}
                    <Route path="/concept-cards" element={<ConceptCards />} />

                    {/* Knowledge Base */}
                    <Route path="/kb" element={<KnowledgeBase />} />
                    <Route path="/kb/:categorySlug" element={<KBCategory />} />
                    <Route path="/kb/:categorySlug/:productSlug" element={<KBProduct />} />

                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </Suspense>

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
