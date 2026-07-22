import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Check, ShieldCheck, PencilLine, Eye, Loader2 } from "lucide-react";

// Compass Hub's Supabase project (hardcoded — the client reads no VITE env).
const SUPABASE_URL = "https://hgdbflprrficdoyxmdxe.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZGJmbHBycmZpY2RveXhtZHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjY0NDAsImV4cCI6MjA2NzM0MjQ0MH0.2qwUbh0nkFyOLzzZgXk7bedINzHSf2ULMBUECOqWmIw";

type SessionState = "loading" | "signed-out" | "ready";

/**
 * OAuth 2.1 consent screen (the authorization_endpoint). Rendered inside the
 * SPA so it can reuse the user's logged-in Supabase session. On Approve it asks
 * the oauth edge function to mint an authorization code, then redirects back to
 * the client (Claude) with ?code=...&state=...
 */
export default function OAuthConsentPage() {
  const [params] = useSearchParams();
  const [session, setSession] = useState<SessionState>("loading");
  const [email, setEmail] = useState<string>("");
  const [allowWrite, setAllowWrite] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = params.get("client_name") || "An AI agent";
  const clientId = params.get("client_id") || "";
  const redirectUri = params.get("redirect_uri") || "";
  const state = params.get("state") || "";
  const codeChallenge = params.get("code_challenge") || "";
  const requestedScope = params.get("scope") || "read write";
  const wantsWrite = /\bwrite\b/.test(requestedScope);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setEmail(data.session.user.email ?? "");
        setSession("ready");
      } else {
        setSession("signed-out");
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) { setEmail(s.user.email ?? ""); setSession("ready"); }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const paramsValid = clientId && redirectUri && codeChallenge;

  const safeRedirect = (uri: string): URL | null => {
    try {
      const u = new URL(uri);
      // Only ever navigate to http(s) — blocks javascript:/data: XSS vectors.
      if (u.protocol !== "https:" && u.protocol !== "http:") return null;
      return u;
    } catch {
      return null;
    }
  };

  const bounceBack = (extra: Record<string, string>) => {
    const u = safeRedirect(redirectUri);
    if (!u) { setError("Invalid redirect URI supplied by the client."); return; }
    Object.entries(extra).forEach(([k, v]) => u.searchParams.set(k, v));
    if (state) u.searchParams.set("state", state);
    window.location.href = u.toString();
  };

  const approve = async () => {
    setSubmitting(true);
    setError(null);
    const { data: sess } = await supabase.auth.getSession();
    const token = sess.session?.access_token;
    if (!token) { setSession("signed-out"); setSubmitting(false); return; }
    const scope = wantsWrite && allowWrite ? "read write" : "read";
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/oauth/grant`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${token}` },
        body: JSON.stringify({ client_id: clientId, redirect_uri: redirectUri, scope, code_challenge: codeChallenge, state }),
      });
      const body = await res.json();
      if (!res.ok) { setError(body.error_description || body.error || "Could not authorize."); setSubmitting(false); return; }
      const dest = safeRedirect(body.redirect || "");
      if (!dest) { setError("The client supplied an unsafe redirect URI."); setSubmitting(false); return; }
      window.location.href = dest.toString();
    } catch (e) {
      setError(String((e as Error)?.message ?? e));
      setSubmitting(false);
    }
  };

  const deny = () => bounceBack({ error: "access_denied" });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl">
            Connect <span className="text-primary">{clientName}</span> to Compass Hub?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!paramsValid ? (
            <p className="text-sm text-destructive text-center">
              This authorization link is missing required parameters. Start the connection again from your app.
            </p>
          ) : session === "loading" ? (
            <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : session === "signed-out" ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">Sign in to your Compass Hub account to continue.</p>
              <a href="/auth" target="_blank" rel="noopener">
                <Button className="w-full">Sign in</Button>
              </a>
              <p className="text-xs text-muted-foreground">After signing in, this page continues automatically.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Signed in as <span className="font-medium text-foreground">{email}</span>
              </p>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">This will let it</p>
                <div className="flex items-start gap-3 text-sm">
                  <Eye className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Read your learning progress, XP, quiz history, achievements, bookmarks and notes</span>
                </div>
                {wantsWrite && (
                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <span className="mt-0.5">
                      <input type="checkbox" checked={allowWrite} onChange={(e) => setAllowWrite(e.target.checked)} className="accent-primary w-4 h-4" />
                    </span>
                    <span className="flex items-center gap-1.5">
                      <PencilLine className="w-4 h-4 text-primary flex-shrink-0" />
                      Save notes on your behalf
                    </span>
                  </label>
                )}
              </div>

              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>You can revoke this connection anytime from My Account. Access tokens expire hourly and refresh automatically.</span>
              </div>

              {error && <p className="text-sm text-destructive text-center">{error}</p>}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={deny} disabled={submitting}>Deny</Button>
                <Button className="flex-1" onClick={approve} disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" />Approve</>}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
