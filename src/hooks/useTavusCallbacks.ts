// hooks/useTavusCallbacks.ts
import { useEffect, useRef, useState } from "react";
import { finalizeTavusSession, SessionOut } from "@/lib/speechCoachApi";

// Shape of app-message from Tavus/Daily (keep loose to avoid breaking on schema changes)
type AppMsg = {
  type?: string;
  event?: string;
  status?: string;
  conversation_id?: string;
  recording_url?: string;
  final_transcript?: string;
  duration_seconds?: number;
  [k: string]: any;
};

type UseTavusCallbacksOpts = {
  callFrame: any;              // your Daily callFrame
  userToken: string;           // Supabase JWT
  onFinalized?: (session: SessionOut) => void;
};

export function useTavusCallbacks({ callFrame, userToken, onFinalized }: UseTavusCallbacksOpts) {
  const [isFinalizing, setIsFinalizing] = useState(false);
  const finalizedRef = useRef(false);

  useEffect(() => {
    if (!callFrame) return;

    const handler = async (ev: any) => {
      const payload: AppMsg = ev?.data || ev; // Daily sends { data: ... }
      // Heuristics: treat any of these as "session complete"
      const isDone =
        payload?.type === "recording_ready" ||
        payload?.event === "recording_ready" ||
        payload?.status === "conversation_ended" ||
        !!payload?.final_transcript;

      if (!isDone || finalizedRef.current) return;

      finalizedRef.current = true;
      setIsFinalizing(true);

      // Extract best-effort fields from payload
      const conversationId =
        payload?.conversation_id ||
        payload?.conversationId ||
        payload?.room_id ||
        "unknown";

      try {
        const session = await finalizeTavusSession({
          conversationId,
          userToken,
          recordingUrl: payload?.recording_url,
          finalTranscript: payload?.final_transcript,
          durationSeconds: payload?.duration_seconds,
          meta: payload,
        });
        onFinalized?.(session);
      } catch (e) {
        console.error("[SpeechCoach] finalize error:", e);
        finalizedRef.current = false; // let user retry
      } finally {
        setIsFinalizing(false);
      }
    };

    // Daily/Tavus emit "app-message" with payloads; also listen defensively to all logs
    callFrame.on("app-message", handler);
    callFrame.on("recording-stopped", handler); // belt & suspenders

    return () => {
      callFrame.off("app-message", handler);
      callFrame.off("recording-stopped", handler);
    };
  }, [callFrame, userToken, onFinalized]);

  return { isFinalizing };
}
