import { memo } from "react";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { SearchHero } from "@/components/dashboard/SearchHero";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ProductCategories } from "@/components/dashboard/ProductCategories";
import { SearchFilters } from "@/components/dashboard/SearchFilters";
import { SearchResults } from "@/components/dashboard/SearchResults";
import { PageLayout } from "@/components/layout/PageLayout";
import { useDashboardSearch } from "@/hooks/useDashboardSearch";

const Dashboard = memo(() => {
  const {
    query,
    filters,
    results,
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
    clearFilters,
    clearSearch
  } = useDashboardSearch();


  return (
    <PageLayout
      title="Dashboard - Your Learning Hub | FINternship"
      description="Access your personalized learning dashboard. Browse product categories, track progress, discover recommendations, and continue your financial advisory education journey."
      keywords="dashboard, learning hub, financial products, training progress, product categories, financial advisor platform"
    >
      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden md:block">
        <BrandedPageHeader
          title="FINternship Learning Platform"
          subtitle="Your comprehensive resource for product knowledge and sales excellence"
          breadcrumbs={[{ label: "Home" }]}
        />
      </div>
      
      {/* Main Content */}
      <div className="mx-auto px-1 sm:px-4 md:px-6 py-2 sm:py-4 md:py-8 md:pb-8">
        
        {/* Search Hero */}
        <SearchHero onSearch={handleSearch} />

        {hasQuery && (
          <div className="mt-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
              
              {/* Filters Sidebar */}
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

              {/* Results */}
              <SearchResults
                query={query}
                results={results}
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
                onSetFilters={() => {}} // This will be handled by the filters component
                onClearSearch={clearSearch}
              />
            </div>
          </div>
        )}

        {!hasQuery && (
          <>
            {/* Quick Actions */}
            <div className="mt-6">
              <QuickActions />
            </div>

            {/* Product Categories */}
            <div className="mt-6">
              <ProductCategories />
            </div>
          </>
        )}

      </div>
    </PageLayout>
  );
});

export default Dashboard;