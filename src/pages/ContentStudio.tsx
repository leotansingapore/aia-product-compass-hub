import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles,
  Copy,
  RefreshCw,
  Loader2,
  Heart,
  User,
  BookOpen,
  Users,
  Image as ImageIcon,
  Video,
  AlignLeft,
  Smartphone,
  Linkedin,
  Instagram,
  Facebook,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

type Pillar = "interest" | "identity" | "topic" | "market";
type Format = "carousel" | "short-video" | "text-post" | "story";
type Platform = "linkedin" | "instagram" | "facebook" | "tiktok";
type CtaType = "dm-keyword" | "comment-keyword" | "save-share" | "book-call" | "open-question";

const PILLARS: { value: Pillar; label: string; sub: string; icon: typeof Heart; tag: "Social" | "Authority"; placeholder: string }[] = [
  {
    value: "interest",
    label: "Interest",
    sub: "A hobby/passion that humanises you",
    icon: Heart,
    tag: "Social",
    placeholder: "e.g. weekend running, photography, gaming, hawker hunting",
  },
  {
    value: "identity",
    label: "Identity",
    sub: "A life-stage or role you share with the audience",
    icon: User,
    tag: "Social",
    placeholder: "e.g. mum of two, fresh grad, ex-engineer turned FC, late-30s career-switcher",
  },
  {
    value: "topic",
    label: "Topic",
    sub: "A specific financial area you teach",
    icon: BookOpen,
    tag: "Authority",
    placeholder: "e.g. CPF SA top-ups, ILPs, critical illness, retirement planning",
  },
  {
    value: "market",
    label: "Market",
    sub: "A specific client segment you serve",
    icon: Users,
    tag: "Authority",
    placeholder: "e.g. fresh graduates earning $3.5-4.5K, SME owners, young families with kids under 7",
  },
];

const IDEA_SOURCES: { value: string; label: string; example: string }[] = [
  { value: "real-question", label: "A real question from a client this week", example: "e.g. 'My SA is only $20K at 32, is that bad?'" },
  { value: "common-mistake", label: "A common mistake people make", example: "e.g. assuming employer insurance is enough" },
  { value: "news-hook", label: "A news / Budget hook", example: "e.g. SG Budget CPF changes, market drop, MAS rule update" },
  { value: "personal-story", label: "A personal story or lesson learned", example: "e.g. first rejection, first client, what I'd tell my younger self" },
  { value: "before-after", label: "A before-and-after / case study", example: "e.g. anonymised client moved from Plan X to Plan Y, savings = $$" },
  { value: "three-things", label: "'3 things you didn't know about ___'", example: "e.g. 3 things you didn't know about CPF SA top-ups" },
  { value: "myth-bust", label: "Myth-busting", example: "e.g. 'Insurance is a scam' / 'CPF is just government money'" },
];

const FORMATS: { value: Format; label: string; sub: string; icon: typeof ImageIcon }[] = [
  { value: "carousel", label: "Carousel", sub: "5-8 slides, one idea per slide", icon: ImageIcon },
  { value: "short-video", label: "Short video", sub: "30-60 sec script for Reels/Shorts/TikTok", icon: Video },
  { value: "text-post", label: "Text post", sub: "100-250 words, mobile-readable", icon: AlignLeft },
  { value: "story", label: "Story frames", sub: "3-5 IG/FB story frames", icon: Smartphone },
];

const PLATFORMS: { value: Platform; label: string; icon: typeof Linkedin }[] = [
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "tiktok", label: "TikTok", icon: Video },
];

const CTAS: { value: CtaType; label: string; sub: string }[] = [
  { value: "dm-keyword", label: "DM keyword", sub: "'DM me GUIDE for the CPF top-up guide.'" },
  { value: "comment-keyword", label: "Comment keyword", sub: "'Comment INFO and I'll send the calculator.'" },
  { value: "save-share", label: "Save / share", sub: "'Save this for your next CPF review.'" },
  { value: "book-call", label: "Soft 15-min call", sub: "'DM me if you'd like a no-pressure 15-min review.'" },
  { value: "open-question", label: "Open question", sub: "'What's the one CPF question you've never had answered?'" },
];

export default function ContentStudio() {
  const { toast } = useToast();
  const [pillar, setPillar] = useState<Pillar>("topic");
  const [pillarDetail, setPillarDetail] = useState("");
  const [ideaSource, setIdeaSource] = useState<string>("real-question");
  const [ideaContext, setIdeaContext] = useState("");
  const [format, setFormat] = useState<Format>("text-post");
  const [platform, setPlatform] = useState<Platform>("linkedin");
  const [ctaType, setCtaType] = useState<CtaType>("dm-keyword");
  const [draft, setDraft] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const pillarMeta = useMemo(() => PILLARS.find((p) => p.value === pillar)!, [pillar]);
  const ideaMeta = useMemo(() => IDEA_SOURCES.find((s) => s.value === ideaSource)!, [ideaSource]);

  const handleGenerate = async () => {
    if (!pillarDetail.trim()) {
      toast({
        title: "Add a pillar detail",
        description: `Tell the generator what your ${pillarMeta.label.toLowerCase()} is. ${pillarMeta.placeholder}`,
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-social-content", {
        body: {
          pillar,
          pillarDetail: pillarDetail.trim(),
          ideaSource: ideaMeta.label,
          ideaContext: ideaContext.trim() || undefined,
          format,
          platform,
          ctaType,
        },
      });
      if (error) throw error;
      const text = (data as { draft?: string; error?: string } | null)?.draft;
      if (!text) {
        const errMsg = (data as { error?: string } | null)?.error ?? "No draft returned";
        throw new Error(errMsg);
      }
      setDraft(text);
      toast({ title: "Draft ready", description: "Review, edit, copy. Re-run if you want a different angle." });
    } catch (err) {
      console.error(err);
      toast({
        title: "Couldn't generate draft",
        description: err instanceof Error ? err.message : "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      toast({ title: "Copied", description: "Paste into your platform of choice." });
    } catch {
      toast({ title: "Copy failed", description: "Select the text manually and copy.", variant: "destructive" });
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-3 sm:px-0">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Content Studio
        </div>
        <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
          Draft a social post in 60 seconds
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Built around the framework in{" "}
          <Link to="/learning-track/first-60-days/day/40" className="text-primary hover:underline">
            Day 40
          </Link>
          {", "}
          <Link to="/learning-track/first-60-days/day/41" className="text-primary hover:underline">
            Day 41
          </Link>
          {", and "}
          <Link to="/learning-track/first-60-days/day/42" className="text-primary hover:underline">
            Day 42
          </Link>
          . Pick a pillar, an idea source, a format - the generator drafts a post that hits Authority + Social + a soft CTA.
        </p>
      </header>

      <Card className="border-border/60 shadow-card">
        <CardHeader>
          <CardTitle className="font-serif text-xl">1. Pick your pillar</CardTitle>
          <CardDescription>
            What is this post centred on? Social pillars (Interest/Identity) humanise you. Authority pillars (Topic/Market) build credibility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={pillar} onValueChange={(v) => setPillar(v as Pillar)} className="grid gap-3 sm:grid-cols-2">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <Label
                  key={p.value}
                  htmlFor={`pillar-${p.value}`}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${
                    pillar === p.value
                      ? "border-primary/60 bg-primary/5 shadow-sm"
                      : "border-border/70 hover:border-primary/40 hover:bg-muted/40"
                  }`}
                >
                  <RadioGroupItem value={p.value} id={`pillar-${p.value}`} className="mt-1" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">{p.label}</span>
                      <span className="rounded-full border border-border/60 bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {p.tag}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.sub}</p>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>
          <div className="space-y-1.5">
            <Label htmlFor="pillar-detail">Your specific {pillarMeta.label.toLowerCase()}</Label>
            <Textarea
              id="pillar-detail"
              value={pillarDetail}
              onChange={(e) => setPillarDetail(e.target.value)}
              placeholder={pillarMeta.placeholder}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-card">
        <CardHeader>
          <CardTitle className="font-serif text-xl">2. Pick your idea source</CardTitle>
          <CardDescription>
            The 7 idea sources from Day 41. The strongest posts come from real conversations and concrete situations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={ideaSource} onValueChange={setIdeaSource}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {IDEA_SOURCES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{ideaMeta.example}</p>
          <div className="space-y-1.5">
            <Label htmlFor="idea-context" className="flex items-center gap-1.5">
              Context <span className="text-xs font-normal text-muted-foreground">(optional, but better drafts)</span>
            </Label>
            <Textarea
              id="idea-context"
              value={ideaContext}
              onChange={(e) => setIdeaContext(e.target.value)}
              placeholder="The actual question, mistake, story, or numbers. Specific beats generic every time."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-card">
        <CardHeader>
          <CardTitle className="font-serif text-xl">3. Pick platform, format, CTA</CardTitle>
          <CardDescription>Match the format to where you're posting and what you want the reader to do next.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as Format)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMATS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              {FORMATS.find((f) => f.value === format)!.sub}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>CTA style</Label>
            <Select value={ctaType} onValueChange={(v) => setCtaType(v as CtaType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CTAS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              {CTAS.find((c) => c.value === ctaType)!.sub}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <span>
            The draft is a starting point - never a final post. Edit for your voice. Day 41 is clear: copying generic templates produces generic results.
          </span>
        </div>
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={loading}
          className="gap-2 bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Drafting..." : draft ? "Generate another angle" : "Generate draft"}
        </Button>
      </div>

      {draft && (
        <Card className="border-border/60 shadow-card">
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div className="space-y-1">
              <CardTitle className="font-serif text-xl">Your draft</CardTitle>
              <CardDescription>
                Read it, cut 30% of words, edit for your voice, then publish. Re-run for a different angle if needed.
              </CardDescription>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading} className="gap-1.5">
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Re-roll
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={Math.min(28, Math.max(10, draft.split("\n").length + 2))}
              className="font-mono text-sm leading-relaxed"
            />
            <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
              <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Edit inline before copying. Reminder from Day 41: every post needs Authority + Social + a soft CTA. If the draft missed any, rewrite that part.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
