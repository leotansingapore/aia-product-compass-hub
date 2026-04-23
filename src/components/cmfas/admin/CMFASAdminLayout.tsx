import { ChevronRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AdminModulesTab } from './AdminModulesTab';
import { AdminExamResourcesTab } from './AdminExamResourcesTab';
import { AdminProgressTab } from './AdminProgressTab';

type AdminTab = 'modules' | 'exam-resources' | 'admin';

const TABS: Array<{ id: AdminTab; label: string }> = [
  { id: 'modules', label: 'Modules' },
  { id: 'exam-resources', label: 'Exam resources' },
  { id: 'admin', label: 'Admin' },
];

const ADMIN_TAB_PARAM = 'adminTab';

function parseTab(raw: string | null): AdminTab {
  return TABS.find((t) => t.id === raw)?.id ?? 'modules';
}

/**
 * Admin-only surface for `/cmfas-exams`. Blue-gradient hero + 3 tabs.
 * Replaces the learner Study Desk view when the signed-in user is an admin
 * and isn't using the "View as user" impersonation switcher.
 *
 * State lives in the URL (`?adminTab=...`) so refresh and back/forward work.
 */
export function CMFASAdminLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseTab(searchParams.get(ADMIN_TAB_PARAM));

  const setTab = (id: AdminTab) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id === 'modules') next.delete(ADMIN_TAB_PARAM);
        else next.set(ADMIN_TAB_PARAM, id);
        return next;
      },
      { replace: true },
    );
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-y-auto">
      {/* Blue-gradient hero — matches the app's BrandedPageHeader */}
      <header
        className={cn(
          'relative overflow-hidden',
          'bg-gradient-hero text-white border-b border-white/20',
        )}
      >
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-[min(100%,80rem)] px-4 pb-0 pt-8 sm:px-6 md:px-10 md:pt-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-sm opacity-90" aria-label="Breadcrumb">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden />
            <span className="font-medium">CMFAS</span>
          </nav>

          <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            CMFAS Exam Preparation
          </h1>
          <p className="mt-2 max-w-2xl text-sm opacity-90 sm:text-base">
            Capital Markets Financial Advisory Services — Your path to certification
          </p>

          {/* Tabs bar — bottom of hero, underline style */}
          <div
            className="mt-8 flex items-center gap-1 border-b border-white/20"
            role="tablist"
            aria-label="CMFAS admin sections"
          >
            {TABS.map((t) => {
              const isActive = t.id === activeTab;
              return (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'relative px-3 py-3 text-sm font-medium transition-colors',
                    isActive ? 'text-white' : 'text-white/75 hover:text-white',
                  )}
                >
                  {t.label}
                  {isActive && (
                    <span
                      className="absolute inset-x-0 -bottom-[1px] h-0.5 bg-white"
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Tab content */}
      <div className="mx-auto w-full max-w-[min(100%,80rem)] flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-8">
        {activeTab === 'modules' && <AdminModulesTab />}
        {activeTab === 'exam-resources' && <AdminExamResourcesTab />}
        {activeTab === 'admin' && <AdminProgressTab />}
      </div>
    </div>
  );
}
