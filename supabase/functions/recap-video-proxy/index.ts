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

const VIDEO_MAP: Record<string, string> = {
  "week-1":
    "https://github.com/leotansingapore/aia-product-compass-hub/releases/download/fastrack-training-1/fastrack-training-1-preview.mp4",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const key = url.searchParams.get("key") ?? "week-1";
  const target = VIDEO_MAP[key];
  if (!target) {
    return new Response(`Unknown video key: ${key}`, {
      status: 404,
      headers: corsHeaders,
    });
  }

  const upstreamHeaders: HeadersInit = {};
  const range = req.headers.get("range");
  if (range) upstreamHeaders["range"] = range;

  const upstream = await fetch(target, {
    method: req.method,
    headers: upstreamHeaders,
    redirect: "follow",
  });

  const headers = new Headers(corsHeaders);
  headers.set("Content-Type", "video/mp4");
  headers.set("Content-Disposition", "inline");
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=3600");

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
