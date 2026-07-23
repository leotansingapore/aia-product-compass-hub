// Live Instagram creator analysis for Content Studio's "Analyze a creator".
//
// Fetches a public IG profile's latest posts via Apify's instagram-profile-scraper
// and returns them in the TopPost shape the client's analyzer expects. Results
// are cached in ig_creator_cache for 7 days so repeat lookups cost nothing —
// each uncached run costs roughly half a US cent of Apify credit.
//
// Secrets: APIFY_API_KEY (supabase secrets). JWT verification is left ON so
// only signed-in studio/academy users can trigger paid scrapes.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const APIFY_ACTOR = "apify~instagram-profile-scraper";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LivePost {
  shortCode: string;
  url: string;
  type: string;
  productType?: string | null;
  likes: number;
  comments: number;
  views: number;
  timestamp?: string | null;
  caption: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { handle } = await req.json().catch(() => ({}));
    const bare = String(handle ?? "")
      .trim()
      .replace(/^@/, "")
      .toLowerCase();
    if (!/^[a-z0-9._]{2,30}$/.test(bare)) {
      return json({ error: "Invalid Instagram handle" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Serve from cache when fresh.
    const { data: cached } = await admin
      .from("ig_creator_cache")
      .select("fetched_at, data")
      .eq("handle", bare)
      .maybeSingle();
    if (
      cached &&
      Date.now() - new Date(cached.fetched_at).getTime() < CACHE_TTL_MS
    ) {
      return json({ ...cached.data, cached: true });
    }

    const apifyKey = Deno.env.get("APIFY_API_KEY");
    if (!apifyKey) return json({ error: "APIFY_API_KEY not configured" }, 500);

    // Cost guard: cap uncached (paid) lookups at 10 per user per hour.
    const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: userData } = await admin.auth.getUser(jwt);
    const uid = userData?.user?.id;
    if (!uid) return json({ error: "Not signed in" }, 401);
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("ig_lookup_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", uid)
      .gte("at", hourAgo);
    if ((count ?? 0) >= 10) {
      return json(
        {
          error:
            "You've hit the hourly limit for new Instagram lookups (10). Already-analyzed accounts stay available — try again in an hour.",
        },
        429,
      );
    }

    const run = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${apifyKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: [bare] }),
      },
    );
    if (!run.ok) {
      const detail = await run.text();
      console.error("apify run failed", run.status, detail.slice(0, 500));
      // Billing/entitlement problems on the Apify account read very
      // differently to users than a scrape failure — say so plainly.
      if (detail.includes("platform-feature-disabled") || detail.includes("invoice")) {
        return json(
          {
            error:
              "Live lookup is temporarily unavailable — the scraping account needs attention. The curated creators still work.",
          },
          503,
        );
      }
      return json({ error: `Instagram lookup failed (${run.status})` }, 502);
    }
    const items = (await run.json()) as Array<Record<string, unknown>>;
    const profile = items?.[0];
    if (!profile || profile.error) {
      return json(
        { error: "No public Instagram profile found for that handle" },
        404,
      );
    }

    const latest = (profile.latestPosts ?? []) as Array<Record<string, unknown>>;
    const posts: LivePost[] = latest
      .map((p) => ({
        shortCode: String(p.shortCode ?? p.id ?? ""),
        url: String(p.url ?? `https://www.instagram.com/p/${p.shortCode ?? ""}/`),
        type: String(p.type ?? ""),
        productType: (p.productType as string) ?? null,
        likes: Number(p.likesCount ?? 0) || 0,
        comments: Number(p.commentsCount ?? 0) || 0,
        views: Number(p.videoViewCount ?? p.videoPlayCount ?? 0) || 0,
        timestamp: (p.timestamp as string) ?? null,
        caption: String(p.caption ?? ""),
      }))
      .filter((p) => p.shortCode);

    const payload = {
      handle: `@${bare}`,
      url: `https://www.instagram.com/${bare}/`,
      fullName: String(profile.fullName ?? ""),
      biography: String(profile.biography ?? ""),
      followers: Number(profile.followersCount ?? 0) || 0,
      postsCount: Number(profile.postsCount ?? 0) || 0,
      isPrivate: Boolean(profile.private ?? false),
      posts,
      fetchedAt: new Date().toISOString(),
    };

    await admin
      .from("ig_creator_cache")
      .upsert({ handle: bare, fetched_at: payload.fetchedAt, data: payload });
    await admin.from("ig_lookup_log").insert({ user_id: uid, handle: bare });

    return json({ ...payload, cached: false });
  } catch (e) {
    console.error("analyze-ig-creator failed", e);
    return json({ error: "Lookup failed — try again" }, 500);
  }
});
