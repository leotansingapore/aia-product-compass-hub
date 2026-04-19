
import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { RequireTier } from "@/components/RequireTier";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { RouteTracker } from "@/components/RouteTracker";

const OnboardingTutorial = lazy(() => import("@/components/onboarding/OnboardingTutorial").then(m => ({ default: m.OnboardingTutorial })));
const OnboardingHelpButton = lazy(() => import("@/components/onboarding/OnboardingHelpButton").then(m => ({ default: m.OnboardingHelpButton })));
const WelcomeModal = lazy(() => import("@/components/onboarding/WelcomeModal").then(m => ({ default: m.WelcomeModal })));
const NewVersionBanner = lazy(() => import("@/components/NewVersionBanner").then(m => ({ default: m.NewVersionBanner })));
// Eagerly loaded pages (lightweight / critical path)
const Index = lazy(() => import("./pages/Index"));
import SimplifiedAuth from "./pages/SimplifiedAuth";
import ForcePasswordChange from "./pages/ForcePasswordChange";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// Lazy loaded pages (heavy / secondary routes)
const ProductCategory = lazy(() => import("./pages/ProductCategory"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));
const ConsultantLanding = lazy(() => import("./pages/ConsultantLanding"));
const CMFASExams = lazy(() => import("./pages/CMFASExams"));
const CMFASModuleDetail = lazy(() => import("./pages/cmfas/CMFASModuleDetail"));
const CMFASVideoDetail = lazy(() => import("./pages/cmfas/CMFASVideoDetail"));
const CMFASChat = lazy(() => import("./pages/cmfas/CMFASChat"));
const Roleplay = lazy(() => import("./pages/Roleplay"));
const RoleplayFeedback = lazy(() => import("./pages/RoleplayFeedback"));

const Categories = lazy(() => import("./pages/Categories"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const MyAccount = lazy(() => import("./pages/MyAccount"));
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
const QuestionBanks = lazy(() => import("./pages/QuestionBanks"));
const LearningTrack = lazy(() => import("./pages/LearningTrack"));
const LearningTrackIndex = lazy(() => import("./pages/learning-track/LearningTrackIndex"));
const LearningTrackExplorer = lazy(() => import("./pages/learning-track/Explorer"));
const LearningTrackPreRnf = lazy(() => import("./pages/learning-track/PreRnf"));
const LearningTrackPostRnf = lazy(() => import("./pages/learning-track/PostRnf"));
const LearningTrackResources = lazy(() => import("./pages/learning-track/Resources"));
const LearningTrackFirst60Days = lazy(() => import("./pages/learning-track/First60Days"));
const LearningTrackFirst60DaysDay = lazy(() => import("./pages/learning-track/First60DaysDay"));
const LearningTrackAdminLayout = lazy(() => import("./pages/learning-track/admin/AdminLayout"));
const LearningTrackAdminRoster = lazy(() => import("./pages/learning-track/admin/Roster"));
const LearningTrackAdminHeatmap = lazy(() => import("./pages/learning-track/admin/Heatmap"));
const LearningTrackAdminSubmissions = lazy(() => import("./pages/learning-track/admin/Submissions"));
const LearningTrackAdminRecruit = lazy(() => import("./pages/learning-track/admin/RecruitDetail"));
const LearningTrackAdminActivity = lazy(() => import("./pages/learning-track/admin/Activity"));
const ProAchieverStudy = lazy(() => import("./pages/ProAchieverStudy"));
const PlatinumWealthVentureStudy = lazy(() => import("./pages/PlatinumWealthVentureStudy"));
const HealthshieldGoldMaxStudy = lazy(() => import("./pages/HealthshieldGoldMaxStudy"));
const ProLifetimeProtectorStudy = lazy(() => import("./pages/ProLifetimeProtectorStudy"));
const SolitairePaStudy = lazy(() => import("./pages/SolitairePaStudy"));
const UltimateCriticalCoverStudy = lazy(() => import("./pages/UltimateCriticalCoverStudy"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,      // 2 min — avoid refetch on every navigation
      gcTime: 10 * 60 * 1000,         // 10 min — keep unused data in cache longer
      refetchOnWindowFocus: false,    // don't refetch when user switches tabs
      retry: 1,                       // single retry instead of default 3
    },
  },
});

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
                    <Route path="/force-password" element={<ForcePasswordChange />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/flows/view/:flowId" element={<PublicFlowView />} />
                    <Route path="/playbooks/share/:shareToken" element={<PublicPlaybookView />} />

                    {/* All other routes require authentication */}
                    <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
                    <Route path="/consultant-landing" element={<RequireAuth><RequireTier feature="consultant-landing"><ConsultantLanding /></RequireTier></RequireAuth>} />
                    <Route path="/bookmarks" element={<RequireAuth><Bookmarks /></RequireAuth>} />
                    <Route path="/cmfas-exams" element={<RequireAuth><RequireTier feature="cmfas"><CMFASExams /></RequireTier></RequireAuth>} />
                    <Route path="/cmfas/module/:moduleId" element={<RequireAuth><RequireTier feature="cmfas"><CMFASModuleDetail /></RequireTier></RequireAuth>} />
                    <Route path="/cmfas/module/:moduleId/video/:videoSlugOrId" element={<RequireAuth><RequireTier feature="cmfas"><CMFASVideoDetail /></RequireTier></RequireAuth>} />
                    <Route path="/cmfas/chat/:moduleId?" element={<RequireAuth><RequireTier feature="cmfas"><CMFASChat /></RequireTier></RequireAuth>} />
                    <Route path="/roleplay" element={<RequireAuth><RequireTier feature="roleplay"><Roleplay /></RequireTier></RequireAuth>} />
                    <Route path="/roleplay/feedback/:sessionId" element={<RequireAuth><RequireTier feature="roleplay"><RoleplayFeedback /></RequireTier></RequireAuth>} />
                    <Route path="/roleplay/pitch-analysis" element={<Navigate to="/roleplay?tab=pitch-analysis" replace />} />
                    <Route path="/admin" element={
                      <RequireAuth>
                        <ProtectedAdminPage>
                          <AdminDashboard />
                        </ProtectedAdminPage>
                      </RequireAuth>
                    } />
                    <Route path="/my-account" element={<RequireAuth><MyAccount /></RequireAuth>} />
                    <Route path="/categories" element={<RequireAuth><RequireTier feature="products"><Categories /></RequireTier></RequireAuth>} />
                    <Route path="/category/:categorySlugOrId" element={<RequireAuth><RequireTier feature="products"><ProductCategory /></RequireTier></RequireAuth>} />
                    <Route path="/product/:productSlugOrId" element={<RequireAuth><RequireTier feature="products"><ProductDetail /></RequireTier></RequireAuth>} />
                    <Route path="/product/:productSlugOrId/:pageId" element={<RequireAuth><RequireTier feature="products"><ProductDetail /></RequireTier></RequireAuth>} />
                    <Route path="/product/:productSlugOrId/manage-videos" element={<RequireAuth><RequireTier feature="products"><ManageProductVideos /></RequireTier></RequireAuth>} />
                    <Route path="/product/:productId/ai-assistant" element={<RequireAuth><RequireTier feature="products"><AIAssistant /></RequireTier></RequireAuth>} />
                    <Route path="/product/:productSlugOrId/exam" element={<RequireAuth><RequireTier feature="question-banks"><ProductExam /></RequireTier></RequireAuth>} />
                    <Route path="/product/:productSlugOrId/video/:videoId" element={<RequireAuth><RequireTier feature="products"><VideoDetail /></RequireTier></RequireAuth>} />
                    <Route path="/question-banks" element={<RequireAuth><RequireTier feature="question-banks"><QuestionBanks /></RequireTier></RequireAuth>} />
                    <Route path="/changelog" element={<RequireAuth><Changelog /></RequireAuth>} />
                    <Route path="/scripts" element={<RequireAuth><RequireTier feature="scripts"><ScriptsDatabase /></RequireTier></RequireAuth>} />
                    <Route path="/scripts/:scriptId" element={<RequireAuth><RequireTier feature="scripts"><ScriptsDatabase /></RequireTier></RequireAuth>} />
                    <Route path="/objections" element={<RequireAuth><RequireTier feature="scripts"><ScriptsDatabase /></RequireTier></RequireAuth>} />
                    <Route path="/servicing" element={<RequireAuth><RequireTier feature="servicing"><ServicingPage /></RequireTier></RequireAuth>} />
                    <Route path="/servicing/:scriptId" element={<RequireAuth><RequireTier feature="servicing"><ServicingPage /></RequireTier></RequireAuth>} />
                    <Route path="/playbooks" element={<RequireAuth><RequireTier feature="playbooks"><Playbooks /></RequireTier></RequireAuth>} />
                    <Route path="/playbooks/:playbookId" element={<RequireAuth><RequireTier feature="playbooks"><PlaybookDetail /></RequireTier></RequireAuth>} />
                    <Route path="/flows" element={<RequireAuth><RequireTier feature="flows"><ScriptFlows /></RequireTier></RequireAuth>} />
                    <Route path="/flows/:flowId" element={<RequireAuth><RequireTier feature="flows"><ScriptFlows /></RequireTier></RequireAuth>} />
                    <Route path="/concept-cards" element={<RequireAuth><RequireTier feature="concept-cards"><ConceptCards /></RequireTier></RequireAuth>} />
                    <Route path="/learning-track" element={<RequireAuth><LearningTrack /></RequireAuth>}>
                      <Route index element={<LearningTrackIndex />} />
                      <Route path="explorer" element={<RequireTier feature="explorer-track"><LearningTrackExplorer /></RequireTier>} />
                      <Route path="explorer/:itemId" element={<RequireTier feature="explorer-track"><LearningTrackExplorer /></RequireTier>} />
                      <Route path="pre-rnf" element={<RequireTier feature="pre-rnf-track"><LearningTrackPreRnf /></RequireTier>} />
                      <Route path="pre-rnf/:itemId" element={<RequireTier feature="pre-rnf-track"><LearningTrackPreRnf /></RequireTier>} />
                      <Route path="post-rnf" element={<RequireTier feature="post-rnf-track"><LearningTrackPostRnf /></RequireTier>} />
                      <Route path="post-rnf/:itemId" element={<RequireTier feature="post-rnf-track"><LearningTrackPostRnf /></RequireTier>} />
                      <Route path="resources" element={<RequireTier feature="pre-rnf-track"><LearningTrackResources /></RequireTier>} />
                      <Route path="first-60-days" element={<LearningTrackFirst60Days />} />
                      <Route path="first-60-days/day/:dayNumber" element={<LearningTrackFirst60DaysDay />} />
                      <Route path="admin" element={<ProtectedAdminPage><LearningTrackAdminLayout /></ProtectedAdminPage>}>
                        <Route index element={<Navigate to="roster" replace />} />
                        <Route path="roster" element={<LearningTrackAdminRoster />} />
                        <Route path="heatmap" element={<LearningTrackAdminHeatmap />} />
                        <Route path="submissions" element={<LearningTrackAdminSubmissions />} />
                        <Route path="activity" element={<LearningTrackAdminActivity />} />
                        <Route path="recruit/:userId" element={<LearningTrackAdminRecruit />} />
                      </Route>
                    </Route>
                    <Route path="/product/pro-achiever/study" element={<RequireAuth><RequireTier feature="question-banks"><ProAchieverStudy /></RequireTier></RequireAuth>} />
                    <Route path="/product/platinum-wealth-venture/study" element={<RequireAuth><RequireTier feature="question-banks"><PlatinumWealthVentureStudy /></RequireTier></RequireAuth>} />
                    <Route path="/product/healthshield-gold-max/study" element={<RequireAuth><RequireTier feature="question-banks"><HealthshieldGoldMaxStudy /></RequireTier></RequireAuth>} />
                    <Route path="/product/pro-lifetime-protector/study" element={<RequireAuth><RequireTier feature="question-banks"><ProLifetimeProtectorStudy /></RequireTier></RequireAuth>} />
                    <Route path="/product/solitaire-pa/study" element={<RequireAuth><RequireTier feature="question-banks"><SolitairePaStudy /></RequireTier></RequireAuth>} />
                    <Route path="/product/ultimate-critical-cover/study" element={<RequireAuth><RequireTier feature="question-banks"><UltimateCriticalCoverStudy /></RequireTier></RequireAuth>} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </Suspense>

                  {/* Enhanced Onboarding Components — lazy-loaded */}
                  <Suspense fallback={null}>
                    <OnboardingTutorial />
                    <OnboardingHelpButton />
                    <WelcomeModal />
                    <NewVersionBanner />
                  </Suspense>
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
