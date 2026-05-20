// Streams the Week 1 recap video from a GitHub release with proper headers
// for inline `<video>` playback on iOS Safari and range-request support
// for scrub / 10-sec skip on every browser.
//
// GitHub's release CDN serves with `Content-Disposition: attachment` and
// `Content-Type: application/octet-stream`, which iPad treats as a download.
// We pass through the byte stream with Content-Type rewritten to `video/mp4`
// and Content-Disposition set to `inline`.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, range",
  "Access-Control-Expose-Headers":
    "content-length, content-range, accept-ranges, content-type",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
};

// Each entry has a `video` (mp4) URL and an optional `vtt` (WebVTT subtitle)
// URL. Callers request `?key=week-1` for the video and `?key=week-1.vtt` for
// the subtitle track.
type Asset = { video: string; vtt?: string };

const ASSET_MAP: Record<string, Asset> = {
  "week-1": {
    video:
      "https://github.com/leotansingapore/aia-product-compass-hub/releases/download/fastrack-training-1/fastrack-training-1-preview.mp4",
    vtt:
      "https://github.com/leotansingapore/aia-product-compass-hub/releases/download/fastrack-training-1/fastrack-training-1-preview.en.vtt",
  },
  "week-2": {
    video:
      "https://github.com/leotansingapore/aia-product-compass-hub/releases/download/fastrack-training-2/fastrack-training-2-preview.mp4",
    vtt:
      "https://github.com/leotansingapore/aia-product-compass-hub/releases/download/fastrack-training-2/fastrack-training-2-preview.en.vtt",
  },
  "week-3": {
    video:
      "https://github.com/leotansingapore/aia-product-compass-hub/releases/download/fastrack-training-3/fastrack-training-3-preview.mp4",
    vtt:
      "https://github.com/leotansingapore/aia-product-compass-hub/releases/download/fastrack-training-3/fastrack-training-3-preview.en.vtt",
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const rawKey = url.searchParams.get("key") ?? "week-1";
  const wantVtt = rawKey.endsWith(".vtt");
  const key = wantVtt ? rawKey.slice(0, -".vtt".length) : rawKey;
  const asset = ASSET_MAP[key];
  if (!asset) {
    return new Response(`Unknown video key: ${rawKey}`, {
      status: 404,
      headers: corsHeaders,
    });
  }
  if (wantVtt && !asset.vtt) {
    return new Response(`No subtitles available for ${key}`, {
      status: 404,
      headers: corsHeaders,
    });
  }
  const target = wantVtt ? asset.vtt! : asset.video;

  const upstreamHeaders: HeadersInit = {};
  const range = req.headers.get("range");
  if (range && !wantVtt) upstreamHeaders["range"] = range;

  const upstream = await fetch(target, {
    method: req.method,
    headers: upstreamHeaders,
    redirect: "follow",
  });

  const headers = new Headers(corsHeaders);
  if (wantVtt) {
    headers.set("Content-Type", "text/vtt; charset=utf-8");
    headers.set("Cache-Control", "public, max-age=3600");
  } else {
    headers.set("Content-Type", "video/mp4");
    headers.set("Content-Disposition", "inline");
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "public, max-age=3600");
  }

  const passthrough = [
    "content-length",
    "content-range",
    "etag",
    "last-modified",
  ];
  for (const h of passthrough) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
});
