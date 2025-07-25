
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminProvider } from "@/hooks/useAdmin";
import { OnboardingProvider } from "@/hooks/useOnboarding";
import { ChecklistProvider } from "@/hooks/useChecklistProgress";
import { AppLayout } from "@/components/layout/AppLayout";
import { FloatingQuickActions } from "@/components/FloatingQuickActions";
import { OnboardingTutorial } from "@/components/onboarding/OnboardingTutorial";
import { OnboardingHelpButton } from "@/components/onboarding/OnboardingHelpButton";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import Index from "./pages/Index";
import ProductCategory from "./pages/ProductCategory";
import ProductDetail from "./pages/ProductDetail";
import HowToUsePortal from "./pages/HowToUsePortal";
import SearchByProfile from "./pages/SearchByProfile";
import SearchResults from "./pages/SearchResults";
import SalesTools from "./pages/SalesTools";
import Bookmarks from "./pages/Bookmarks";
import Auth from "./pages/Auth";
import ConsultantLanding from "./pages/ConsultantLanding";
import CMFASExams from "./pages/CMFASExams";
import CMFASModuleDetail from "./pages/cmfas/CMFASModuleDetail";
import AdminDashboard from "./pages/AdminDashboard";
import MyAccount from "./pages/MyAccount";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <AdminProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <OnboardingProvider>
                <ChecklistProvider>
                  <AppLayout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/consultant-landing" element={<ConsultantLanding />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/how-to-use" element={<HowToUsePortal />} />
                    <Route path="/search-by-profile" element={<SearchByProfile />} />
                    <Route path="/sales-tools" element={<SalesTools />} />
                    <Route path="/bookmarks" element={<Bookmarks />} />
                    <Route path="/cmfas-exams" element={<CMFASExams />} />
                    <Route path="/cmfas/module/:moduleId" element={<CMFASModuleDetail />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/my-account" element={<MyAccount />} />
                    <Route path="/category/:categoryId" element={<ProductCategory />} />
                    <Route path="/product/:productId" element={<ProductDetail />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <FloatingQuickActions />
                  
                  {/* Enhanced Onboarding Components */}
                  <OnboardingTutorial />
                  <OnboardingHelpButton />
                  <WelcomeModal />
                  </AppLayout>
                </ChecklistProvider>
              </OnboardingProvider>
            </BrowserRouter>
          </TooltipProvider>
        </AdminProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
