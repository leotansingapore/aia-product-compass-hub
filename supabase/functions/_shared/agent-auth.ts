// Bearer-key auth for the agent API (api + mcp functions). Caller presents
// Authorization: Bearer cmp_live_...; we verify + rate-limit via api_authenticate.
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export function serviceClient(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

export type AuthContext = { userId: string; keyId: string; scopes: string[]; supabase: SupabaseClient };

export async function authenticate(req: Request, opts: { limit?: number } = {}): Promise<AuthContext | Response> {
  const header = req.headers.get('authorization') ?? '';
  const raw = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  const supabase = serviceClient();

  // OAuth connector access token (issued by the oauth function).
  if (raw.startsWith('cmp_oauth_')) return await authenticateOAuth(supabase, raw, opts.limit ?? 120);

  // Personal API key.
  if (!raw.startsWith('cmp_live_')) {
    return json({ error: 'missing_or_invalid_token', message: 'Provide Authorization: Bearer cmp_live_... or an OAuth token.' }, 401);
  }
  const { data, error } = await supabase.rpc('api_authenticate', { p_raw: raw, p_limit: opts.limit ?? 120 });
  if (error) return json({ error: 'auth_error', message: error.message }, 500);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return json({ error: 'invalid_api_key', message: 'Key not found, revoked, or expired.' }, 401);
  if (row.rate_limited) return json({ error: 'rate_limited', message: 'Too many requests (120/min).' }, 429);
  return { userId: row.user_id, keyId: row.key_id, scopes: row.scopes ?? [], supabase };
}

async function authenticateOAuth(supabase: SupabaseClient, raw: string, limit: number): Promise<AuthContext | Response> {
  const { data, error } = await supabase.rpc('oauth_authenticate', { p_raw: raw, p_limit: limit });
  if (error) return json({ error: 'auth_error', message: error.message }, 500);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return json({ error: 'invalid_token', message: 'Access token not found, revoked, or expired.' }, 401);
  if (row.rate_limited) return json({ error: 'rate_limited', message: 'Too many requests (120/min).' }, 429);
  return { userId: row.user_id, keyId: row.token_id, scopes: (row.scope ?? '').split(/\s+/).filter(Boolean), supabase };
}

export function requireScope(ctx: AuthContext, scope: string): Response | null {
  if (!ctx.scopes.includes(scope)) return json({ error: 'insufficient_scope', message: `This key lacks the '${scope}' scope.` }, 403);
  return null;
}
