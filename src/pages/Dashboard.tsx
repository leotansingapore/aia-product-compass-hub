import { memo } from "react";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { SearchHero } from "@/components/dashboard/SearchHero";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { WhatsNewSection } from "@/components/dashboard/WhatsNewSection";
import { ProductCategories } from "@/components/dashboard/ProductCategories";
import { ContinueWhereYouLeftOff } from "@/components/dashboard/ContinueWhereYouLeftOff";
import { AdminFeedbackAlert } from "@/components/dashboard/AdminFeedbackAlert";
import { SearchFilters } from "@/components/dashboard/SearchFilters";
import { SearchResults } from "@/components/dashboard/SearchResults";
import { PageLayout } from "@/components/layout/PageLayout";
import { LearningTrackHeroCard } from "@/components/learning-track/LearningTrackHeroCard";
import { TierUpgradePrompt } from "@/components/tier/TierUpgradePrompt";
import { useDashboardSearch } from "@/hooks/useDashboardSearch";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";

const Dashboard = memo(() => {
  const { user } = useSimplifiedAuth();
  const greeting = user?.email?.split("@")[0] || "there";
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

  return (
    <PageLayout
      title="Dashboard - Your Learning Hub | FINternship"
      description="Access your personalized learning dashboard. Browse product categories, track progress, discover recommendations, and continue your financial advisory education journey."
      keywords="dashboard, learning hub, financial products, training progress, product categories, financial advisor platform"
    >
      {/* Hero — warm greeting + learning progress + search */}
      <div className="relative overflow-hidden">
        {/* Decorative gradient orb */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-primary/15 to-accent/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-16 w-48 h-48 rounded-full bg-gradient-to-tr from-accent/10 to-primary/10 blur-3xl pointer-events-none" />

        <div className="relative px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif tracking-tight mb-2">
            Welcome back, {greeting}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mb-6 max-w-xl">
            Pick up where you left off or explore something new.
          </p>

          {!hasQuery && <LearningTrackHeroCard />}

          <div className="mt-6 max-w-2xl">
            <SearchHero onSearch={handleSearch} variant="compact" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-1 sm:px-4 md:px-6 py-2 sm:py-4 md:py-8 space-y-6 sm:space-y-8 md:space-y-12">

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
            {/* 0. Admin feedback alert */}
            <AdminFeedbackAlert />

            {/* 0.5 Tier upgrade prompt (only renders for papers_taker non-admin users) */}
            <TierUpgradePrompt />

            {/* 1. Continue where you left off */}
            <ContinueWhereYouLeftOff />

            {/* 2. Product Categories */}
            <ProductCategories />

            {/* 3. Recently Updated */}
            <WhatsNewSection />
          </>
        )}

      </div>
    </PageLayout>
  );
});

export default Dashboard;
