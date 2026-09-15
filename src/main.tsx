import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { supabase } from './integrations/supabase/client'
import { RuntimeErrorOverlay } from './components/RuntimeErrorOverlay'
import {
  installStaleChunkRecovery,
  resetStaleChunkRecovery,
} from './utils/staleChunkRecovery'
import { bootErrorReporting } from './lib/sentry-boot'

resetStaleChunkRecovery()
installStaleChunkRecovery()
// Listeners first, so a throw during render is held for Sentry; the SDK itself
// arrives after load.
bootErrorReporting()

// A password-recovery link can land the recovery session on ANY route: Supabase
// parses and strips the token from the URL asynchronously, so a page reading
// window.location.hash later races that stripping. Catch the recovery event
// globally and hand off to the reset form, where the now-persisted session lets
// the user set a new password. Registered at module load, before React renders,
// so it never misses the event.
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY' && !window.location.pathname.startsWith('/reset-password')) {
      window.location.assign('/reset-password')
    }
  })
}

createRoot(document.getElementById("root")!).render(
  <RuntimeErrorOverlay>
    <App />
  </RuntimeErrorOverlay>
);
