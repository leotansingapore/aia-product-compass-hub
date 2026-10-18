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
    }),
  });
});
