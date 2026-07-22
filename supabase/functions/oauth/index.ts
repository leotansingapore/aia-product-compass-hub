// OAuth 2.1 authorization server for the Compass Hub MCP/API connector.
// Dynamic Client Registration + Authorization Code + PKCE. The browser-facing
// consent screen is the SPA route /oauth/authorize (so it can read the user's
// logged-in session); this function issues codes and tokens.
//
//   GET  /oauth/.well-known/oauth-authorization-server   (public metadata)
//   POST /oauth/register                                 (RFC 7591 DCR)
//   POST /oauth/grant                                    (consent page -> mints a code; needs user JWT)
//   POST /oauth/token                                    (code exchange + refresh; public + PKCE)
//
// verify_jwt is disabled (config.toml) -- auth is handled per-route here.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sha256hex, pkceChallenge, randToken } from '../_shared/crypto.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};
const ISSUER = 'https://academy.finternship.com';
const ACCESS_TTL = 3600; // seconds

function svc() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });
}
function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra },
  });
}
function oauthErr(error: string, status = 400, description?: string) {
  return json(description ? { error, error_description: description } : { error }, status);
}
function route(url: URL): string {
  const i = url.pathname.indexOf('/oauth');
  const rest = i === -1 ? url.pathname : url.pathname.slice(i + 6);
  return rest || '/';
}
async function readBody(req: Request): Promise<Record<string, string>> {
  const ct = req.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    return await req.json().catch(() => ({}));
  }
  const text = await req.text();
  const params = new URLSearchParams(text);
  return Object.fromEntries(params.entries());
}

const FUNCTION_BASE = `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth`;

const METADATA = {
  issuer: ISSUER,
  authorization_endpoint: `${ISSUER}/oauth/authorize`,
  token_endpoint: `${FUNCTION_BASE}/token`,
  registration_endpoint: `${FUNCTION_BASE}/register`,
  scopes_supported: ['read', 'write'],
  response_types_supported: ['code'],
  grant_types_supported: ['authorization_code', 'refresh_token'],
  code_challenge_methods_supported: ['S256'],
  token_endpoint_auth_methods_supported: ['none'],
};

// Per-IP fixed-window limit for the unauthenticated OAuth endpoints.
async function rateLimited(db: ReturnType<typeof svc>, req: Request, endpoint: string, limit: number): Promise<boolean> {
  const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
  const { data } = await db.rpc('oauth_rate_check', { p_key: `${endpoint}:${ip}`, p_limit: limit, p_window_secs: 60 });
  return data === false;
}

// Only https and loopback http are accepted. Deliberately NOT arbitrary custom
// schemes -- javascript:/data: redirect URIs are an XSS vector once the browser
// consent page navigates to them.
const isValidRedirect = (uri: string) => {
  try {
    const u = new URL(uri);
    if (u.protocol === 'https:') return true;
    if (u.protocol === 'http:' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) return true;
    return false;
  } catch {
    return false;
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const url = new URL(req.url);
  const path = route(url);
  const db = svc();

  try {
    // ---- Discovery metadata (also served statically at the issuer root) ----
    if (req.method === 'GET' && path === '/.well-known/oauth-authorization-server') {
      return json(METADATA);
    }

    // ---- Dynamic Client Registration (RFC 7591) ----
    if (req.method === 'POST' && path === '/register') {
      if (await rateLimited(db, req, 'register', 10)) return oauthErr('rate_limited', 429, 'Too many registrations; try again shortly.');
      const body = await readBody(req);
      let redirectUris: string[] = Array.isArray((body as any).redirect_uris)
        ? (body as any).redirect_uris
        : typeof body.redirect_uris === 'string'
          ? [body.redirect_uris]
          : [];
      redirectUris = redirectUris.filter((u) => typeof u === 'string' && isValidRedirect(u));
      if (redirectUris.length === 0) {
        return oauthErr('invalid_redirect_uri', 400, 'At least one https/loopback redirect_uri is required.');
      }
      const { data, error } = await db
        .from('oauth_clients')
        .insert({ client_name: body.client_name ?? 'MCP Client', redirect_uris: redirectUris })
        .select('client_id, client_name, redirect_uris, scope, created_at')
        .single();
      if (error) return oauthErr('server_error', 500, error.message);
      return json({
        client_id: data.client_id,
        client_id_issued_at: Math.floor(new Date(data.created_at).getTime() / 1000),
        client_name: data.client_name,
        redirect_uris: data.redirect_uris,
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        token_endpoint_auth_method: 'none',
        scope: data.scope,
      }, 201);
    }

    // ---- Grant: consent page mints an auth code (needs the user's JWT) ----
    if (req.method === 'POST' && path === '/grant') {
      if (await rateLimited(db, req, 'grant', 30)) return oauthErr('rate_limited', 429, 'Slow down.');
      const authz = req.headers.get('authorization') ?? '';
      const jwt = authz.toLowerCase().startsWith('bearer ') ? authz.slice(7) : '';
      if (!jwt) return oauthErr('access_denied', 401, 'Sign in first.');
      const { data: userData, error: userErr } = await db.auth.getUser(jwt);
      if (userErr || !userData?.user) return oauthErr('access_denied', 401, 'Invalid session.');
      const userId = userData.user.id;

      const body = await readBody(req);
      const { client_id, redirect_uri, code_challenge, state } = body;
      const scope = (body.scope ?? 'read write').split(/\s+/).filter((s) => ['read', 'write'].includes(s)).join(' ') || 'read';
      if (!client_id || !redirect_uri || !code_challenge) {
        return oauthErr('invalid_request', 400, 'client_id, redirect_uri and code_challenge are required.');
      }
      const { data: client } = await db
        .from('oauth_clients').select('redirect_uris').eq('client_id', client_id).maybeSingle();
      if (!client) return oauthErr('invalid_client', 400, 'Unknown client.');
      if (!client.redirect_uris.includes(redirect_uri)) {
        return oauthErr('invalid_request', 400, 'redirect_uri not registered for this client.');
      }

      const rawCode = randToken('cmp_code_');
      const codeHash = await sha256hex(rawCode);
      const { error: insErr } = await db.from('oauth_auth_codes').insert({
        code_hash: codeHash, client_id, user_id: userId, redirect_uri, scope,
        code_challenge, expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });
      if (insErr) return oauthErr('server_error', 500, insErr.message);

      const redirect = new URL(redirect_uri);
      redirect.searchParams.set('code', rawCode);
      if (state) redirect.searchParams.set('state', state);
      return json({ redirect: redirect.toString() });
    }

    // ---- Token: authorization_code + refresh_token grants ----
    if (req.method === 'POST' && path === '/token') {
      if (await rateLimited(db, req, 'token', 60)) return oauthErr('rate_limited', 429, 'Slow down.');
      const body = await readBody(req);
      const grant = body.grant_type;

      if (grant === 'authorization_code') {
        const { code, redirect_uri, client_id, code_verifier } = body;
        if (!code || !redirect_uri || !client_id || !code_verifier) {
          return oauthErr('invalid_request', 400, 'code, redirect_uri, client_id, code_verifier required.');
        }
        const codeHash = await sha256hex(code);
        // Atomic single-use: DELETE ... RETURNING so concurrent exchanges of the
        // same code can't both succeed (only one gets the row back).
        const { data: row } = await db.from('oauth_auth_codes')
          .delete().eq('code_hash', codeHash).select('*').maybeSingle();
        if (!row) return oauthErr('invalid_grant', 400, 'Code not found or already used.');
        if (new Date(row.expires_at) < new Date()) return oauthErr('invalid_grant', 400, 'Code expired.');
        if (row.client_id !== client_id) return oauthErr('invalid_grant', 400, 'Client mismatch.');
        if (row.redirect_uri !== redirect_uri) return oauthErr('invalid_grant', 400, 'redirect_uri mismatch.');
        const challenge = await pkceChallenge(code_verifier);
        if (challenge !== row.code_challenge) return oauthErr('invalid_grant', 400, 'PKCE verification failed.');

        const { data: client } = await db.from('oauth_clients').select('client_name').eq('client_id', client_id).maybeSingle();
        return await issueTokens(db, row.user_id, client_id, client?.client_name ?? null, row.scope);
      }

      if (grant === 'refresh_token') {
        const { refresh_token } = body;
        if (!refresh_token) return oauthErr('invalid_request', 400, 'refresh_token required.');
        const refreshHash = await sha256hex(refresh_token);
        const accessRaw = randToken('cmp_oauth_');
        const newRefreshRaw = randToken('cmp_refresh_');
        // Atomic rotation: only the row still holding this refresh hash is
        // updated, so a reused (stolen or double-submitted) refresh token can't
        // mint a second set -- the second attempt matches no row.
        const { data: rotated } = await db.from('oauth_tokens')
          .update({
            access_token_hash: await sha256hex(accessRaw),
            refresh_token_hash: await sha256hex(newRefreshRaw),
            access_expires_at: new Date(Date.now() + ACCESS_TTL * 1000).toISOString(),
            window_started_at: new Date().toISOString(), window_count: 0,
            last_used_at: new Date().toISOString(),
          })
          .eq('refresh_token_hash', refreshHash).is('revoked_at', null)
          .select('scope').maybeSingle();
        if (!rotated) return oauthErr('invalid_grant', 400, 'Refresh token invalid or revoked.');
        return json({ access_token: accessRaw, token_type: 'Bearer', expires_in: ACCESS_TTL, refresh_token: newRefreshRaw, scope: rotated.scope });
      }

      return oauthErr('unsupported_grant_type', 400);
    }

    return json({ error: 'not_found' }, 404);
  } catch (e) {
    return oauthErr('server_error', 500, String((e as Error)?.message ?? e));
  }
});

async function issueTokens(
  db: ReturnType<typeof svc>, userId: string, clientId: string | null,
  clientName: string | null, scope: string,
): Promise<Response> {
  const accessRaw = randToken('cmp_oauth_');
  const refreshRaw = randToken('cmp_refresh_');
  await db.from('oauth_tokens').insert({
    user_id: userId, client_id: clientId, client_name: clientName,
    access_token_hash: await sha256hex(accessRaw),
    refresh_token_hash: await sha256hex(refreshRaw),
    scope, access_expires_at: new Date(Date.now() + ACCESS_TTL * 1000).toISOString(),
  });
  return json({
    access_token: accessRaw,
    token_type: 'Bearer',
    expires_in: ACCESS_TTL,
    refresh_token: refreshRaw,
    scope,
  });
}
