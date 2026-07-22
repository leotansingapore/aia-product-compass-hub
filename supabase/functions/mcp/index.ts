// Remote MCP server for AIA Product Compass Hub (learning). JSON-RPC 2.0 over
// Streamable HTTP. Auth: Authorization: Bearer cmp_live_...
//   npx mcp-remote https://<project>.supabase.co/functions/v1/mcp --header "Authorization: Bearer cmp_live_..."
import { authenticate, json, corsHeaders } from '../_shared/agent-auth.ts';
import type { AuthContext } from '../_shared/agent-auth.ts';
import { ApiError, getMe, getProgress, getAchievements, listSubmissions, listBookmarks, listNotes, createNote } from '../_shared/agent-handlers.ts';

const PROTOCOL_VERSION = '2024-11-05';
const ISSUER = 'https://academy.finternship.com';
const RESOURCE_URL = `${Deno.env.get('SUPABASE_URL')}/functions/v1/mcp`;
const RESOURCE_METADATA_URL = `${RESOURCE_URL}/.well-known/oauth-protected-resource`;

const TOOLS = [
  { name: 'get_profile', description: 'Your Compass Hub membership: email, status, tier, admin.', inputSchema: { type: 'object', properties: {} }, handler: (c: AuthContext) => getMe(c) },
  { name: 'get_progress', description: 'Your learning progress: total XP, learning-track status counts, recent quiz scores.', inputSchema: { type: 'object', properties: {} }, handler: (c: AuthContext) => getProgress(c) },
  { name: 'get_achievements', description: 'Achievements you have earned.', inputSchema: { type: 'object', properties: {} }, handler: (c: AuthContext) => getAchievements(c) },
  { name: 'list_submissions', description: 'Your learning-track submissions and their review status/feedback.', inputSchema: { type: 'object', properties: {} }, handler: (c: AuthContext) => listSubmissions(c) },
  { name: 'list_bookmarks', description: 'Products you have bookmarked.', inputSchema: { type: 'object', properties: {} }, handler: (c: AuthContext) => listBookmarks(c) },
  { name: 'list_notes', description: 'Your notes (preview + product).', inputSchema: { type: 'object', properties: { limit: { type: 'number' } } }, handler: (c: AuthContext, a: Record<string, unknown>) => listNotes(c, a) },
  { name: 'create_note', description: 'Create a note, optionally tied to a product_id. Requires the write scope.', inputSchema: { type: 'object', required: ['content','product_id'], properties: { content: { type: 'string' }, product_id: { type: 'string' } } }, scope: 'write', handler: (c: AuthContext, a: Record<string, unknown>) => createNote(c, a) },
] as const;

const rpcResult = (id: unknown, result: unknown) => json({ jsonrpc: '2.0', id, result });
const rpcError = (id: unknown, code: number, message: string) => json({ jsonrpc: '2.0', id, error: { code, message } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const reqUrl = new URL(req.url);
  // OAuth Protected Resource Metadata (RFC 9728) — tells an MCP client which
  // authorization server guards this endpoint.
  if (req.method === 'GET' && reqUrl.pathname.endsWith('/.well-known/oauth-protected-resource')) {
    return json({ resource: RESOURCE_URL, authorization_servers: [ISSUER], scopes_supported: ['read', 'write'], bearer_methods_supported: ['header'] });
  }
  if (req.method !== 'POST') return json({ error: 'method_not_allowed', message: 'JSON-RPC over POST.' }, 405);

  const ctx = await authenticate(req);
  if (ctx instanceof Response) {
    // Attach the OAuth challenge so clients can discover how to authorize.
    if (ctx.status === 401) {
      const headers = new Headers(ctx.headers);
      headers.set('WWW-Authenticate', `Bearer resource_metadata="${RESOURCE_METADATA_URL}"`);
      return new Response(ctx.body, { status: 401, headers });
    }
    return ctx;
  }

  let msg: any;
  try { msg = await req.json(); } catch { return rpcError(null, -32700, 'Parse error'); }
  const { id, method, params } = msg ?? {};
  if (id === undefined || id === null) return new Response(null, { status: 202, headers: corsHeaders });

  switch (method) {
    case 'initialize':
      return rpcResult(id, { protocolVersion: PROTOCOL_VERSION, capabilities: { tools: {} }, serverInfo: { name: 'compass-hub', version: '1.0.0' } });
    case 'ping': return rpcResult(id, {});
    case 'tools/list':
      return rpcResult(id, { tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })) });
    case 'tools/call': {
      const tool = TOOLS.find((t) => t.name === params?.name);
      if (!tool) return rpcError(id, -32602, `Unknown tool: ${params?.name}`);
      if ((tool as any).scope && !ctx.scopes.includes((tool as any).scope)) {
        return rpcResult(id, { isError: true, content: [{ type: 'text', text: `This key lacks the '${(tool as any).scope}' scope.` }] });
      }
      try {
        const data = await tool.handler(ctx, params?.arguments ?? {});
        return rpcResult(id, { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] });
      } catch (e) {
        return rpcResult(id, { isError: true, content: [{ type: 'text', text: e instanceof ApiError ? e.message : String((e as Error)?.message ?? e) }] });
      }
    }
    default: return rpcError(id, -32601, `Method not found: ${method}`);
  }
});
