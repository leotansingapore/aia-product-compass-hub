import { lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { BrandedPageHeader } from '@/components/layout/BrandedPageHeader';
import { TavusVideoChat } from '@/components/roleplay/TavusVideoChat';
import { RoleplayDiagnostics } from '@/components/roleplay/RoleplayDiagnostics';
import { RoleplayScenarioCard } from '@/components/roleplay/RoleplayScenarioCard';
import { RoleplayGuide } from '@/components/roleplay/RoleplayGuide';
import { useRoleplay } from '@/hooks/useRoleplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

const PitchAnalysis = lazy(() => import('@/pages/PitchAnalysis'));

/** Header tab styling — underline style matching Learning Track */
const ROLEPLAY_TAB_NAV_CLASS =
  "flex w-full flex-nowrap justify-start gap-0 overflow-x-auto sm:gap-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const ROLEPLAY_TAB_LINK_CLASS =
  "inline-flex items-center gap-1.5 shrink-0 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 py-2 text-sm font-medium text-white/75 shadow-none transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent min-h-[44px] sm:min-h-0 sm:px-2";
const ROLEPLAY_TAB_ACTIVE_CLASS = "border-white text-white";

export default function Roleplay() {
  const { scenarios, selectedScenario, handleStartRoleplay } = useRoleplay();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'roleplay';

  const handleTabChange = (tab: string) => {
    setSearchParams(tab === 'roleplay' ? {} : { tab }, { replace: true });
  };

  if (selectedScenario) {
    return (
      <PageLayout
        title={`Roleplay - ${selectedScenario.title}`}
        description={selectedScenario.description}
      >
        <BrandedPageHeader
          title={`🎭 ${selectedScenario.title}`}
          subtitle={selectedScenario.description}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Roleplay", href: "/roleplay" },
            { label: selectedScenario.title }
          ]}
        />

        <div className="mx-auto px-4 sm:px-6 py-4 sm:py-8 md:pb-10 animate-fade-in">
          <RoleplayDiagnostics scenario={selectedScenario} />
          <TavusVideoChat scenario={selectedScenario} />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="AI Roleplay Training - FINternship"
      description="Practice sales, objection handling, and consultation skills with AI video avatars."
    >
      <BrandedPageHeader
        tone="dark"
        showOnMobile
        title="🎭 AI Roleplay Training"
        subtitle="Practice your sales skills, objection handling, and client consultation with AI-powered video avatars"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Roleplay Training" }
        ]}
        headerTabs={
          <nav className={ROLEPLAY_TAB_NAV_CLASS} aria-label="Roleplay sections">
            <button
              onClick={() => handleTabChange('roleplay')}
              className={cn(ROLEPLAY_TAB_LINK_CLASS, activeTab === 'roleplay' && ROLEPLAY_TAB_ACTIVE_CLASS)}
            >
              <MessageCircle className="h-4 w-4" />
              AI Roleplay
            </button>
            <button
              onClick={() => handleTabChange('pitch-analysis')}
              className={cn(ROLEPLAY_TAB_LINK_CLASS, activeTab === 'pitch-analysis' && ROLEPLAY_TAB_ACTIVE_CLASS)}
            >
              <Video className="h-4 w-4" />
              Pitch Analysis
            </button>
          </nav>
        }
      />

      <div className="mx-auto px-3 sm:px-6 py-3 sm:py-6 md:py-8 pb-20 sm:pb-8">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsContent value="roleplay" className="space-y-3 sm:space-y-8 md:space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-5 md:gap-6">
              {scenarios.map((scenario) => (
                <RoleplayScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  onStart={handleStartRoleplay}
                />
              ))}
            </div>
            <RoleplayGuide />
          </TabsContent>

          <TabsContent value="pitch-analysis">
            <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted-foreground">Loading Pitch Analysis...</div>}>
              <PitchAnalysis embedded />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}