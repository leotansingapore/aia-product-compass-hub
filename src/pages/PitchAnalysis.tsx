import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Video,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  Target,
  Lightbulb,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ClipboardList,
  Loader2,
  Star,
  History,
  Calendar,
  TrendingDown,
  Minus,
  ExternalLink,
  FileText,
  ArrowRight,
  Link,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { toast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PitchAnalysis {
  id: string;
  status: string;
  video_url: string;
  video_title?: string;
  transcript?: string;
  transcript_source?: string;
  error_message?: string;
  overall_score?: number;
  product_knowledge_score?: number;
  needs_discovery_score?: number;
  objection_handling_score?: number;
  closing_technique_score?: number;
  communication_score?: number;
  executive_summary?: string;
  strengths?: string[];
  improvement_areas?: { area: string; issue: string; suggestion: string; quote?: string }[];
  missed_key_points?: string[];
  recommended_follow_up?: string[];
  detailed_rubric?: {
    [key: string]: { score: number; notes: string };
  };
  created_at: string;
}

// ─── Score helpers ─────────────────────────────────────────────────────────────

const getScoreColor = (score: number) => {
  if (score >= 8) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 6) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};

const getScoreBg = (score: number) => {
  if (score >= 8) return "bg-emerald-100 dark:bg-emerald-900/20";
  if (score >= 6) return "bg-amber-100 dark:bg-amber-900/20";
  return "bg-red-100 dark:bg-red-900/20";
};

const getScoreLabel = (score: number) => {
  if (score >= 9) return "Excellent";
  if (score >= 7) return "Good";
  if (score >= 5) return "Developing";
  return "Needs Work";
};

const ScoreCircle = ({ score, label }: { score: number; label: string }) => (
  <div className="flex flex-col items-center gap-1.5">
    <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 ${
      score >= 8 ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" :
      score >= 6 ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20" :
      "border-red-400 bg-red-50 dark:bg-red-900/20"
    }`}>
      <span className={`text-lg font-bold ${getScoreColor(score)}`}>{score}</span>
      <span className="text-[9px] text-muted-foreground">/10</span>
    </div>
    <span className="text-xs text-center text-muted-foreground leading-tight max-w-[70px]">{label}</span>
  </div>
);

// ─── Status tracking ──────────────────────────────────────────────────────────

const STATUS_STEPS = [
  { key: "transcribing", label: "Extracting transcript" },
  { key: "analysing", label: "Analysing pitch against Pro Achiever KB" },
  { key: "completed", label: "Analysis ready" },
];

// ─── History helpers ───────────────────────────────────────────────────────────

const TrendIcon = ({ current, previous }: { current: number; previous?: number }) => {
  if (previous === undefined) return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  if (current > previous) return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
  if (current < previous) return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PitchAnalysisPage() {
  const navigate = useNavigate();
  const { user } = useSimplifiedAuth();

  const [activeTab, setActiveTab] = useState("new");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [manualTranscript, setManualTranscript] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [analysis, setAnalysis] = useState<PitchAnalysis | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("strengths");
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // History state
  const [history, setHistory] = useState<PitchAnalysis[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<PitchAnalysis | null>(null);

  const isProcessing = analysis?.status === "transcribing" || analysis?.status === "analysing";
  const isCompleted = analysis?.status === "completed";
  const isFailed = analysis?.status === "failed";
  const needsTranscript = analysis?.status === "needs_transcript";

  // ── Timer for processing state ─────────────────────────────────────────────
  useEffect(() => {
    if (isProcessing) {
      setElapsedTime(0);
      timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isProcessing]);

  // ── Realtime + polling when processing ────────────────────────────────────
  useEffect(() => {
    if (!analysis?.id || !isProcessing) return;

    const poll = async () => {
      const { data } = await supabase
        .from("pitch_analyses")
        .select("*")
        .eq("id", analysis.id)
        .single();
      if (data) setAnalysis(parseAnalysis(data));
    };

    pollRef.current = setInterval(poll, 3000);
    channelRef.current = supabase
      .channel(`pitch-${analysis.id}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "pitch_analyses",
        filter: `id=eq.${analysis.id}`,
      }, (payload) => {
        setAnalysis(parseAnalysis(payload.new));
      })
      .subscribe();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [analysis?.id, isProcessing]);

  // ── Load history when tab switches ────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "history" && user) {
      loadHistory();
    }
  }, [activeTab, user]);

  const loadHistory = async () => {
    if (!user) return;
    setHistoryLoading(true);
    const { data, error } = await supabase
      .from("pitch_analyses")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error && data) {
      setHistory(data.map(parseAnalysis));
    }
    setHistoryLoading(false);
  };

  function parseAnalysis(raw: any): PitchAnalysis {
    const parse = (val: any) => {
      if (!val) return undefined;
      if (typeof val === "string") {
        try { return JSON.parse(val); } catch { return val; }
      }
      return val;
    };
    return {
      ...raw,
      strengths: parse(raw.strengths),
      improvement_areas: parse(raw.improvement_areas),
      missed_key_points: parse(raw.missed_key_points),
      recommended_follow_up: parse(raw.recommended_follow_up),
      detailed_rubric: parse(raw.detailed_rubric),
    };
  }

  const handleSubmit = async (retryAnalysisId?: string) => {
    if (!videoUrl.trim() && !manualTranscript.trim()) {
      toast({ title: "Enter a video URL or paste your transcript", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Please sign in to use this feature", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      let analysisId = retryAnalysisId;

      if (!analysisId) {
        const { data: record, error: insertError } = await supabase
          .from("pitch_analyses")
          .insert({
            user_id: user.id,
            video_url: videoUrl.trim() || "manual",
            video_title: videoTitle.trim() || null,
            status: "pending",
          })
          .select()
          .single();

        if (insertError || !record) throw insertError || new Error("Failed to create analysis record");
        setAnalysis(parseAnalysis(record));
        analysisId = record.id;
      } else {
        await supabase.from("pitch_analyses").update({ status: "pending" }).eq("id", analysisId);
        setAnalysis(prev => prev ? { ...prev, status: "pending" } : prev);
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token || anonKey;

      const fnResp = await fetch(`${supabaseUrl}/functions/v1/analyze-pitch-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: anonKey,
        },
        body: JSON.stringify({
          analysisId,
          videoUrl: videoUrl.trim() || "manual",
          transcript: manualTranscript.trim() || undefined,
          userId: user.id,
        }),
      });

      if (!fnResp.ok) {
        let errorBody: any = {};
        try { errorBody = await fnResp.json(); } catch { /* ignore */ }

        const isTranscriptUnavailable =
          errorBody?.error === "transcript_unavailable" ||
          fnResp.status === 422;

        const { data: latest } = await supabase
          .from("pitch_analyses")
          .select("*")
          .eq("id", analysisId!)
          .single();
        if (latest) setAnalysis(parseAnalysis(latest));

        if (!isTranscriptUnavailable) {
          toast({
            title: "Analysis failed to start",
            description: errorBody?.error || `Server error (${fnResp.status})`,
            variant: "destructive",
          });
        }
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setVideoUrl("");
    setVideoTitle("");
    setManualTranscript("");
    setShowManual(false);
    setExpandedSection("strengths");
  };

  const toggleSection = (key: string) =>
    setExpandedSection(prev => prev === key ? null : key);

  const progressPercent = analysis?.status === "transcribing" ? 30
    : analysis?.status === "analysing" ? 70
    : analysis?.status === "completed" ? 100
    : 0;

  const processingLabel = analysis?.status === "transcribing"
    ? "Extracting transcript from video…"
    : analysis?.status === "analysing"
    ? "Analysing pitch against Pro Achiever knowledge base…"
    : "Finalising…";

  // ── Chart data (chronological order) ──────────────────────────────────────
  const chartData = [...history]
    .reverse()
    .map((h, i) => ({
      attempt: `#${i + 1}`,
      date: format(new Date(h.created_at), "dd MMM"),
      Overall: h.overall_score ?? 0,
      "Product Knowledge": h.product_knowledge_score ?? 0,
      "Needs Discovery": h.needs_discovery_score ?? 0,
      "Objection Handling": h.objection_handling_score ?? 0,
      "Closing": h.closing_technique_score ?? 0,
      "Communication": h.communication_score ?? 0,
    }));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Helmet>
        <title>Pitch Analysis · Pro Achiever · FINternship</title>
        <meta name="description" content="Upload your Pro Achiever pitch video and get AI-powered feedback." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate("/roleplay")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Roleplay
          </button>

          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Pitch Analysis</h1>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-[10px]">
                  Pro Achiever
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Submit a Loom or YouTube recording of your pitch — our AI will score it against the Pro Achiever knowledge base.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="new" className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> New Analysis
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" /> History
            </TabsTrigger>
          </TabsList>

          {/* ── New Analysis Tab ─────────────────────────────────────────── */}
          <TabsContent value="new" className="space-y-5 mt-5">

            {/* Input Form */}
            {!analysis && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Submit Your Pitch Recording</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Video URL <span className="text-muted-foreground font-normal">(Loom or YouTube)</span></label>
                    <Input
                      placeholder="https://www.loom.com/share/... or https://youtu.be/..."
                      value={videoUrl}
                      onChange={e => setVideoUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Loom: ensure captions are enabled in your recording. YouTube: captions must be available on the video.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Session Title <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <Input
                      placeholder="e.g. John Doe — Pro Achiever pitch attempt 1"
                      value={videoTitle}
                      onChange={e => setVideoTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <button
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowManual(v => !v)}
                    >
                      {showManual ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      {showManual ? "Hide manual transcript" : "Or paste transcript manually"}
                    </button>
                    {showManual && (
                      <div className="mt-3 space-y-1.5">
                        <label className="text-sm font-medium">Transcript</label>
                        <Textarea
                          placeholder="Paste the full transcript of your pitch here…"
                          value={manualTranscript}
                          onChange={e => setManualTranscript(e.target.value)}
                          rows={8}
                          className="text-sm"
                        />
                        <p className="text-xs text-muted-foreground">A minimum of ~200 words is needed for a meaningful analysis.</p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleSubmit()}
                    disabled={submitting || (!videoUrl.trim() && !manualTranscript.trim())}
                    className="w-full sm:w-auto"
                  >
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</>
                    ) : (
                      <><Sparkles className="h-4 w-4 mr-2" /> Analyse Pitch</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Processing state */}
            {analysis && isProcessing && (
              <Card>
                <CardContent className="pt-6 pb-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{processingLabel}</p>
                      <p className="text-xs text-muted-foreground">{elapsedTime}s elapsed</p>
                    </div>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <div className="space-y-2">
                    {STATUS_STEPS.map((step, i) => {
                      const stepIndex = STATUS_STEPS.findIndex(s => s.key === analysis.status);
                      const done = i < stepIndex || analysis.status === "completed";
                      const active = STATUS_STEPS[i].key === analysis.status;
                      return (
                        <div key={step.key} className="flex items-center gap-2.5 text-sm">
                          {done ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : active ? (
                            <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-muted shrink-0" />
                          )}
                          <span className={active ? "text-foreground font-medium" : done ? "text-muted-foreground line-through" : "text-muted-foreground"}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Failed state */}
            {analysis && isFailed && (
              <Card className="border-destructive/40">
                <CardContent className="pt-6 pb-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-destructive">Analysis Failed</p>
                      <p className="text-sm text-muted-foreground mt-1">{analysis.error_message || "An unexpected error occurred."}</p>
                    </div>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4 text-sm space-y-1.5">
                    <p className="font-medium">Tips to resolve this:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>For Loom — enable captions in your Loom workspace settings before recording</li>
                      <li>For YouTube — ensure auto-captions or manual captions are available</li>
                      <li>Use the "Paste transcript manually" option as a reliable alternative</li>
                    </ul>
                  </div>
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" /> Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Needs manual transcript — soft fallback */}
            {analysis && needsTranscript && (
              <Card className="border-amber-400/40 bg-amber-50/30 dark:bg-amber-900/10">
                <CardContent className="pt-6 pb-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-700 dark:text-amber-400">Transcript Could Not Be Auto-Extracted</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Loom transcripts require authentication to access automatically. Please paste your transcript below and we'll run the analysis instantly.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Paste Your Transcript</label>
                    <Textarea
                      placeholder="Open your Loom video → click the Transcript tab → copy all text and paste it here…"
                      value={manualTranscript}
                      onChange={e => setManualTranscript(e.target.value)}
                      rows={8}
                      className="text-sm"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      In Loom: open your video → click <strong>Transcript</strong> on the right panel → select all → copy → paste above.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSubmit(analysis.id)}
                      disabled={submitting || manualTranscript.trim().length < 50}
                    >
                      {submitting ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analysing…</>
                      ) : (
                        <><Sparkles className="h-4 w-4 mr-2" /> Run Analysis</>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                      <RotateCcw className="h-4 w-4 mr-2" /> Start Over
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {analysis && isCompleted && (
              <AnalysisResults
                analysis={analysis}
                expandedSection={expandedSection}
                toggleSection={toggleSection}
                onReset={handleReset}
              />
            )}
          </TabsContent>

          {/* ── History Tab ──────────────────────────────────────────────── */}
          <TabsContent value="history" className="space-y-5 mt-5">
            {selectedHistory ? (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedHistory(null)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to History
                  </button>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(selectedHistory.created_at), "d MMM yyyy, h:mm a")}
                  </span>
                </div>
                {selectedHistory.video_title && (
                  <p className="text-sm font-medium">{selectedHistory.video_title}</p>
                )}
                <AnalysisResults
                  analysis={selectedHistory}
                  expandedSection={expandedSection}
                  toggleSection={toggleSection}
                  onReset={() => setSelectedHistory(null)}
                  hideResetButton
                />
              </div>
            ) : historyLoading ? (
              <div className="flex items-center gap-3 py-12 justify-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading history…</span>
              </div>
            ) : history.length === 0 ? (
              <Card>
                <CardContent className="pt-10 pb-10 text-center space-y-2">
                  <History className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                  <p className="font-medium text-muted-foreground">No analyses yet</p>
                  <p className="text-sm text-muted-foreground">Complete your first pitch analysis to see your history here.</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => setActiveTab("new")}>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Start an Analysis
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Trend chart */}
                {history.length >= 2 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Score Trend Over Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                          <XAxis dataKey="attempt" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip
                            contentStyle={{
                              background: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: 8,
                              fontSize: 12,
                            }}
                            formatter={(val: any) => [`${val}/10`]}
                          />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Line type="monotone" dataKey="Overall" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="Product Knowledge" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                          <Line type="monotone" dataKey="Communication" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* History list */}
                <div className="space-y-3">
                  {history.map((item, idx) => {
                    const prev = history[idx + 1];
                    const delta = prev?.overall_score !== undefined && item.overall_score !== undefined
                      ? item.overall_score - prev.overall_score
                      : undefined;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedHistory(item)}
                        className="w-full text-left"
                      >
                        <Card className="hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group">
                          <CardContent className="py-4 px-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                    Attempt #{history.length - idx}
                                  </span>
                                  {item.video_title && (
                                    <span className="text-sm font-medium truncate">{item.video_title}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(item.created_at), "d MMM yyyy, h:mm a")}
                                  </div>
                                  {item.video_url && item.video_url !== "manual" && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <ExternalLink className="h-3 w-3" />
                                      Video
                                    </div>
                                  )}
                                </div>
                                {/* Sub-scores mini */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {[
                                    { label: "PKnow", val: item.product_knowledge_score },
                                    { label: "Needs", val: item.needs_discovery_score },
                                    { label: "Obj", val: item.objection_handling_score },
                                    { label: "Close", val: item.closing_technique_score },
                                    { label: "Comm", val: item.communication_score },
                                  ].map(s => s.val !== undefined && (
                                    <span key={s.label} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getScoreBg(s.val)} ${getScoreColor(s.val)}`}>
                                      {s.label} {s.val}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <div className="flex items-center gap-1.5">
                                  {delta !== undefined && (
                                    <span className={`text-xs font-medium ${delta > 0 ? "text-emerald-600" : delta < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                                      {delta > 0 ? `+${delta}` : delta}
                                    </span>
                                  )}
                                  <TrendIcon current={item.overall_score ?? 0} previous={prev?.overall_score} />
                                  <span className={`text-2xl font-bold ${getScoreColor(item.overall_score ?? 0)}`}>
                                    {item.overall_score ?? "–"}
                                  </span>
                                  <span className="text-xs text-muted-foreground">/10</span>
                                </div>
                                <Badge className={`text-[10px] border-0 ${getScoreBg(item.overall_score ?? 0)} ${getScoreColor(item.overall_score ?? 0)}`}>
                                  {getScoreLabel(item.overall_score ?? 0)}
                                </Badge>
                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground -rotate-90 group-hover:text-foreground transition-colors" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// ─── Analysis Results (shared between current + history view) ─────────────────

function AnalysisResults({
  analysis,
  expandedSection,
  toggleSection,
  onReset,
  hideResetButton = false,
}: {
  analysis: PitchAnalysis;
  expandedSection: string | null;
  toggleSection: (key: string) => void;
  onReset: () => void;
  hideResetButton?: boolean;
}) {
  return (
    <div className="space-y-5">
      {/* Overall score banner */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-muted-foreground">Overall Score</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-bold ${getScoreColor(analysis.overall_score || 0)}`}>
                  {analysis.overall_score ?? "–"}
                </span>
                <span className="text-muted-foreground text-lg">/ 10</span>
                <Badge className={`ml-1 ${getScoreBg(analysis.overall_score || 0)} ${getScoreColor(analysis.overall_score || 0)} border-0 text-xs`}>
                  {getScoreLabel(analysis.overall_score || 0)}
                </Badge>
              </div>
              {analysis.executive_summary && (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{analysis.executive_summary}</p>
              )}
            </div>
            {!hideResetButton && (
              <Button variant="outline" size="sm" onClick={onReset}>
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> New Analysis
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscores grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
            <ScoreCircle score={analysis.product_knowledge_score ?? 0} label="Product Knowledge" />
            <ScoreCircle score={analysis.needs_discovery_score ?? 0} label="Needs Discovery" />
            <ScoreCircle score={analysis.objection_handling_score ?? 0} label="Objection Handling" />
            <ScoreCircle score={analysis.closing_technique_score ?? 0} label="Closing Technique" />
            <ScoreCircle score={analysis.communication_score ?? 0} label="Communication" />
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      {analysis.strengths && analysis.strengths.length > 0 && (
        <CollapsibleSection
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          title="Strengths"
          sectionKey="strengths"
          expanded={expandedSection === "strengths"}
          onToggle={toggleSection}
        >
          <ul className="space-y-2.5">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Improvement Areas */}
      {analysis.improvement_areas && analysis.improvement_areas.length > 0 && (
        <CollapsibleSection
          icon={<TrendingUp className="h-4 w-4 text-amber-500" />}
          title="Improvement Areas"
          sectionKey="improvements"
          expanded={expandedSection === "improvements"}
          onToggle={toggleSection}
        >
          <div className="space-y-4">
            {analysis.improvement_areas.map((item, i) => (
              <div key={i} className="rounded-lg border bg-muted/20 p-3.5 space-y-2">
                <p className="font-medium text-sm">{item.area}</p>
                <p className="text-sm text-muted-foreground">{item.issue}</p>
                {item.quote && (
                  <blockquote className="border-l-2 border-primary/40 pl-3 text-xs text-muted-foreground italic">
                    "{item.quote}"
                  </blockquote>
                )}
                <div className="flex gap-2 items-start pt-1">
                  <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground">{item.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Missed Key Points */}
      {analysis.missed_key_points && analysis.missed_key_points.length > 0 && (
        <CollapsibleSection
          icon={<AlertTriangle className="h-4 w-4 text-orange-500" />}
          title="Missed Key Points"
          sectionKey="missed"
          expanded={expandedSection === "missed"}
          onToggle={toggleSection}
        >
          <p className="text-xs text-muted-foreground mb-3">Product knowledge that should have been mentioned but wasn't covered in the pitch.</p>
          <ul className="space-y-2">
            {analysis.missed_key_points.map((p, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <BookOpen className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Recommended Follow-up */}
      {analysis.recommended_follow_up && analysis.recommended_follow_up.length > 0 && (
        <CollapsibleSection
          icon={<ClipboardList className="h-4 w-4 text-blue-500" />}
          title="Action Plan"
          sectionKey="actions"
          expanded={expandedSection === "actions"}
          onToggle={toggleSection}
        >
          <ul className="space-y-2">
            {analysis.recommended_follow_up.map((action, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Detailed Rubric */}
      {analysis.detailed_rubric && Object.keys(analysis.detailed_rubric).length > 0 && (
        <CollapsibleSection
          icon={<Target className="h-4 w-4 text-primary" />}
          title="Detailed Rubric"
          sectionKey="rubric"
          expanded={expandedSection === "rubric"}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            {Object.entries(analysis.detailed_rubric).map(([key, val]) => (
              <div key={key} className="rounded-lg border p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{key.replace(/_/g, " ")}</span>
                  <span className={`text-sm font-bold ${getScoreColor(val.score)}`}>{val.score}/10</span>
                </div>
                <Progress value={val.score * 10} className="h-1.5" />
                <p className="text-xs text-muted-foreground">{val.notes}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Transcript (collapsed) */}
      {analysis.transcript && (
        <CollapsibleSection
          icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
          title="Extracted Transcript"
          sectionKey="transcript"
          expanded={expandedSection === "transcript"}
          onToggle={toggleSection}
        >
          <div className="bg-muted/40 rounded-md p-3 text-xs text-muted-foreground leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap font-mono">
            {analysis.transcript}
          </div>
          {analysis.transcript_source && (
            <p className="text-xs text-muted-foreground mt-2">Source: {analysis.transcript_source}</p>
          )}
        </CollapsibleSection>
      )}
    </div>
  );
}

// ─── Collapsible Section ──────────────────────────────────────────────────────

function CollapsibleSection({
  icon, title, sectionKey, expanded, onToggle, children,
}: {
  icon: React.ReactNode;
  title: string;
  sectionKey: string;
  expanded: boolean;
  onToggle: (key: string) => void;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <button
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
        onClick={() => onToggle(sectionKey)}
      >
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="font-semibold text-sm">{title}</span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {expanded && (
        <>
          <Separator />
          <CardContent className="pt-4 pb-5">{children}</CardContent>
        </>
      )}
    </Card>
  );
}
