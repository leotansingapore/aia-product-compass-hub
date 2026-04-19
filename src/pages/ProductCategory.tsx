import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedSection } from "@/components/ProtectedSection";
import { CreateModuleForm } from "@/components/admin/CreateModuleForm";
import { usePermissions } from "@/hooks/usePermissions";
import { useViewMode } from "@/components/admin/AdminViewSwitcher";
import { EnhancedSearchBar } from "@/components/EnhancedSearchBar";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { PageLayout, StructuredData } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { ProductsGrid } from "@/components/category/ProductsGrid";
import { ChildCategoriesGrid } from "@/components/category/ChildCategoriesGrid";
import { getCategorySlug } from "@/utils/slugUtils";
import { useProductCategory } from "@/hooks/useProductCategory";
import { supabase } from "@/integrations/supabase/client";
import {
  invalidateCategoriesCache,
  useCategories,
  useAllProducts,
  getCategoryChildren,
} from "@/hooks/useProducts";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useBatchVideoProgress } from "@/hooks/useBatchVideoProgress";

// Helper function to get category info for backward compatibility
function getCategoryInfo(categoryId: string) {
  const categoryInfo = {
    investment: {
      title: "Investment Products",
      description:
        "Grow your wealth with our range of investment-linked and guaranteed products",
      icon: "📈",
    },
    endowment: {
      title: "Endowment Products",
      description:
        "Balanced solutions combining savings and protection for your financial goals",
      icon: "💰",
    },
    "whole-life": {
      title: "Whole Life Products",
      description:
        "Lifelong protection with cash value accumulation and estate planning benefits",
      icon: "🛡️",
    },
    term: {
      title: "Term Products",
      description:
        "Affordable life protection for specific periods and life stages",
      icon: "⏳",
    },
    medical: {
      title: "Medical Insurance Products",
      description: "Comprehensive health protection for you and your family",
      icon: "🏥",
    },
  };

  return categoryInfo[categoryId as keyof typeof categoryInfo];
}

export default function ProductCategory() {
  const {
    categorySlugOrId,
    categoryId,
    category,
    products: filteredProducts,
    loading,
    searchQuery,
    refetch,
    refetchCategories,
    handleSearch,
    handleProductClick,
    clearFilters,
  } = useProductCategory();

  // CMFAS has a dedicated page at /cmfas-exams — redirect to keep both URLs in sync
  if (
    categorySlugOrId === "cmfas" ||
    category?.name?.toLowerCase() === "cmfas"
  ) {
    return <Navigate to="/cmfas-exams" replace />;
  }

  const { isAdmin } = usePermissions();
  const { isViewingAsUser } = useViewMode();

  // Nested categories: if the current category is a parent (has children),
  // render the children as a sub-category grid instead of products.
  const { categories: allCategories } = useCategories();
  const { allProducts } = useAllProducts();
  const childCategories = categoryId
    ? getCategoryChildren(categoryId, allCategories)
    : [];
  const visibleChildCategories = isViewingAsUser
    ? childCategories.filter((c) => c.published !== false)
    : childCategories;
  const isParentCategory = visibleChildCategories.length > 0;
  const productCountByChild: Record<string, number> = {};
  allProducts.forEach((p) => {
    productCountByChild[p.category_id] =
      (productCountByChild[p.category_id] || 0) + 1;
  });

  // Resolve parent chain for breadcrumbs when viewing a child category
  const parentCategory = category?.parent_id
    ? allCategories.find((c) => c.id === category.parent_id)
    : undefined;

  // Filter out unpublished products when viewing as user
  const visibleProducts = isViewingAsUser
    ? filteredProducts.filter((p) => p.published !== false)
    : filteredProducts;

  const [createModuleOpen, setCreateModuleOpen] = useState(false);

  // Batch-fetch video completion progress for all visible products
  const productIds = visibleProducts.map((p) => p.id);
  const videoCountsByProduct = Object.fromEntries(
    visibleProducts.map((p) => [p.id, (p as any).training_videos?.length || 0]),
  );
  const batchProgress = useBatchVideoProgress(productIds, videoCountsByProduct);
  const completionMap = Object.fromEntries(
    Object.entries(batchProgress).map(([id, p]) => [id, p.percentage]),
  );

  const handleEditProduct = async (
    productId: string,
    data: {
      title: string;
      description: string;
      tags: string[];
      highlights: string[];
    },
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
      console.error(error);
    } else {
      toast.success("Module updated");
      refetch();
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      toast.error("Failed to delete module");
      console.error(error);
    } else {
      toast.success("Module deleted");
      refetch();
    }
  };

  const handleToggleProductPublish = async (
    productId: string,
    newPublished: boolean,
  ) => {
    const { error } = await supabase
      .from("products")
      .update({ published: newPublished })
      .eq("id", productId);
    if (error) {
      toast.error("Failed to update product status");
    } else {
      toast.success(newPublished ? "Product published" : "Product unpublished");
      refetch();
    }
  };

  const handleCategoryTitleEdit = async (newTitle: string) => {
    if (!categoryId) return;
    // Strip emoji prefix if present (e.g. "📈 Investment Products" -> "Investment Products")
    const cleanTitle = newTitle
      .replace(/^\p{Emoji_Presentation}\s*/u, "")
      .trim();
    if (!cleanTitle) return;
    const { error } = await supabase
      .from("categories")
      .update({ name: cleanTitle })
      .eq("id", categoryId);
    if (error) {
      toast.error("Failed to update category title");
      console.error(error);
    } else {
      toast.success("Category title updated");
      refetchCategories();
    }
  };

  const handleCategoryDescriptionEdit = async (newDescription: string) => {
    if (!categoryId) return;
    const { error } = await supabase
      .from("categories")
      .update({ description: newDescription })
      .eq("id", categoryId);
    if (error) {
      toast.error("Failed to update category description");
      console.error(error);
    } else {
      toast.success("Category description updated");
      refetchCategories();
    }
  };

  const handleTogglePublished = async () => {
    if (!categoryId) return;
    const newPublished = !category?.published;
    const { error } = await supabase
      .from("categories")
      .update({ published: newPublished })
      .eq("id", categoryId);
    if (error) {
      toast.error("Failed to update publish status");
    } else {
      toast.success(
        newPublished ? "Category published" : "Category unpublished",
      );
      invalidateCategoriesCache();
      refetchCategories();
    }
  };

  // Get category info for meta tags
  const categoryInfo = getCategoryInfo(categoryId || "");

  if (loading) {
    return <SkeletonLoader type="category" />;
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Category not found</h1>
          <p className="text-muted-foreground mb-4">
            The category "{categorySlugOrId}" doesn't exist. Category ID:{" "}
            {categoryId}
          </p>
          <button
            onClick={() => window.history.back()}
            className="text-primary hover:underline"
          >
            Go back to home
          </button>
        </div>
      </div>
    );
  }

  const structuredData: StructuredData = {
    "@context": "https://schema.org" as const,
    "@type": "CollectionPage",
    name: `${categoryInfo?.title || "Product Category"} Training`,
    description:
      categoryInfo?.description ||
      "Professional financial product training resources",
    url: `${window.location.origin}${window.location.pathname}`,
    isPartOf: {
      "@type": "WebSite",
      name: "FINternship Learning Platform",
      url: window.location.origin,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: visibleProducts.length,
      itemListElement: visibleProducts.slice(0, 10).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Course",
          name: product.title,
          description: product.description || `Learn about ${product.title}`,
          url: `${window.location.origin}/product/${product.id}`,
          courseMode: "online",
          educationalLevel: "professional",
        },
      })),
    },
  };

  return (
    <PageLayout
      title={`${categoryInfo?.title || "Product Category"} - Training & Resources | FINternship`}
      description={`Master ${categoryInfo?.title.toLowerCase() || "products"} with comprehensive training resources. ${categoryInfo?.description || "Professional insurance and investment solutions"} featuring expert guides, training videos, and AI assistance.`}
      keywords={`${categoryInfo?.title.toLowerCase() || "products"}, financial advisor training, product knowledge, insurance training, investment education`}
      structuredData={structuredData}
      openGraph={{
        title: `${categoryInfo?.title || "Product Category"} - Training & Resources | FINternship`,
        description: `Master ${categoryInfo?.title.toLowerCase() || "products"} with comprehensive training resources and expert guidance.`,
        type: "section",
      }}
    >
      <BrandedPageHeader
        title={category.name}
        titlePrefix={categoryInfo?.icon ? `${categoryInfo.icon} ` : undefined}
        subtitle={category.description || categoryInfo?.description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Product Categories", href: "/categories" },
          ...(parentCategory
            ? [
                {
                  label: parentCategory.name,
                  href: `/category/${getCategorySlug(parentCategory.name)}`,
                },
              ]
            : []),
          { label: category.name },
        ]}
        onTitleEdit={isAdmin() ? handleCategoryTitleEdit : undefined}
        onSubtitleEdit={isAdmin() ? handleCategoryDescriptionEdit : undefined}
      />

      <div className="mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-4 md:py-8">
        {/* Draft Banner */}
        {isAdmin() && category.published === false && (
          <div className="mb-3 sm:mb-6 flex items-center justify-between rounded-lg border border-dashed border-muted-foreground/30 bg-muted/50 px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Draft — only visible to admins</span>
            </div>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="category-publish-toggle"
                className="text-xs sm:text-sm cursor-pointer text-muted-foreground hidden sm:inline"
              >
                Published
              </Label>
              <Switch
                id="category-publish-toggle"
                checked={category.published ?? false}
                onCheckedChange={handleTogglePublished}
              />
            </div>
          </div>
        )}

        {/* Sticky Search + admin new module (hidden when showing sub-categories) */}
        {!isParentCategory && (
          <div className="mb-3 sm:mb-6 md:mb-8 sticky top-[57px] md:top-[48px] z-20 bg-background/95 backdrop-blur-sm -mx-2 sm:-mx-4 md:-mx-6 px-2 sm:px-4 md:px-6 py-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="min-w-0 flex-1">
                <EnhancedSearchBar
                  onSearch={handleSearch}
                  placeholder={`Search ${category.name.toLowerCase()}...`}
                />
              </div>
              {isAdmin() && categoryId && (
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
          </div>
        )}

        {isParentCategory ? (
          <ChildCategoriesGrid
            parentName={category.name}
            subCategories={visibleChildCategories}
            productCounts={productCountByChild}
          />
        ) : (
          <ProductsGrid
            products={visibleProducts}
            categoryName={category.name}
            onProductClick={handleProductClick}
            onClearFilters={clearFilters}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onTogglePublish={handleToggleProductPublish}
            onNestingChange={refetch}
            completionMap={completionMap}
          />
        )}

        {isAdmin() && categoryId && (
          <Sheet open={createModuleOpen} onOpenChange={setCreateModuleOpen}>
            <SheetContent
              side="right"
              className="flex w-full flex-col gap-0 sm:max-w-md overflow-y-auto"
            >
              <SheetHeader className="text-left">
                <SheetTitle>Create new module</SheetTitle>
                <SheetDescription>
                  Add a module to {category.name}. You can add training content
                  after creating it.
                </SheetDescription>
              </SheetHeader>
              <CreateModuleForm
                categoryId={categoryId}
                variant="embedded"
                onModuleCreated={refetch}
                onEmbeddedClose={() => setCreateModuleOpen(false)}
              />
            </SheetContent>
          </Sheet>
        )}
      </div>
    </PageLayout>
  );
}
