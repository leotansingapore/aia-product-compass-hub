import { memo, useState } from "react";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { SearchHero } from "@/components/dashboard/SearchHero";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { WhatsNewSection } from "@/components/dashboard/WhatsNewSection";
import { ProductCategories } from "@/components/dashboard/ProductCategories";
import { ContinueWhereYouLeftOff } from "@/components/dashboard/ContinueWhereYouLeftOff";
import { SearchFilters } from "@/components/dashboard/SearchFilters";
import { SearchResults } from "@/components/dashboard/SearchResults";
import { PageLayout } from "@/components/layout/PageLayout";
import { useDashboardSearch } from "@/hooks/useDashboardSearch";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Dashboard = memo(() => {
  const {
    query,
    filters,
    results,
    resultCounts,
    isSearching,
    hasQuery,
    hasActiveFilters,
    showFilters,
    setShowFilters,
    sortBy,
    setSortBy,
    activeFilterCount,
    availableCategories,
    availableTags,
    handleSearch,
    handleCategoryFilter,
    handleTagFilter,
    handleContentFilter,
    handleTypeFilter,
    clearFilters,
    clearSearch
  } = useDashboardSearch();

  const [showUpdates, setShowUpdates] = useState(false);

  return (
    <PageLayout
      title="Dashboard - Your Learning Hub | FINternship"
      description="Access your personalized learning dashboard. Browse product categories, track progress, discover recommendations, and continue your financial advisory education journey."
      keywords="dashboard, learning hub, financial products, training progress, product categories, financial advisor platform"
    >
      {/* Desktop Header */}
      <div className="hidden md:block">
        <BrandedPageHeader
          title="FINternship Learning Platform"
          subtitle="Your comprehensive resource for product knowledge and sales excellence"
          breadcrumbs={[{ label: "Home" }]}
          searchBar={<SearchHero onSearch={handleSearch} variant="compact" />}
        />
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-1 sm:px-4 py-2 sm:py-4">
        <SearchHero onSearch={handleSearch} />
      </div>

      {/* Main Content */}
      <div className="mx-auto px-1 sm:px-4 md:px-6 py-2 sm:py-4 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">

        {hasQuery ? (
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 space-y-4 sm:space-y-6`}>
              <SearchFilters
                filters={filters}
                activeFilterCount={activeFilterCount}
                hasActiveFilters={hasActiveFilters}
                availableCategories={availableCategories}
                availableTags={availableTags}
                onCategoryFilter={(categoryId, checked) => handleCategoryFilter(categoryId, Boolean(checked))}
                onTagFilter={(tag, checked) => handleTagFilter(tag, Boolean(checked))}
                onContentFilter={(type, checked) => handleContentFilter(type, Boolean(checked))}
                onClearFilters={clearFilters}
              />
            </div>
            <SearchResults
              query={query}
              results={results}
              resultCounts={resultCounts}
              isSearching={isSearching}
              hasQuery={hasQuery}
              hasActiveFilters={hasActiveFilters}
              filters={filters}
              showFilters={showFilters}
              sortBy={sortBy}
              activeFilterCount={activeFilterCount}
              availableCategories={availableCategories}
              onShowFilters={setShowFilters}
              onSortBy={setSortBy}
              onTagFilter={(tag, checked) => handleTagFilter(tag, Boolean(checked))}
              onContentFilter={(type, checked) => handleContentFilter(type, Boolean(checked))}
              onTypeFilter={handleTypeFilter}
              onSetFilters={() => {}}
              onClearSearch={clearSearch}
            />
          </div>
        ) : (
          <>
            {/* 1. Product Categories */}

            {/* 2. Product Categories */}
            <ProductCategories />

            {/* 3. Recently Updated — collapsed by default */}
            <div>
              <button
                onClick={() => setShowUpdates(!showUpdates)}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown className={cn("h-4 w-4 transition-transform", !showUpdates && "-rotate-90")} />
                Recently Updated
              </button>
              {showUpdates && (
                <div className="mt-3">
                  <WhatsNewSection />
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </PageLayout>
  );
});

export default Dashboard;
