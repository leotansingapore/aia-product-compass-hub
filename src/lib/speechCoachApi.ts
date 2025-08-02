// lib/speechCoachApi.ts
export type FinalizeInput = {
  conversationId: string;
  userToken: string; // Supabase JWT you already have in Lovable
  // Optional fields if Tavus gives them to the client:
  recordingUrl?: string;
  finalTranscript?: string;
  durationSeconds?: number;
  meta?: Record<string, any>;
};

export type SessionOut = {
  id: string;
  scenario_title?: string;
  scenario_category?: string;
  scenario_difficulty?: string;
  transcript?: string;
  wpm?: number;
  filler_count?: number;
  sentiment?: number;
  clarity_score?: number;
  score?: number;
  tavus_video_url?: string;
  started_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  meta?: Record<string, any>;
};

const API_BASE = import.meta.env.VITE_SPEECH_API_BASE ?? window.location.origin;

export async function finalizeTavusSession(input: FinalizeInput): Promise<SessionOut> {
  const res = await fetch(`${API_BASE}/functions/v1/speech-analysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.userToken}`,
    },
    body: JSON.stringify({
      action: 'finalize_session',
      conversationId: input.conversationId,
      recordingUrl: input.recordingUrl,
      finalTranscript: input.finalTranscript,
      durationSeconds: input.durationSeconds,
      meta: input.meta,
    }),
  });
  if (!res.ok) throw new Error(`Finalize failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function getSession(sessionId: string, userToken: string): Promise<SessionOut> {
  const res = await fetch(`${API_BASE}/functions/v1/speech-analysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", 
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      action: 'get_session',
      sessionId,
    }),
  });
  if (!res.ok) throw new Error(`Fetch session failed: ${res.status} ${await res.text()}`);
  return res.json();
}