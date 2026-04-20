import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EyeOff, Plus, Search } from "lucide-react";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { PageLayout, StructuredData } from "@/components/layout/PageLayout";
import { ProtectedPage } from "@/components/ProtectedPage";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { Input } from "@/components/ui/input";
import { ProductsGrid } from "@/components/category/ProductsGrid";
import { CreateModuleForm } from "@/components/admin/CreateModuleForm";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CMFASUsefulLinks } from "@/components/cmfas/CMFASUsefulLinks";
import { CMFASHubChatFAB } from "@/components/cmfas/CMFASHubChatFAB";
import { EditableText } from "@/components/EditableText";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useCategories, useProducts, invalidateCategoriesCache } from "@/hooks/useProducts";
import { useUsefulLinks } from "@/hooks/useUsefulLinks";
import type { UsefulLink } from "@/hooks/useProducts";
import { usePermissions } from "@/hooks/usePermissions";
import { useViewMode } from "@/components/admin/AdminViewSwitcher";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DEFAULT_ABOUT_TEXT = `The Capital Markets Financial Advisory Services (CMFAS) certification is required for financial advisors in Singapore to provide investment advice on capital market products.

Our comprehensive preparation materials are organized by module, each containing detailed syllabi, practice questions, and expert guidance. Start with the Getting Started module to complete your essential setup, then proceed through each exam module systematically.

With our support package including flashcards, personal tutoring, question banks, and AI assistance, passing on your first attempt should be highly achievable.`;

const DEFAULT_USEFUL_LINKS: UsefulLink[] = [
  { name: "SCI College Student Portal", url: "https://www.scicollege.org.sg/Account/Register", icon: "🎓" },
  { name: "MAS Guidelines", url: "https://www.mas.gov.sg/regulation/guidelines", icon: "📋" },
  { name: "AIA Singapore", url: "https://www.aia.com.sg", icon: "🌐" },
  { name: "Life Insurance Calculator", url: "https://www.aia.com.sg/en/our-products/life-insurance.html", icon: "🧮" },
  { name: "CMFAS Practice Tests", url: "/cmfas-exams", icon: "📚" },
  { name: "Technical Support", url: "mailto:support@aiaproductcompass.com", icon: "📞" },
];

const META_PRODUCT_ID = "cmfas-exams-page";

const HUB_TABS = ["modules", "resources", "about"] as const;
type HubTab = (typeof HUB_TABS)[number];

/** Underline tabs in dark header (reference: learning hub style). */
const HUB_TAB_LIST_CLASS =
  "bg-transparent p-0 h-auto min-h-0 w-full flex flex-nowrap justify-start gap-0 overflow-x-auto rounded-none shadow-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6 md:gap-8";
const HUB_TAB_TRIGGER_CLASS =
  "shrink-0 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 py-2.5 text-sm font-medium text-white/80 shadow-none ring-offset-transparent transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none sm:px-2 sm:py-3 min-h-[44px] sm:min-h-0";

export default function CMFASExams() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeHubTab: HubTab = HUB_TABS.includes(tabParam as HubTab)
    ? (tabParam as HubTab)
    : "modules";
  const handleHubTabChange = (value: string) => {
    setSearchParams(value === "modules" ? {} : { tab: value }, { replace: true });
  };

  const { isAdmin } = usePermissions();
  const { isViewingAsUser } = useViewMode();
  const isAdminUser = isAdmin() && !isViewingAsUser;

  // Resolve CMFAS category from DB by name (safer than hardcoded UUID)
  const {
    categories,
    loading: categoriesLoading,
    refetch: refetchCategories,
  } = useCategories();
  const cmfasCategory = useMemo(
    () => categories.find((c) => c.name.toLowerCase() === "cmfas"),
    [categories]
  );
  const categoryId = cmfasCategory?.id;

  const {
    products: rawProducts,
    loading: productsLoading,
    refetch: refetchProducts,
  } = useProducts(categoryId);

  // Search + filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [createModuleOpen, setCreateModuleOpen] = useState(false);
  const filteredProducts = useMemo(() => {
    // Hide the meta "cmfas-exams-page" product — it's a container for the
    // useful links + about text, not a module recruits should click through.
    const base = rawProducts.filter((p) => p.id !== META_PRODUCT_ID);
    const visible = isViewingAsUser ? base.filter((p) => p.published !== false) : base;
    if (!searchQuery) return visible;
    const q = searchQuery.toLowerCase();
    return visible.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [rawProducts, isViewingAsUser, searchQuery]);

  // Useful links live on the cmfas-exams-page product
  const { usefulLinks, updateUsefulLinks } = useUsefulLinks(
    META_PRODUCT_ID,
    DEFAULT_USEFUL_LINKS
  );

  // About text lives on the cmfas-exams-page product's description
  const [aboutText, setAboutText] = useState(DEFAULT_ABOUT_TEXT);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("description")
        .eq("id", META_PRODUCT_ID)
        .maybeSingle();
      if (!cancelled && data?.description) setAboutText(data.description);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Mutations
  const handleEditProduct = async (
    productId: string,
    data: { title: string; description: string; tags: string[]; highlights: string[] }
  ) => {
    const { error } = await supabase
      .from("products")
      .update({
        title: data.title,
        description: data.description,
        tags: data.tags,
        highlights: data.highlights,
      })
      .eq("id", productId);
    if (error) {
      toast.error("Failed to update module");
      return;
    }
    toast.success("Module updated");
    refetchProducts();
  };

  const handleDeleteProduct = async (productId: string) => {
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) {
      toast.error("Failed to delete module");
      return;
    }
    toast.success("Module deleted");
    refetchProducts();
  };

  const handleTogglePublish = async (productId: string, published: boolean) => {
    const { error } = await supabase
      .from("products")
      .update({ published })
      .eq("id", productId);
    if (error) {
      toast.error("Failed to update module status");
      return;
    }
    toast.success(published ? "Module published" : "Module unpublished");
    refetchProducts();
  };

  const handleCategoryTitleEdit = async (newTitle: string) => {
    if (!categoryId) return;
    const clean = newTitle.replace(/^\p{Emoji_Presentation}\s*/u, "").trim();
    if (!clean) return;
    const { error } = await supabase
      .from("categories")
      .update({ name: clean })
      .eq("id", categoryId);
    if (error) {
      toast.error("Failed to update category title");
      return;
    }
    toast.success("Category title updated");
    refetchCategories();
  };

  const handleCategoryDescriptionEdit = async (newDescription: string) => {
    if (!categoryId) return;
    const { error } = await supabase
      .from("categories")
      .update({ description: newDescription })
      .eq("id", categoryId);
    if (error) {
      toast.error("Failed to update category description");
      return;
    }
    toast.success("Category description updated");
    refetchCategories();
  };

  const handleTogglePublished = async () => {
    if (!categoryId || !cmfasCategory) return;
    const newPublished = !cmfasCategory.published;
    const { error } = await supabase
      .from("categories")
      .update({ published: newPublished })
      .eq("id", categoryId);
    if (error) {
      toast.error("Failed to update publish status");
      return;
    }
    toast.success(newPublished ? "Category published" : "Category unpublished");
    invalidateCategoriesCache();
    refetchCategories();
  };

  const handleAboutUpdate = async (newValue: string) => {
    const previous = aboutText;
    setAboutText(newValue);
    const { error } = await supabase
      .from("products")
      .update({ description: newValue })
      .eq("id", META_PRODUCT_ID);
    if (error) {
      setAboutText(previous);
      throw error;
    }
  };

  const handleUsefulLinksUpdate = async (field: string, value: unknown) => {
    if (field === "useful_links") await updateUsefulLinks(value as UsefulLink[]);
  };

  const loading = categoriesLoading || productsLoading;

  if (loading) {
    return (
      <PageLayout
        title="CMFAS Exams | FINternship Learning Platform"
        description="Prepare for CMFAS exams with interactive modules, study videos, and an AI tutor."
      >
        <BrandedPageHeader
          tone="dark"
          showOnMobile
          title="CMFAS Exams"
          subtitle="Master the papers that unlock your RNF status."
        />
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-6">
          <SkeletonLoader type="category" />
        </div>
      </PageLayout>
    );
  }

  if (!cmfasCategory) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">CMFAS category not found</h1>
          <p className="text-muted-foreground mb-4">
            Expected a category named "CMFAS" in the database but none was found.
          </p>
          <button onClick={() => navigate("/")} className="text-primary hover:underline">
            Go back to home
          </button>
        </div>
      </div>
    );
  }

  const structuredData: StructuredData = {
    "@context": "https://schema.org" as const,
    "@type": "Course",
    name: "CMFAS Exam Preparation",
    description:
      "Comprehensive CMFAS exam preparation materials including modules M9, M9A, HI, RES5, practice tests, and study materials for capital markets financial advisory services certification.",
    url: `${window.location.origin}${window.location.pathname}`,
    courseMode: "online",
    educationalLevel: "professional",
  };

  return (
    <ProtectedPage pageId="cmfas-exams">
      <PageLayout
        title="CMFAS Exam Preparation - FINternship Learning Platform"
        description="Comprehensive CMFAS exam preparation materials including modules M9, M9A, HI, RES5, practice tests, and study materials."
        keywords="CMFAS exam, capital markets, financial advisory, certification, exam preparation, modules, practice tests"
        structuredData={structuredData}
      >
        <Tabs
          value={activeHubTab}
          onValueChange={handleHubTabChange}
          className="flex flex-col"
        >
          <BrandedPageHeader
            showOnMobile
            tone="dark"
            title="CMFAS Exam Preparation"
            subtitle="Capital Markets Financial Advisory Services — Your path to certification"
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "CMFAS" },
            ]}
            onTitleEdit={isAdminUser ? handleCategoryTitleEdit : undefined}
            onSubtitleEdit={isAdminUser ? handleCategoryDescriptionEdit : undefined}
            headerTabs={
              <TabsList className={HUB_TAB_LIST_CLASS}>
                <TabsTrigger value="modules" className={HUB_TAB_TRIGGER_CLASS}>
                  Modules
                </TabsTrigger>
                <TabsTrigger value="resources" className={HUB_TAB_TRIGGER_CLASS}>
                  Exam resources
                </TabsTrigger>
                <TabsTrigger value="about" className={HUB_TAB_TRIGGER_CLASS}>
                  About
                </TabsTrigger>
              </TabsList>
            }
          />

        <div className="mx-auto w-full max-w-6xl space-y-8 px-3 py-4 pb-24 sm:px-6 sm:py-6 sm:pb-28 md:px-8 md:py-10">
          {/* Draft banner */}
          {isAdminUser && cmfasCategory.published === false && (
            <div className="flex items-center justify-between rounded-lg border border-dashed border-muted-foreground/30 bg-muted/50 px-3 sm:px-4 py-2 sm:py-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Draft — only visible to admins</span>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="cmfas-publish-toggle" className="text-xs sm:text-sm cursor-pointer text-muted-foreground hidden sm:inline">
                  Published
                </Label>
                <Switch
                  id="cmfas-publish-toggle"
                  checked={cmfasCategory.published ?? false}
                  onCheckedChange={handleTogglePublished}
                />
              </div>
            </div>
          )}

            <TabsContent value="modules" className="space-y-4 outline-none">
              <section
                id="cmf-modules"
                className="space-y-5"
                aria-labelledby="cmf-modules-heading"
              >
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
                  Start with <strong>Getting Started</strong> to complete your essential setup, then work through each exam module. Recommended order: M9 → M9A → HI → RES5.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2
                    id="cmf-modules-heading"
                    className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
                  >
                    Your modules
                  </h2>
                  {isAdminUser && categoryId && (
                    <Button
                      type="button"
                      className="h-11 w-full shrink-0 gap-2 sm:h-10 sm:w-auto"
                      onClick={() => setCreateModuleOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      New module
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search CMFAS modules..."
                    className="pl-9"
                    aria-label="Search CMFAS modules"
                  />
                </div>

                <ProductsGrid
                  products={filteredProducts}
                  categoryName={cmfasCategory.name}
                  onProductClick={(id) => navigate(`/cmfas/module/${id.replace(/-module$/, "")}`)}
                  onClearFilters={() => setSearchQuery("")}
                  onEditProduct={isAdminUser ? handleEditProduct : undefined}
                  onDeleteProduct={isAdminUser ? handleDeleteProduct : undefined}
                  onTogglePublish={isAdminUser ? handleTogglePublish : undefined}
                  onNestingChange={refetchProducts}
                />
              </section>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4 outline-none">
              <CMFASUsefulLinks
                links={usefulLinks}
                onUpdate={handleUsefulLinksUpdate}
                variant="hub"
                hubCollapsible={false}
                description="Official portals, question banks, and references for CMFAS exam preparation."
              />
            </TabsContent>

            <TabsContent value="about" className="space-y-4 outline-none">
              <section
                className="rounded-lg border bg-card p-4 shadow-card sm:p-6"
                aria-labelledby="cmf-about-heading"
              >
                <h2
                  id="cmf-about-heading"
                  className="text-base font-semibold text-foreground sm:text-lg"
                >
                  About CMFAS certification
                </h2>
                <EditableText
                  value={aboutText}
                  onSave={isAdminUser ? handleAboutUpdate : undefined}
                  multiline
                  className="mt-4 text-muted-foreground leading-relaxed"
                  placeholder="Add information about CMFAS certification..."
                  readOnly={!isAdminUser}
                />
              </section>
            </TabsContent>
        </div>

        </Tabs>

        {isAdminUser && categoryId && (
          <Sheet open={createModuleOpen} onOpenChange={setCreateModuleOpen}>
            <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md overflow-y-auto">
              <SheetHeader className="text-left">
                <SheetTitle>Create new module</SheetTitle>
                <SheetDescription>
                  Add a CMFAS module. You can add videos, quizzes, and content on the next screen.
                </SheetDescription>
              </SheetHeader>
              <CreateModuleForm
                categoryId={categoryId}
                variant="embedded"
                onModuleCreated={refetchProducts}
                onEmbeddedClose={() => setCreateModuleOpen(false)}
                getModuleUrl={(slug) => `/cmfas/module/${slug.replace(/-module$/, "")}`}
              />
            </SheetContent>
          </Sheet>
        )}

        <CMFASHubChatFAB />
      </PageLayout>
    </ProtectedPage>
  );
}
