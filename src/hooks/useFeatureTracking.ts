// useFeatureTracking - logs a feature_open the first time (per page load) a
// signed-in person lands on a screen the catalog knows. Called once from
// App.tsx inside the router. The route->feature map lives in
// src/lib/featureCatalog.ts, where a test holds it against AppRoutes.tsx so a
// new screen cannot ship without either a key or a written reason.

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackFeatureOpen } from '@/lib/analytics'
import { featureForPath } from '@/lib/featureCatalog'

export function useFeatureTracking(): void {
  const { pathname } = useLocation()
  useEffect(() => {
    const hit = featureForPath(pathname)
    if (hit) trackFeatureOpen(hit.key)
  }, [pathname])
}

/** Renders nothing; exists so the hook can sit inside <BrowserRouter>. */
export function FeatureTracking(): null {
  useFeatureTracking()
  return null
}
