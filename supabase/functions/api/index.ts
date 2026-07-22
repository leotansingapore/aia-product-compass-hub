// Public REST API for AI agents (Compass Hub). Auth: Bearer cmp_live_...
//   GET  /api/v1/me | /progress | /achievements | /submissions | /bookmarks | /notes
//   POST /api/v1/notes   { content, product_id? }   (scope: write)
import { authenticate, requireScope, json, corsHeaders, type AuthContext } from '../_shared/agent-auth.ts';
import { ApiError, getMe, getProgress, getAchievements, listSubmissions, listBookmarks, listNotes, createNote } from '../_shared/agent-handlers.ts';

function route(url: URL): string {
  const i = url.pathname.indexOf('/v1/');
  if (i === -1) return url.pathname.endsWith('/v1') ? '/' : url.pathname;
  return url.pathname.slice(i + 3) || '/';
}

async function handle(ctx: AuthContext, req: Request, path: string, url: URL): Promise<Response> {
  const q = Object.fromEntries(url.searchParams.entries());
  if (req.method === 'GET') {
    switch (path) {
      case '/':
      case '/me': return json(await getMe(ctx));
      case '/progress': return json(await getProgress(ctx));
      case '/achievements': return json(await getAchievements(ctx));
      case '/submissions': return json(await listSubmissions(ctx));
      case '/bookmarks': return json(await listBookmarks(ctx));
      case '/notes': return json(await listNotes(ctx, q));
    }
  }
  if (req.method === 'POST' && path === '/notes') {
    const denied = requireScope(ctx, 'write'); if (denied) return denied;
    return json(await createNote(ctx, await req.json().catch(() => ({}))), 201);
  }
  return json({ error: 'not_found', message: `No route for ${req.method} ${path}` }, 404);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const ctx = await authenticate(req);
  if (ctx instanceof Response) return ctx;
  const url = new URL(req.url);
  try {
    return await handle(ctx, req, route(url), url);
  } catch (e) {
    return e instanceof ApiError
      ? json({ error: 'request_failed', message: e.message }, e.status)
      : json({ error: 'internal_error', message: String((e as Error)?.message ?? e) }, 500);
  }
});
