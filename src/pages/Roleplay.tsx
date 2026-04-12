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

const PitchAnalysis = lazy(() => import('@/pages/PitchAnalysis'));

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
        title="🎭 AI Roleplay Training"
        subtitle="Practice your sales skills, objection handling, and client consultation with AI-powered video avatars"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Roleplay Training" }
        ]}
      />

      <div className="mx-auto px-3 sm:px-6 py-3 sm:py-6 md:py-8 pb-20 sm:pb-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="w-fit">
            <TabsTrigger value="roleplay" className="gap-1.5">
              <MessageCircle className="h-4 w-4" />
              AI Roleplay
            </TabsTrigger>
            <TabsTrigger value="pitch-analysis" className="gap-1.5">
              <Video className="h-4 w-4" />
              Pitch Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roleplay" className="space-y-3 sm:space-y-8 md:space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5 md:gap-6">
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