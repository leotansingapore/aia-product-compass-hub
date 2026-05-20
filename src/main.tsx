import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { RuntimeErrorOverlay } from './components/RuntimeErrorOverlay'
import {
  installStaleChunkRecovery,
  isStaleChunkError,
  recoverFromStaleChunk,
  resetStaleChunkRecovery,
} from './utils/staleChunkRecovery'

resetStaleChunkRecovery()
installStaleChunkRecovery()

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
