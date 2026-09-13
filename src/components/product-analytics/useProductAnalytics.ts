// Every read the Product panel makes, in one file, so the shapes the SQL
// returns are declared once and the four views share a cache.
//
// Two things the RPCs make you handle:
//   - bigint arrives as a JSON number, numeric arrives as a STRING ("22.7"),
//     so nothing is trusted raw - `num()` sits on every field.
//   - a function that has not been migrated yet answers PGRST202, which is not
//     an outage. `isNotMigrated` turns that one code into the "apply the
//     migration" hint instead of a red error nobody can act on.

import { useQuery, keepPreviousData, type UseQueryResult } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export interface UsageOverview {
  active_users: number
  prior_active_users: number
  new_users: number
  prior_new_users: number
  events: number
  prior_events: number
  dau: number
  dau_avg: number
  wau: number
  mau: number
  tracked_users: number
  total_profiles: number
}

export interface FeatureAdoptionRow {
  feature: string
  users: number
  opens: number
  user_days: number
  repeat_users: number
  new_users: number
  prior_users: number
  prior_opens: number
  first_seen: string | null
  last_seen: string | null
}

export interface DailyActiveRow {
  day: string
  users: number
  events: number
  feature_opens: number
}

export interface EventVolumeRow {
  event: string
  n: number
  users: number
  prior_n: number
  prior_users: number
  last_seen: string | null
}

export interface CohortRow {
  cohort_week: string
  cohort_size: number
  week_offset: number
  users: number
}

export interface EngagementRow {
  bucket: string
  sort_order: number
  users: number
}

const num = (v: unknown): number => (typeof v === 'number' ? v : Number(v ?? 0) || 0)

/** Postgres said "no such function" - the migration has not been applied here. */
export function isNotMigrated(error: unknown): boolean {
  const e = error as { code?: string; message?: string } | null
  if (!e) return false
  return e.code === 'PGRST202' || e.code === '42883' || /could not find the function/i.test(e.message ?? '')
}

// The generated Supabase types do not yet carry these seven functions. The cast is the same one the other new-RPC
// hooks in this codebase use, and never `const rpc = supabase.rpc` - a
// detached receiver loses `this` and the call silently never fires.
const rpc = (fn: string, args: Record<string, unknown>) =>
  (supabase as unknown as { rpc: (f: string, a: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }> }).rpc(fn, args)

async function call<T>(fn: string, args: Record<string, unknown>): Promise<T[]> {
  const { data, error } = await rpc(fn, args)
  if (error) throw error
  return (data ?? []) as T[]
}

// Two apps share this Supabase project; every function takes the app first.
const APP = 'academy'
const shared = { staleTime: 60_000, placeholderData: keepPreviousData } as const

export function useUsageOverview(days: number): UseQueryResult<UsageOverview | null> {
  return useQuery({
    queryKey: ['app_usage_overview', days],
    ...shared,
    queryFn: async () => {
      const rows = await call<Record<string, unknown>>('app_usage_overview', { p_app: APP, p_days: days })
      const r = rows[0]
      if (!r) return null
      return {
        active_users: num(r.active_users),
        prior_active_users: num(r.prior_active_users),
        new_users: num(r.new_users),
        prior_new_users: num(r.prior_new_users),
        events: num(r.events),
        prior_events: num(r.prior_events),
        dau: num(r.dau),
        dau_avg: num(r.dau_avg),
        wau: num(r.wau),
        mau: num(r.mau),
        tracked_users: num(r.tracked_users),
        total_profiles: num(r.total_profiles),
      } satisfies UsageOverview
    },
  })
}

export function useFeatureAdoption(days: number): UseQueryResult<FeatureAdoptionRow[]> {
  return useQuery({
    queryKey: ['app_feature_adoption', days],
    ...shared,
    queryFn: async () => {
      const rows = await call<Record<string, unknown>>('app_feature_adoption', { p_app: APP, p_days: days })
      return rows.map((r) => ({
        feature: String(r.feature ?? 'unknown'),
        users: num(r.users),
        opens: num(r.opens),
        user_days: num(r.user_days),
        repeat_users: num(r.repeat_users),
        new_users: num(r.new_users),
        prior_users: num(r.prior_users),
        prior_opens: num(r.prior_opens),
        first_seen: (r.first_seen as string) ?? null,
        last_seen: (r.last_seen as string) ?? null,
      }))
    },
  })
}

export function useDailyActive(days: number): UseQueryResult<DailyActiveRow[]> {
  return useQuery({
    queryKey: ['app_daily_active', days],
    ...shared,
    queryFn: async () => {
      const rows = await call<Record<string, unknown>>('app_daily_active', { p_app: APP, p_days: days })
      return rows.map((r) => ({
        day: String(r.day),
        users: num(r.users),
        events: num(r.events),
        feature_opens: num(r.feature_opens),
      }))
    },
  })
}

export function useEventVolume(days: number): UseQueryResult<EventVolumeRow[]> {
  return useQuery({
    queryKey: ['app_event_volume', days],
    ...shared,
    queryFn: async () => {
      const rows = await call<Record<string, unknown>>('app_event_volume', { p_app: APP, p_days: days })
      return rows.map((r) => ({
        event: String(r.event),
        n: num(r.n),
        users: num(r.users),
        prior_n: num(r.prior_n),
        prior_users: num(r.prior_users),
        last_seen: (r.last_seen as string) ?? null,
      }))
    },
  })
}

export function useRetentionCohorts(weeks: number): UseQueryResult<CohortRow[]> {
  return useQuery({
    queryKey: ['app_retention_cohorts', weeks],
    ...shared,
    queryFn: async () => {
      const rows = await call<Record<string, unknown>>('app_retention_cohorts', { p_app: APP, p_weeks: weeks })
      return rows.map((r) => ({
        cohort_week: String(r.cohort_week),
        cohort_size: num(r.cohort_size),
        week_offset: num(r.week_offset),
        users: num(r.users),
      }))
    },
  })
}

export function useUserEngagement(days: number): UseQueryResult<EngagementRow[]> {
  return useQuery({
    queryKey: ['app_user_engagement', days],
    ...shared,
    queryFn: async () => {
      const rows = await call<Record<string, unknown>>('app_user_engagement', { p_app: APP, p_days: days })
      return rows.map((r) => ({
        bucket: String(r.bucket),
        sort_order: num(r.sort_order),
        users: num(r.users),
      }))
    },
  })
}

export function useFeatureDetail(feature: string | null, days: number): UseQueryResult<{ day: string; users: number; opens: number }[]> {
  return useQuery({
    queryKey: ['app_feature_detail', feature, days],
    enabled: !!feature,
    ...shared,
    queryFn: async () => {
      const rows = await call<Record<string, unknown>>('app_feature_detail', { p_app: APP, p_feature: feature, p_days: days })
      return rows.map((r) => ({ day: String(r.day), users: num(r.users), opens: num(r.opens) }))
    },
  })
}
