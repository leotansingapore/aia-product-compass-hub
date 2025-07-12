import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { OnboardingProvider } from '@/hooks/useOnboarding';

createRoot(document.getElementById("root")!).render(
  <OnboardingProvider>
    <App />
  </OnboardingProvider>
);
