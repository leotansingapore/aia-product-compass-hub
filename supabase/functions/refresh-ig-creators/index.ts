// Monthly bulk refresh of every Instagram handle in ig_creator_cache.
// Triggered by pg_cron (see 20260723110000_ig_snapshots_cron.sql) with a
// shared secret — not user-callable. Before each overwrite, the outgoing
// data is snapshotted to ig_creator_snapshots so the client can show
// month-over-month deltas ("followers +1.2K, moved to reels").
//
// Cost guard: capped at 50 handles per run (~25 US cents of Apify credit).
// Deploy with --no-verify-jwt; auth is the x-refresh-secret header.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const APIFY_ACTOR = "apify~instagram-profile-scraper";
const MAX_HANDLES_PER_RUN = 50;

Deno.serve(async (req) => {
  const secret = Deno.env.get("REFRESH_SECRET");
  if (!secret || req.headers.get("x-refresh-secret") !== secret) {
    return new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
  }
  const apifyKey = Deno.env.get("APIFY_API_KEY");
  if (!apifyKey) {
    return new Response(JSON.stringify({ error: "APIFY_API_KEY missing" }), {
      status: 500,
    });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: rows, error } = await admin
    .from("ig_creator_cache")
    .select("handle, fetched_at, data")
    .order("fetched_at", { ascending: true })
    .limit(MAX_HANDLES_PER_RUN);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let refreshed = 0;
  const failed: string[] = [];
  for (const row of rows ?? []) {
    try {
      const run = await fetch(
        `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${apifyKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usernames: [row.handle] }),
        },
      );
      if (!run.ok) {
        failed.push(row.handle);
        // Billing/entitlement failure will hit every handle — stop early.
        if (run.status === 403) break;
        continue;
      }
      const items = (await run.json()) as Array<Record<string, unknown>>;
      const profile = items?.[0];
      if (!profile || profile.error) {
        failed.push(row.handle);
        continue;
      }
      const latest = (profile.latestPosts ?? []) as Array<Record<string, unknown>>;
      const posts = latest
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
        handle: `@${row.handle}`,
        url: `https://www.instagram.com/${row.handle}/`,
        fullName: String(profile.fullName ?? ""),
        biography: String(profile.biography ?? ""),
        followers: Number(profile.followersCount ?? 0) || 0,
        postsCount: Number(profile.postsCount ?? 0) || 0,
        isPrivate: Boolean(profile.private ?? false),
        posts,
        fetchedAt: new Date().toISOString(),
      };
      // History first, then overwrite.
      await admin.from("ig_creator_snapshots").insert({
        handle: row.handle,
        taken_at: row.fetched_at,
        data: row.data,
      });
      await admin
        .from("ig_creator_cache")
        .upsert({ handle: row.handle, fetched_at: payload.fetchedAt, data: payload });
      refreshed++;
    } catch (e) {
      console.error("refresh failed for", row.handle, e);
      failed.push(row.handle);
    }
  }

  return new Response(
    JSON.stringify({ refreshed, failed, total: rows?.length ?? 0 }),
    { headers: { "Content-Type": "application/json" } },
  );
});
