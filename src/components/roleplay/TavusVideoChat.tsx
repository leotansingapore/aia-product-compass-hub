import { OpenAIRoleplayChat } from './OpenAIRoleplayChat';

interface RoleplayScenario {
  id: string;
  title: string;
  description: string;
  category: 'sales' | 'objection' | 'consultation' | 'exam-prep';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  objectives: string[];
  replicaId?: string;
  personaId?: string;
  personaDescription?: string;
}

interface TavusVideoChatProps {
  scenario: RoleplayScenario;
}

// Temporary fallback to OpenAI while fixing Tavus integration
export function TavusVideoChat({ scenario }: TavusVideoChatProps) {
  return <OpenAIRoleplayChat scenario={scenario} />;
}