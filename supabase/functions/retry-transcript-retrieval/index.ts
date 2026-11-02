import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { handle } from "./handler.ts";

serve((req) => handle(req, {
  supabase: createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!),
  tavusApiKey: Deno.env.get('TAVUS_API_KEY'),
}));
