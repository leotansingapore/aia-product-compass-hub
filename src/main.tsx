import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { supabase } from './integrations/supabase/client'
import { RuntimeErrorOverlay } from './components/RuntimeErrorOverlay'
import {
  installStaleChunkRecovery,
  isStaleChunkError,
  recoverFromStaleChunk,
  resetStaleChunkRecovery,
} from './utils/staleChunkRecovery'

resetStaleChunkRecovery()
installStaleChunkRecovery()

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

if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    const preloadEvent = event as Event & {
      payload?: unknown
      error?: unknown
      preventDefault?: () => void
    }

    const reason = preloadEvent.payload ?? preloadEvent.error ?? event
    if (!isStaleChunkError(reason)) return

    preloadEvent.preventDefault?.()
    recoverFromStaleChunk()
  })
}

createRoot(document.getElementById("root")!).render(
  <RuntimeErrorOverlay>
    <App />
  </RuntimeErrorOverlay>
);
