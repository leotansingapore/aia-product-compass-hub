import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handle } from "./handler.ts";
import { identifyCaller } from "../_shared/caller-auth.ts";

serve((req) => handle(req, {
  supabase: createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!),
  caller: identifyCaller,
}));
