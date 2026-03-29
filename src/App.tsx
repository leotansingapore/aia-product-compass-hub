
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
import { RequireAuth } from "@/components/RequireAuth";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { RouteTracker } from "@/components/RouteTracker";

import { OnboardingTutorial } from "@/components/onboarding/OnboardingTutorial";
import { OnboardingHelpButton } from "@/components/onboarding/OnboardingHelpButton";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { NewVersionBanner } from "@/components/NewVersionBanner";
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
const ProductExam = lazy(() => import("./pages/ProductExam"));
const LearningTrack = lazy(() => import("./pages/LearningTrack"));
const ProAchieverStudy = lazy(() => import("./pages/ProAchieverStudy"));
const PlatinumWealthVentureStudy = lazy(() => import("./pages/PlatinumWealthVentureStudy"));
const HealthshieldGoldMaxStudy = lazy(() => import("./pages/HealthshieldGoldMaxStudy"));
const SalesMastery = lazy(() => import("./pages/SalesMastery"));
const SalesMasteryLesson = lazy(() => import("./pages/SalesMasteryLesson"));

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
                    {/* Public routes — no auth required */}
                    <Route path="/auth" element={<SimplifiedAuth />} />
                    <Route path="/awaiting-approval" element={<AwaitingApproval />} />
                    <Route path="/force-password" element={<ForcePasswordChange />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/flows/view/:flowId" element={<PublicFlowView />} />
                    <Route path="/playbooks/share/:shareToken" element={<PublicPlaybookView />} />

                    {/* All other routes require authentication */}
                    <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
                    <Route path="/consultant-landing" element={<RequireAuth><ConsultantLanding /></RequireAuth>} />
                    <Route path="/how-to-use" element={<RequireAuth><HowToUsePortal /></RequireAuth>} />
                    <Route path="/search-by-profile" element={<RequireAuth><SearchByProfile /></RequireAuth>} />
                    <Route path="/bookmarks" element={<RequireAuth><Bookmarks /></RequireAuth>} />
                    <Route path="/cmfas-exams" element={<RequireAuth><CMFASExams /></RequireAuth>} />
                    <Route path="/cmfas/module/:moduleId" element={<RequireAuth><CMFASModuleDetail /></RequireAuth>} />
                    <Route path="/cmfas/module/:moduleId/video/:videoSlugOrId" element={<RequireAuth><CMFASVideoDetail /></RequireAuth>} />
                    <Route path="/cmfas/chat/:moduleId?" element={<RequireAuth><CMFASChat /></RequireAuth>} />
                    <Route path="/roleplay" element={<RequireAuth><Roleplay /></RequireAuth>} />
                    <Route path="/roleplay/feedback/:sessionId" element={<RequireAuth><RoleplayFeedback /></RequireAuth>} />
                    <Route path="/roleplay/pitch-analysis" element={<RequireAuth><PitchAnalysis /></RequireAuth>} />
                    <Route path="/admin" element={
                      <RequireAuth>
                        <ProtectedAdminPage>
                          <AdminDashboard />
                        </ProtectedAdminPage>
                      </RequireAuth>
                    } />
                    <Route path="/my-account" element={<RequireAuth><MyAccount /></RequireAuth>} />
                    <Route path="/category/:categorySlugOrId" element={<RequireAuth><ProductCategory /></RequireAuth>} />
                    <Route path="/product/:productSlugOrId" element={<RequireAuth><ProductDetail /></RequireAuth>} />
                    <Route path="/product/:productSlugOrId/:pageId" element={<RequireAuth><ProductDetail /></RequireAuth>} />
                    <Route path="/product/:productSlugOrId/manage-videos" element={<RequireAuth><ManageProductVideos /></RequireAuth>} />
                    <Route path="/product/:productId/ai-assistant" element={<RequireAuth><AIAssistant /></RequireAuth>} />
                    <Route path="/product/:productSlugOrId/exam" element={<RequireAuth><ProductExam /></RequireAuth>} />
                    <Route path="/product/:productSlugOrId/video/:videoId" element={<RequireAuth><VideoDetail /></RequireAuth>} />
                    <Route path="/changelog" element={<RequireAuth><Changelog /></RequireAuth>} />
                    <Route path="/scripts" element={<RequireAuth><ScriptsDatabase /></RequireAuth>} />
                    <Route path="/scripts/:scriptId" element={<RequireAuth><ScriptsDatabase /></RequireAuth>} />
                    <Route path="/objections" element={<RequireAuth><ScriptsDatabase /></RequireAuth>} />
                    <Route path="/servicing" element={<RequireAuth><ServicingPage /></RequireAuth>} />
                    <Route path="/servicing/:scriptId" element={<RequireAuth><ServicingPage /></RequireAuth>} />
                    <Route path="/playbooks" element={<RequireAuth><Playbooks /></RequireAuth>} />
                    <Route path="/playbooks/:playbookId" element={<RequireAuth><PlaybookDetail /></RequireAuth>} />
                    <Route path="/flows" element={<RequireAuth><ScriptFlows /></RequireAuth>} />
                    <Route path="/flows/:flowId" element={<RequireAuth><ScriptFlows /></RequireAuth>} />
                    <Route path="/concept-cards" element={<RequireAuth><ConceptCards /></RequireAuth>} />
                    <Route path="/learning-track" element={<RequireAuth><LearningTrack /></RequireAuth>} />
                    <Route path="/product/pro-achiever/study" element={<RequireAuth><ProAchieverStudy /></RequireAuth>} />
                    <Route path="/product/platinum-wealth-venture/study" element={<RequireAuth><PlatinumWealthVentureStudy /></RequireAuth>} />
                    <Route path="/product/healthshield-gold-max/study" element={<RequireAuth><HealthshieldGoldMaxStudy /></RequireAuth>} />
                    <Route path="/kb" element={<RequireAuth><KnowledgeBase /></RequireAuth>} />
                    <Route path="/kb/:categorySlug" element={<RequireAuth><KBCategory /></RequireAuth>} />
                    <Route path="/kb/:categorySlug/:productSlug" element={<RequireAuth><KBProduct /></RequireAuth>} />

                    {/* Sales Mastery Course */}
                    <Route path="/sales-mastery" element={<RequireAuth><SalesMastery /></RequireAuth>} />
                    <Route path="/sales-mastery/:moduleId" element={<RequireAuth><SalesMasteryLesson /></RequireAuth>} />
                    <Route path="/sales-mastery/:moduleId/lesson/:lessonId" element={<RequireAuth><SalesMasteryLesson /></RequireAuth>} />

                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </Suspense>

                  {/* Enhanced Onboarding Components */}
                  <OnboardingTutorial />
                  <OnboardingHelpButton />
                  <WelcomeModal />
                  <NewVersionBanner />
                  </AppLayout>
                </ChecklistProvider>
              </OnboardingProvider>
              {/* Admin View Switcher - outside AppLayout so it's never clipped */}
              <AdminViewSwitcher />
            </BrowserRouter>
          </TooltipProvider>
        </AdminProvider>
      </ViewModeProvider>
    </SimplifiedAuthProvider>
  </HelmetProvider>
  </QueryClientProvider>
);

export default App;
