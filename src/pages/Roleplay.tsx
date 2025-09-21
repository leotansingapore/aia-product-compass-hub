import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TavusVideoChat } from '@/components/roleplay/TavusVideoChat';
import { RoleplayDiagnostics } from '@/components/roleplay/RoleplayDiagnostics';
import { RoleplayScenarioCard } from '@/components/roleplay/RoleplayScenarioCard';
import { RoleplayGuide } from '@/components/roleplay/RoleplayGuide';
import { useRoleplay } from '@/hooks/useRoleplay';


export default function Roleplay() {
  const { scenarios, selectedScenario, handleStartRoleplay, handleBackToSelection } = useRoleplay();

  if (selectedScenario) {
    return (
      <PageLayout
        title={`Roleplay - ${selectedScenario.title}`}
        description={selectedScenario.description}
        className="container mx-auto p-6 space-y-6"
      >
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleBackToSelection}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Scenarios
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{selectedScenario.title}</h1>
            <p className="text-muted-foreground">{selectedScenario.description}</p>
          </div>
        </div>
        
        <RoleplayDiagnostics scenario={selectedScenario} />
        <TavusVideoChat scenario={selectedScenario} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="AI Roleplay Training - FINternship"
      description="Practice sales, objection handling, and consultation skills with AI video avatars."
      className="container mx-auto px-1 sm:px-4 md:px-6 py-2 sm:py-6 space-y-3 sm:space-y-6"
    >
      <div className="text-center space-y-3 sm:space-y-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">AI Roleplay Training</h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Practice your sales skills, objection handling, and client consultation with AI-powered video avatars
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {scenarios.map((scenario) => (
          <RoleplayScenarioCard
            key={scenario.id}
            scenario={scenario}
            onStart={handleStartRoleplay}
          />
        ))}
      </div>

      <RoleplayGuide />
    </PageLayout>
  );
}