
import { lazy, Suspense } from 'react';
import { lazyWithRetry } from "@/utils/lazyWithRetry";
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
import { SlideSubmissionsProvider } from "@/hooks/useSlideSubmissions";
import { CMFASStudyProvider } from "@/components/cmfas/CMFASStudyProvider";
// PomodoroDock is only meaningful inside CMFASStudyProvider — keep it out of
// the app-shell bundle for non-CMFAS sessions.
const PomodoroDock = lazyWithRetry(() => import("@/components/cmfas/PomodoroDock").then(m => ({ default: m.PomodoroDock })));
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedPage } from "@/components/ProtectedPage";
import { ProtectedAdminPage } from "@/components/ProtectedAdminPage";
import { RequireAuth } from "@/components/RequireAuth";
import { RequireTier } from "@/components/RequireTier";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { RouteTracker } from "@/components/RouteTracker";

const OnboardingTutorial = lazyWithRetry(() => import("@/components/onboarding/OnboardingTutorial").then(m => ({ default: m.OnboardingTutorial })));
const OnboardingHelpButton = lazyWithRetry(() => import("@/components/onboarding/OnboardingHelpButton").then(m => ({ default: m.OnboardingHelpButton })));
const WelcomeModal = lazyWithRetry(() => import("@/components/onboarding/WelcomeModal").then(m => ({ default: m.WelcomeModal })));
const AnimatedOnboardingTourController = lazyWithRetry(() => import("@/components/onboarding/AnimatedOnboardingTourController").then(m => ({ default: m.AnimatedOnboardingTourController })));
const NewVersionBanner = lazyWithRetry(() => import("@/components/NewVersionBanner").then(m => ({ default: m.NewVersionBanner })));
// Eagerly loaded pages (lightweight / critical path)
const Index = lazyWithRetry(() => import("./pages/Index"));
// Auth-related pages are lazy: most sessions never hit them (already signed in).
const SimplifiedAuth = lazyWithRetry(() => import("./pages/SimplifiedAuth"));
const ForcePasswordChange = lazyWithRetry(() => import("./pages/ForcePasswordChange"));
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));

// Lazy loaded pages (heavy / secondary routes)
const ProductCategory = lazyWithRetry(() => import("./pages/ProductCategory"));
const ProductDetail = lazyWithRetry(() => import("./pages/ProductDetail"));
const Bookmarks = lazyWithRetry(() => import("./pages/Bookmarks"));
const ConsultantLanding = lazyWithRetry(() => import("./pages/ConsultantLanding"));
const CMFASExams = lazyWithRetry(() => import("./pages/CMFASExams"));
const CMFASModuleDetail = lazyWithRetry(() => import("./pages/cmfas/CMFASModuleDetail"));
const CMFASVideoDetail = lazyWithRetry(() => import("./pages/cmfas/CMFASVideoDetail"));
const CMFASChat = lazyWithRetry(() => import("./pages/cmfas/CMFASChat"));
const Roleplay = lazyWithRetry(() => import("./pages/Roleplay"));
const RoleplayFeedback = lazyWithRetry(() => import("./pages/RoleplayFeedback"));

const Categories = lazyWithRetry(() => import("./pages/Categories"));
const AdminDashboard = lazyWithRetry(() => import("./pages/AdminDashboard"));
const MyAccount = lazyWithRetry(() => import("./pages/MyAccount"));
const VideoDetail = lazyWithRetry(() => import("./pages/VideoDetail"));
const ManageProductVideos = lazyWithRetry(() => import("./pages/ManageProductVideos"));
const ScriptsDatabase = lazyWithRetry(() => import("./pages/ScriptsDatabase"));
const Changelog = lazyWithRetry(() => import("./pages/Changelog"));
const ServicingPage = lazyWithRetry(() => import("./pages/ServicingPage"));
const Playbooks = lazyWithRetry(() => import("./pages/Playbooks"));
const PlaybookDetail = lazyWithRetry(() => import("./pages/PlaybookDetail"));
const ScriptFlows = lazyWithRetry(() => import("./pages/ScriptFlows"));
const PublicFlowView = lazyWithRetry(() => import("./pages/PublicFlowView"));
const PublicPlaybookView = lazyWithRetry(() => import("./pages/PublicPlaybookView"));
const AIAssistant = lazyWithRetry(() => import("./pages/AIAssistant"));
const ConceptCards = lazyWithRetry(() => import("./pages/ConceptCards"));
const ProductExam = lazyWithRetry(() => import("./pages/ProductExam"));
const QuestionBanks = lazyWithRetry(() => import("./pages/QuestionBanks"));
const Leaderboard = lazyWithRetry(() => import("./pages/Leaderboard"));
const Library = lazyWithRetry(() => import("./pages/Library"));
const LearningTrack = lazyWithRetry(() => import("./pages/LearningTrack"));
const LearningTrackIndex = lazyWithRetry(() => import("./pages/learning-track/LearningTrackIndex"));
const LearningTrackExplorer = lazyWithRetry(() => import("./pages/learning-track/Explorer"));
const LearningTrackPreRnf = lazyWithRetry(() => import("./pages/learning-track/PreRnf"));
const FinancialAdvisorDifferentiation = lazyWithRetry(() => import("./pages/learning-track/FinancialAdvisorDifferentiation"));
const LearningTrackPostRnf = lazyWithRetry(() => import("./pages/learning-track/PostRnf"));
const LearningTrackResources = lazyWithRetry(() => import("./pages/learning-track/Resources"));
const LearningTrackFirst60Days = lazyWithRetry(() => import("./pages/learning-track/First60Days"));
const LearningTrackFirst60DaysDay = lazyWithRetry(() => import("./pages/learning-track/First60DaysDay"));
const LearningTrackNext60Days = lazyWithRetry(() => import("./pages/learning-track/Next60Days"));
const LearningTrackNext60DaysDay = lazyWithRetry(() => import("./pages/learning-track/Next60DaysDay"));
const LearningTrackNext60DaysAssignments = lazyWithRetry(() => import("./pages/learning-track/Next60DaysAssignments"));
const LearningTrackFirst14Days = lazyWithRetry(() => import("./pages/learning-track/First14Days"));
const LearningTrackFirst14DaysDay = lazyWithRetry(() => import("./pages/learning-track/First14DaysDay"));
const LearningTrackAdminLayout = lazyWithRetry(() => import("./pages/learning-track/admin/AdminLayout"));
const LearningTrackAdminFirst14Days = lazyWithRetry(() => import("./pages/learning-track/admin/AdminFirst14Days"));
const LearningTrackAdminFirst60Days = lazyWithRetry(() => import("./pages/learning-track/admin/First60DaysAdmin"));
const LearningTrackAdminAssignments = lazyWithRetry(() => import("./pages/learning-track/admin/AdminAssignments"));
const LearningTrackAdminQuestionBanks = lazyWithRetry(() => import("./pages/learning-track/admin/AdminQuestionBanks"));
const LearningTrackAdminRoleplay = lazyWithRetry(() => import("./pages/learning-track/admin/AdminRoleplay"));
const ProAchieverStudy = lazyWithRetry(() => import("./pages/ProAchieverStudy"));
const PlatinumWealthVentureStudy = lazyWithRetry(() => import("./pages/PlatinumWealthVentureStudy"));
const HealthshieldGoldMaxStudy = lazyWithRetry(() => import("./pages/HealthshieldGoldMaxStudy"));
const ProLifetimeProtectorStudy = lazyWithRetry(() => import("./pages/ProLifetimeProtectorStudy"));
const SolitairePaStudy = lazyWithRetry(() => import("./pages/SolitairePaStudy"));
const UltimateCriticalCoverStudy = lazyWithRetry(() => import("./pages/UltimateCriticalCoverStudy"));

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
                  <SlideSubmissionsProvider>
                  <CMFASStudyProvider>
                  <Suspense fallback={null}>
                    <PomodoroDock />
                  </Suspense>
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
                    <Route path="/leaderboard" element={<RequireAuth><Leaderboard /></RequireAuth>} />
                    <Route path="/library" element={<RequireAuth><Library /></RequireAuth>} />
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
                      <Route path="explorer" element={<Navigate to="/learning-track/first-14-days" replace />} />
                      <Route path="explorer/:itemId" element={<Navigate to="/learning-track/first-14-days" replace />} />
                      <Route path="first-14-days" element={<RequireTier feature="explorer-track"><LearningTrackFirst14Days /></RequireTier>} />
                      <Route path="first-14-days/day/:dayNumber" element={<RequireTier feature="explorer-track"><LearningTrackFirst14DaysDay /></RequireTier>} />
                      <Route path="pre-rnf" element={<Navigate to="/learning-track/pre-rnf/first-60-days" replace />} />
                      <Route path="pre-rnf/first-60-days" element={<RequireTier feature="pre-rnf-track"><LearningTrackPreRnf /></RequireTier>} />
                      <Route path="pre-rnf/assignments" element={<RequireTier feature="pre-rnf-track"><LearningTrackPreRnf /></RequireTier>} />
                      <Route path="pre-rnf/assignments/:itemId" element={<RequireTier feature="pre-rnf-track"><LearningTrackPreRnf /></RequireTier>} />
                      <Route path="pre-rnf/assignments/assignment-08/tool" element={<RequireTier feature="pre-rnf-track"><FinancialAdvisorDifferentiation /></RequireTier>} />
                      <Route path="pre-rnf/assignments/assignment-08/tool/:tab" element={<RequireTier feature="pre-rnf-track"><FinancialAdvisorDifferentiation /></RequireTier>} />
                      <Route path="pre-rnf/:itemId" element={<Navigate to="/learning-track/pre-rnf/assignments" replace />} />
                      <Route path="post-rnf" element={<Navigate to="/learning-track/post-rnf/next-60-days" replace />} />
                      <Route path="post-rnf/first-30-days" element={<Navigate to="/learning-track/post-rnf/next-60-days" replace />} />
                      <Route path="post-rnf/next-60-days" element={<RequireTier feature="post-rnf-track"><LearningTrackPostRnf /></RequireTier>} />
                      <Route path="post-rnf/assignments" element={<RequireTier feature="post-rnf-track"><LearningTrackPostRnf /></RequireTier>} />
                      <Route path="post-rnf/assignments/:itemId" element={<RequireTier feature="post-rnf-track"><LearningTrackPostRnf /></RequireTier>} />
                      <Route path="post-rnf/:itemId" element={<Navigate to="/learning-track/post-rnf/next-60-days" replace />} />
                      <Route path="resources" element={<RequireTier feature="pre-rnf-track"><LearningTrackResources /></RequireTier>} />
                      <Route path="first-60-days" element={<RequireTier feature="pre-rnf-track"><LearningTrackFirst60Days /></RequireTier>} />
                      <Route path="first-60-days/day/:dayNumber" element={<RequireTier feature="pre-rnf-track"><LearningTrackFirst60DaysDay /></RequireTier>} />
                      <Route path="next-60-days" element={<LearningTrackNext60Days />} />
                      <Route path="next-60-days/day/:dayNumber" element={<LearningTrackNext60DaysDay />} />
                      <Route path="first-30-days" element={<Navigate to="/learning-track/next-60-days" replace />} />
                      <Route path="first-30-days/day/:dayNumber" element={<Navigate to="/learning-track/next-60-days" replace />} />
                      <Route path="admin" element={<ProtectedAdminPage><LearningTrackAdminLayout /></ProtectedAdminPage>}>
                        <Route index element={<Navigate to="first-60-days" replace />} />
                        <Route path="first-14-days" element={<LearningTrackAdminFirst14Days />} />
                        <Route path="first-60-days" element={<LearningTrackAdminFirst60Days />} />
                        <Route path="assignments" element={<LearningTrackAdminAssignments />} />
                        <Route path="question-banks" element={<LearningTrackAdminQuestionBanks />} />
                        <Route path="roleplay" element={<LearningTrackAdminRoleplay />} />
                        {/* Legacy redirects so old bookmarks don't 404 */}
                        <Route path="roster" element={<Navigate to="/learning-track/admin/first-60-days" replace />} />
                        <Route path="heatmap" element={<Navigate to="/learning-track/admin/first-60-days" replace />} />
                        <Route path="submissions" element={<Navigate to="/learning-track/admin/assignments" replace />} />
                        <Route path="activity" element={<Navigate to="/learning-track/admin/first-60-days" replace />} />
                        <Route path="recruit/:userId" element={<Navigate to="/learning-track/admin/first-60-days" replace />} />
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
                    <AnimatedOnboardingTourController />
                    <NewVersionBanner />
                  </Suspense>
                  </AppLayout>
                  </CMFASStudyProvider>
                  </SlideSubmissionsProvider>
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
