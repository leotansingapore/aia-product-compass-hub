import { useSearchParams } from "react-router-dom";
import { BookOpen, Brain } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductsGrid } from "@/features/library/ProductsGrid";
import { QuestionBanksList } from "@/features/library/QuestionBanksList";

type LibraryTab = "products" | "banks";

function isLibraryTab(v: string | null): v is LibraryTab {
  return v === "products" || v === "banks";
}

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab: LibraryTab = isLibraryTab(rawTab) ? rawTab : "products";

  const setTab = (tab: LibraryTab) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next, { replace: true });
  };

  return (
    <PageLayout
      title="Library | FINternship"
      description="Browse product categories and practice with product-specific question banks."
    >
      <BrandedPageHeader
        title="Library"
        titlePrefix="📚 "
        subtitle="Product categories, training content, and practice question banks — all in one place."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Library" },
        ]}
      />

      <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-6 py-4 sm:py-8 pb-20 sm:pb-8">
        <Tabs value={activeTab} onValueChange={(v) => setTab(v as LibraryTab)}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="products" className="gap-1.5">
              <BookOpen className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="banks" className="gap-1.5">
              <Brain className="h-4 w-4" />
              Question Banks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-4 sm:mt-6">
            <ProductsGrid />
          </TabsContent>
          <TabsContent value="banks" className="mt-4 sm:mt-6">
            <QuestionBanksList />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
