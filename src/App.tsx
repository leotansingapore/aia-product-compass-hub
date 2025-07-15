import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminProvider } from "@/hooks/useAdmin";
import { OnboardingProvider } from "@/hooks/useOnboarding";
import { AppLayout } from "@/components/layout/AppLayout";
import { FloatingQuickActions } from "@/components/FloatingQuickActions";
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
import OnboardingModule from "./pages/cmfas/OnboardingModule";
import M9Module from "./pages/cmfas/M9Module";
import M9AModule from "./pages/cmfas/M9AModule";
import HIModule from "./pages/cmfas/HIModule";
import RES5Module from "./pages/cmfas/RES5Module";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <OnboardingProvider>
          <AdminProvider>
            <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
                <Route path="/cmfas/onboarding" element={<OnboardingModule />} />
                <Route path="/cmfas/m9" element={<M9Module />} />
                <Route path="/cmfas/m9a" element={<M9AModule />} />
                <Route path="/cmfas/hi" element={<HIModule />} />
                <Route path="/cmfas/res5" element={<RES5Module />} />
                <Route path="/category/:categoryId" element={<ProductCategory />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <FloatingQuickActions />
            </AppLayout>
          </BrowserRouter>
          </TooltipProvider>
        </AdminProvider>
        </OnboardingProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
