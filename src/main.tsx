import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ChecklistProvider } from '@/hooks/useChecklistProgress';
import { OnboardingProvider } from '@/hooks/useOnboarding';

createRoot(document.getElementById("root")!).render(
  <OnboardingProvider>
    <ChecklistProvider>
      <App />
    </ChecklistProvider>
  </OnboardingProvider>
);
