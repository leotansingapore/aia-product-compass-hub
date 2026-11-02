import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { identifyCaller } from '../_shared/caller-auth.ts';
import { Resend } from "https://esm.sh/resend@4.0.0";
import { renderAsync } from "https://esm.sh/@react-email/render@0.0.17";
import React from "https://esm.sh/react@18.3.1";
import { RoleplayFeedbackReadyEmail } from "./_templates/roleplay-feedback-ready.tsx";
import { handle } from "./handler.ts";

declare const EdgeRuntime: { waitUntil(work: Promise<unknown>): void };

serve((req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  return handle(req, {
    supabase,
    identifyCaller,
    internalSecret: Deno.env.get('TAVUS_WEBHOOK_SECRET'),
    waitUntil: (work) => EdgeRuntime.waitUntil(work),
    emailOwner: (session, feedback) => emailOwner(supabase, session, feedback),
  });
});

// deno-lint-ignore no-explicit-any
async function emailOwner(supabase: any, session: any, feedback: Record<string, any>) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey || !session.user_id) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, display_name, first_name")
    .eq("user_id", session.user_id)
    .maybeSingle();
  if (!profile?.email) return;

  const resend = new Resend(resendApiKey);
  const userName = profile.display_name || profile.first_name || "Advisor";
  const feedbackUrl = `https://academy.finternship.com/roleplay/feedback/${session.id}`;

  const html = await renderAsync(
    React.createElement(RoleplayFeedbackReadyEmail, {
      userName,
      scenarioTitle: session.scenario_title,
      scenarioDifficulty: session.scenario_difficulty,
      overallScore: feedback.overall_score || 0,
      communicationScore: feedback.communication_score || 0,
      objectionHandlingScore: feedback.objection_handling_score || 0,
      productKnowledgeScore: feedback.product_knowledge_score || 0,
      activeListeningScore: feedback.active_listening_score || 0,
      feedbackUrl,
    })
  );

  await resend.emails.send({
    from: "FINternship <noreply@mail.themoneybees.co>",
    to: [profile.email],
    subject: `🎭 Roleplay Feedback Ready — ${session.scenario_title}`,
    html,
  });
  console.log("Roleplay feedback email sent to:", profile.email);
}
