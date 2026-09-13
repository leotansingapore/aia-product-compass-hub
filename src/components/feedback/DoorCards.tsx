// DoorCards: the assistant's two doors to the maker, rendered under an answer. The model
// drafted; the learner confirms. The card shows the exact title and body (or message)
// that will leave the app, under whose name, and where it goes; nothing is sent until the
// button is pressed. A sent card turns into its receipt in place and stays one across
// re-renders and re-opens (sessionStorage by message key), so the same post cannot go twice.

import { useState } from "react";
import { Check, LifeBuoy, Loader2, MessageSquarePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { postFeedback, sendSupport, type Door, type DoorIdentity } from "@/lib/feedbackDoors";
import { FEEDBACK_PATH } from "./config";

const receiptKey = (scope: string, i: number) => `fa:door:${scope}:${i}`;
const readReceipt = (key: string): string | null => {
  try { return sessionStorage.getItem(key); } catch { return null; }
};
const writeReceipt = (key: string, value: string) => {
  try { sessionStorage.setItem(key, value); } catch { /* private mode: state still holds it */ }
};

const CATEGORY_LABEL: Record<string, string> = {
  feature: "Feature request",
  improvement: "Improvement",
  bug: "Bug report",
  question: "Question",
};

export function DoorCards({ doors, scope, identity, onNavigate }: { doors: Door[]; scope: string; identity: DoorIdentity; onNavigate?: (href: string) => void }) {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    doors.forEach((_, i) => {
      const v = readReceipt(receiptKey(scope, i));
      if (v) out[receiptKey(scope, i)] = v;
    });
    return out;
  });
  const [busy, setBusy] = useState<string | null>(null);
  const open = (href: string) => (onNavigate ? onNavigate(href) : navigate(href));

  const send = async (door: Door, key: string) => {
    if (receipts[key] || busy) return;
    setBusy(key);
    try {
      if (door.kind === "feedback") {
        const number = await postFeedback(identity, door);
        writeReceipt(key, String(number));
        setReceipts((m) => ({ ...m, [key]: String(number) }));
        toast.success(`Posted to the feedback board as #${number}`);
      } else {
        const { emailed } = await sendSupport(identity, door.message);
        writeReceipt(key, "sent");
        setReceipts((m) => ({ ...m, [key]: "sent" }));
        toast.success(emailed && identity.email ? `Sent to the team. The reply comes to ${identity.email}.` : "Sent to the team.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send that. Try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-2 flex flex-col gap-2 not-prose" data-testid="assistant-doors">
      {doors.map((door, i) => {
        const key = receiptKey(scope, i);
        const receipt = receipts[key];
        const Icon = door.kind === "feedback" ? MessageSquarePlus : LifeBuoy;
        return (
          <section key={key} data-testid={`assistant-door-${door.kind}`} className="overflow-hidden rounded-lg border bg-background text-foreground">
            <header className="flex items-center gap-2 border-b px-3 py-1.5 text-xs font-medium">
              <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              {door.kind === "feedback" ? "Post to the feedback board" : "Send to the team"}
              {door.kind === "feedback" && (
                <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-normal text-muted-foreground">{CATEGORY_LABEL[door.category]}</span>
              )}
            </header>
            <div className="px-3 py-2 text-xs">
              {door.kind === "feedback" ? (
                <>
                  <p className="font-medium">{door.title}</p>
                  {door.body && <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{door.body}</p>}
                  <p className="mt-1.5 text-[11px] text-muted-foreground">Appears publicly on the feedback board as {identity.name ?? "you"}, where others can vote on it.</p>
                </>
              ) : (
                <>
                  <p className="whitespace-pre-wrap">{door.message}</p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">Goes privately to the team{identity.email ? `; the reply comes to ${identity.email}` : ""}.</p>
                </>
              )}
            </div>
            <footer className="flex items-center justify-end gap-2 border-t px-3 py-1.5">
              {receipt ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" data-testid="assistant-door-receipt">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  {door.kind === "feedback" ? (
                    <>
                      Posted as #{receipt}.
                      <button type="button" className="font-medium text-foreground underline underline-offset-2" onClick={() => open(`${FEEDBACK_PATH}?post=${receipt}`)}>
                        See it on the board
                      </button>
                    </>
                  ) : "Sent to the team"}
                </span>
              ) : (
                <Button size="sm" className="h-7 text-xs" disabled={busy !== null} onClick={() => void send(door, key)}>
                  {busy === key && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" aria-hidden="true" />}
                  {door.kind === "feedback" ? "Post it" : "Send it"}
                </Button>
              )}
            </footer>
          </section>
        );
      })}
    </div>
  );
}
