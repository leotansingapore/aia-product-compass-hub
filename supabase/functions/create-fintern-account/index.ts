import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { handle, type Admin } from "./handler.ts";

Deno.serve((req) => handle(req, {
  secret: Deno.env.get('FINTERN_ACCOUNT_SECRET') ?? '',
  admin: () => createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
    auth: { autoRefreshToken: false, persistSession: false },
  }) as unknown as Admin,
}));
