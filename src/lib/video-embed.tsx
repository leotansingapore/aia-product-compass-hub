import { useState } from "react";
import { Play } from "lucide-react";

interface VideoEmbedProps {
  embedUrl: string;
  platform: string;
}

/**
 * Lazy-loading video embed.
 *
 * Iframes for YouTube/Vimeo/Loom each pull ~300-700 KB of player JS on mount,
 * even when the user never clicks play. On lesson pages with multiple embeds
 * this dominates the LCP and INP budget.
 *
 * Strategy ("facade" pattern, same approach as `lite-youtube-embed`):
 *   1. Render a lightweight placeholder card (CSS only — no third-party JS).
 *   2. On the first user interaction, swap in the real iframe with `autoplay`
 *      so playback starts immediately and the click feels native.
 *
 * Native <video> (mp4) is already cheap with `preload="metadata"`, so it
 * loads eagerly as before.
 */
export function VideoEmbed({ embedUrl, platform }: VideoEmbedProps) {
  const [activated, setActivated] = useState(false);

  if (platform === "mp4") {
    return (
      <div className="my-4">
        <div
          className="relative w-full bg-black rounded-lg overflow-hidden border border-border shadow-sm"
          style={{ paddingBottom: "56.25%" }}
        >
          <video
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full"
            controls
            controlsList="nodownload"
            preload="metadata"
            playsInline
          />
        </div>
      </div>
    );
  }

  // Append autoplay param when the user actually clicks so playback starts
  // without a second tap. We can't predict every provider's param name, so
  // append the most common ones (`autoplay=1`) — providers ignore unknowns.
  const activatedUrl = activated
    ? embedUrl + (embedUrl.includes("?") ? "&" : "?") + "autoplay=1"
    : embedUrl;

  return (
    <div className="my-4">
      <div className="relative w-full bg-black aspect-video rounded-lg overflow-hidden border border-border shadow-sm">
        {activated ? (
          <iframe
            src={activatedUrl}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            // @ts-ignore — legacy attributes for Safari/Firefox fullscreen
            webkitallowfullscreen="true"
            mozallowfullscreen="true"
            style={{ border: 0 }}
            title={`${platform} video`}
          />
        ) : (
          <button
            type="button"
            onClick={() => setActivated(true)}
            className="absolute inset-0 flex items-center justify-center group bg-gradient-to-br from-black/60 to-black/80 hover:from-black/40 hover:to-black/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Play ${platform} video`}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg group-hover:scale-110 transition-transform">
              <Play className="h-7 w-7 ml-1" fill="currentColor" />
            </span>
            <span className="absolute bottom-3 right-3 text-xs uppercase tracking-wide text-white/70">
              {platform}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
