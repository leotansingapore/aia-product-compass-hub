// Learner-facing handlers for the Compass Hub agent. Owner-scoped by user_id.
import type { AuthContext } from './agent-auth.ts';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}
const clampLimit = (n: unknown, def: number, max: number) => {
  const v = Number(n); return Number.isFinite(v) && v > 0 ? Math.min(Math.floor(v), max) : def;
};
const stripHtml = (s: string) => (s ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export async function getMe(ctx: AuthContext) {
  const [{ data: m }, { data: tier }] = await Promise.all([
    ctx.supabase.from('hub_memberships').select('email, status, is_admin, industry, current_period_end').eq('user_id', ctx.userId).maybeSingle(),
    ctx.supabase.from('user_tiers').select('tier_level').eq('user_id', ctx.userId).order('granted_at', { ascending: false }).limit(1).maybeSingle(),
  ]);
  return { user_id: ctx.userId, email: m?.email ?? null, status: m?.status ?? null, is_admin: m?.is_admin ?? false, industry: m?.industry ?? null, tier: tier?.tier_level ?? null, renews: m?.current_period_end ?? null };
}

export async function getProgress(ctx: AuthContext) {
  const [{ data: track }, { data: quizzes }, { data: learn }] = await Promise.all([
    ctx.supabase.from('learning_track_progress').select('status').eq('user_id', ctx.userId),
    ctx.supabase.from('quiz_attempts').select('score, total_questions, xp_earned, completed_at').eq('user_id', ctx.userId).order('completed_at', { ascending: false }).limit(20),
    ctx.supabase.from('learning_progress').select('xp_earned').eq('user_id', ctx.userId),
  ]);
  const byStatus: Record<string, number> = {};
  for (const t of track ?? []) byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
  const totalXp = (learn ?? []).reduce((s, r) => s + Number(r.xp_earned ?? 0), 0) + (quizzes ?? []).reduce((s, r) => s + Number(r.xp_earned ?? 0), 0);
  return {
    total_xp: totalXp,
    learning_track: { total: (track ?? []).length, by_status: byStatus },
    recent_quizzes: (quizzes ?? []).map((q) => ({ score: q.score, out_of: q.total_questions, xp: q.xp_earned, when: q.completed_at })),
  };
}

export async function getAchievements(ctx: AuthContext) {
  const { data, error } = await ctx.supabase.from('user_achievements')
    .select('achievement_id, earned_at').eq('user_id', ctx.userId).order('earned_at', { ascending: false });
  if (error) throw new ApiError(error.message, 500);
  return { count: (data ?? []).length, achievements: data ?? [] };
}

export async function listSubmissions(ctx: AuthContext) {
  const { data, error } = await ctx.supabase.from('learning_track_submissions')
    .select('item_id, remarks, review_status, submitted_at, review_feedback').eq('user_id', ctx.userId)
    .order('submitted_at', { ascending: false }).limit(50);
  if (error) throw new ApiError(error.message, 500);
  return { count: (data ?? []).length, submissions: data ?? [] };
}

export async function listBookmarks(ctx: AuthContext) {
  const { data, error } = await ctx.supabase.from('user_bookmarks')
    .select('product_id, created_at').eq('user_id', ctx.userId).order('created_at', { ascending: false });
  if (error) throw new ApiError(error.message, 500);
  return { count: (data ?? []).length, bookmarks: data ?? [] };
}

export async function listNotes(ctx: AuthContext, params: Record<string, unknown>) {
  const limit = clampLimit(params.limit, 50, 200);
  const { data, error } = await ctx.supabase.from('user_notes')
    .select('id, product_id, content, updated_at').eq('user_id', ctx.userId).order('updated_at', { ascending: false }).limit(limit);
  if (error) throw new ApiError(error.message, 500);
  return { count: (data ?? []).length, notes: (data ?? []).map((n) => ({ id: n.id, product_id: n.product_id, preview: stripHtml(n.content).slice(0, 160), updated_at: n.updated_at })) };
}

export async function createNote(ctx: AuthContext, params: Record<string, unknown>) {
  const content = String(params.content ?? '').trim();
  if (!content) throw new ApiError('content is required', 422);
  const row: Record<string, unknown> = { user_id: ctx.userId, content };
  if (params.product_id != null) row.product_id = String(params.product_id);
  const { data, error } = await ctx.supabase.from('user_notes').insert(row).select('id, product_id, updated_at').single();
  if (error) throw new ApiError(error.message, 500);
  return { created: data };
}
