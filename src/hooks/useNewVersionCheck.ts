import { useEffect, useRef, useState } from "react";

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // every 5 minutes

/** Fetches /index.html and returns a fingerprint of the hashed JS/CSS asset URLs.
 *  Because Vite content-hashes every bundle on each deploy, any new build will
 *  produce a different fingerprint. */
async function getAppFingerprint(): Promise<string | null> {
  try {
    const res = await fetch("/?__vcheck=" + Date.now(), {
      cache: "no-store",
      headers: { Accept: "text/html" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const assets = html.match(/\/assets\/[^"' >]+\.(js|css)/g) ?? [];
    return assets.sort().join("|");
  } catch {
    return null;
  }
}

export function useNewVersionCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const fingerprintRef = useRef<string | null>(null);

  useEffect(() => {
    getAppFingerprint().then((fp) => {
      fingerprintRef.current = fp;
    });

    const interval = setInterval(async () => {
      if (document.visibilityState === "hidden") return;
      const fp = await getAppFingerprint();
      if (fp && fingerprintRef.current && fp !== fingerprintRef.current) {
        setUpdateAvailable(true);
        clearInterval(interval);
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return { updateAvailable };
}
