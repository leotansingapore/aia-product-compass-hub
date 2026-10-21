import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { handle } from "./handler.ts";

Deno.serve((req) => {
  const db = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return handle(req, {
    secret: Deno.env.get('FINTERN_ACCOUNT_SECRET') ?? '',
    reader: () => ({
      profileId: async (email) => {
        const { data, error } = await db.from('profiles').select('user_id').eq('email', email).maybeSingle();
        return { id: (data as { user_id?: string } | null)?.user_id ?? null, error: error?.message ?? null };
      },
      completed: async (userId) => {
        const { data, error } = await db.from('first_14_days_progress').select('day_number, quiz_passed_at')
          .eq('user_id', userId).not('quiz_passed_at', 'is', null);
        return { rows: (data ?? []) as { day_number: number; quiz_passed_at: string }[], error: error?.message ?? null };
      },
      firstSeen: async (userId) => {
        const [ev, prof] = await Promise.all([
          db.from('app_events').select('created_at').eq('user_id', userId).eq('props->>app', 'academy')
            .order('created_at', { ascending: true }).limit(1),
          db.from('profiles').select('password_changed_at').eq('user_id', userId).maybeSingle(),
        ]);
        const error = ev.error?.message ?? prof.error?.message ?? null;
        const at = [(ev.data?.[0] as { created_at?: string } | undefined)?.created_at, (prof.data as { password_changed_at?: string | null } | null)?.password_changed_at]
          .filter((x): x is string => !!x).sort()[0] ?? null;
        return { at, error };
      },
      tier: async (userId) => {
        const { data, error } = await db.from('user_access_tiers').select('tier_level').eq('user_id', userId).maybeSingle();
        return { tier: (data as { tier_level?: string } | null)?.tier_level ?? null, error: error?.message ?? null };
      },
      openFirst60: async (userId) => {
        const { error } = await db.from('user_access_tiers').update({ tier_level: 'papers_taker' }).eq('user_id', userId).eq('tier_level', 'explorer');
        return { error: error?.message ?? null };
      },
    }),
  });
});
