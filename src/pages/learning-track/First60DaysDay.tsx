import { useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Film,
  Lock,
  ClipboardCheck,
  NotebookPen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { dayMarkdownComponents } from "@/components/first-60-days/dayMarkdownComponents";
import { detectVideoEmbed, VideoEmbed } from "@/lib/video-embed-utils";
import { getDay, getAllDays, WEEK_META } from "@/features/first-60-days/content";
import { useFirst60DaysProgress } from "@/hooks/first-60-days/useFirst60DaysProgress";
import { useFirst60DaysDayMeta } from "@/hooks/first-60-days/useFirst60DaysDayMeta";
import { DayQuiz } from "@/components/first-60-days/DayQuiz";
import { DayReflection } from "@/components/first-60-days/DayReflection";

export default function First60DaysDay() {
  const { dayNumber: raw } = useParams<{ dayNumber: string }>();
  const dayNumber = Number(raw);
  const navigate = useNavigate();

  const day = useMemo(() => getDay(dayNumber), [dayNumber]);
  const { isUnlocked, isDayComplete, isQuizPassed, isReflectionSubmitted, markRead } =
    useFirst60DaysProgress();
  const dayMetaQuery = useFirst60DaysDayMeta(dayNumber);
  const dayMeta = dayMetaQuery.data;
  const unlocked = isUnlocked(dayNumber);
  const completed = isDayComplete(dayNumber);
  const quizPassed = isQuizPassed(dayNumber);
  const reflectionSubmitted = isReflectionSubmitted(dayNumber);

  useEffect(() => {
    if (day && unlocked) markRead(dayNumber);
  }, [day, dayNumber, unlocked, markRead]);

  if (!day) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">Day not found.</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/learning-track/first-60-days">Back to 60-day hub</Link>
        </Button>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <Lock className="h-8 w-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Day {dayNumber} is locked</h2>
          <p className="text-sm text-muted-foreground">
            Finish the quiz on Day {dayNumber - 1} to unlock this day.
          </p>
          <Button asChild>
            <Link to={`/learning-track/first-60-days/day/${dayNumber - 1}`}>
              Go to Day {dayNumber - 1}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const allDays = getAllDays();
  const idx = allDays.findIndex((d) => d.dayNumber === dayNumber);
  const prev = idx > 0 ? allDays[idx - 1] : undefined;
  const next = idx >= 0 && idx < allDays.length - 1 ? allDays[idx + 1] : undefined;
  const nextUnlocked = next ? isDayComplete(dayNumber) : false;
  const weekMeta = WEEK_META[day.week];

  return (
    <div className="mx-auto max-w-4xl space-y-4" data-testid="first-60-days-day">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/learning-track/first-60-days" className="hover:text-foreground">
          60-day hub
        </Link>
        <span>/</span>
        <span>Week {day.week}</span>
        <span>/</span>
        <span className="text-foreground">Day {day.dayNumber}</span>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-2 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Day {day.dayNumber} of 60</Badge>
            <Badge variant="outline">
              Week {day.week} · {weekMeta?.title ?? ""}
            </Badge>
            {completed && (
              <Badge className="border-emerald-500/60 bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Day complete
              </Badge>
            )}
            {!completed && quizPassed && (
              <Badge variant="outline">Quiz passed — reflection pending</Badge>
            )}
            {!completed && !quizPassed && reflectionSubmitted && (
              <Badge variant="outline">Reflection submitted — quiz pending</Badge>
            )}
            <Badge variant="outline">~{day.frontmatter.duration_minutes} min</Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{day.title}</h1>
        </CardContent>
      </Card>

      <Tabs defaultValue="read" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="read">
            <BookOpen className="mr-2 h-4 w-4" />
            Read
          </TabsTrigger>
          <TabsTrigger value="slides">
            <FileText className="mr-2 h-4 w-4" />
            Slides
          </TabsTrigger>
          <TabsTrigger value="video">
            <Film className="mr-2 h-4 w-4" />
            Video
          </TabsTrigger>
          <TabsTrigger value="reflection">
            <NotebookPen className="mr-2 h-4 w-4" />
            Reflection
            {day.reflection.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {day.reflection.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="quiz">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Quiz
            {day.quiz.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {day.quiz.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="read" className="mt-4">
          <Card>
            <CardContent className="prose prose-sm max-w-none px-5 py-6 dark:prose-invert sm:prose-base">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={dayMarkdownComponents}>
                {day.markdown}
              </ReactMarkdown>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slides" className="mt-4">
          {dayMeta?.slides_url ? (
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black">
                  <iframe
                    src={dayMeta.slides_url}
                    className="absolute inset-0 h-full w-full"
                    allowFullScreen
                    title={`Day ${dayNumber} slides`}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Slides coming soon</h3>
                <p className="text-sm text-muted-foreground">
                  The slide deck for this day hasn't been added yet. Continue with Read + Quiz.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="video" className="mt-4">
          {dayMeta?.video_url ? (
            <Card>
              <CardContent className="p-0">
                {(() => {
                  const info = detectVideoEmbed(dayMeta.video_url);
                  if (info.embedUrl) {
                    return <VideoEmbed embedUrl={info.embedUrl} platform={info.platform} />;
                  }
                  return (
                    <div className="p-6 text-sm text-muted-foreground">
                      Video URL stored but not recognised by the player.{" "}
                      <a href={dayMeta.video_url} target="_blank" rel="noreferrer" className="underline">
                        Open in new tab
                      </a>
                      .
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                <Film className="h-8 w-8 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Video coming soon</h3>
                <p className="text-sm text-muted-foreground">
                  The video lecture for this day hasn't been recorded yet. Continue with Read + Quiz.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reflection" className="mt-4">
          <DayReflection dayNumber={dayNumber} prompts={day.reflection} />
        </TabsContent>

        <TabsContent value="quiz" className="mt-4">
          <DayQuiz dayNumber={dayNumber} questions={day.quiz} />
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {prev ? (
          <Button variant="ghost" onClick={() => navigate(`/learning-track/first-60-days/day/${prev.dayNumber}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Day {prev.dayNumber}
          </Button>
        ) : (
          <span />
        )}
        {next && (
          <Button
            variant={nextUnlocked ? "default" : "secondary"}
            disabled={!nextUnlocked}
            onClick={() => nextUnlocked && navigate(`/learning-track/first-60-days/day/${next.dayNumber}`)}
          >
            {nextUnlocked
              ? `Day ${next.dayNumber}`
              : !quizPassed && !reflectionSubmitted
              ? "Finish quiz + reflection to unlock next"
              : !quizPassed
              ? "Pass the quiz to unlock next"
              : "Submit reflection to unlock next"}
            {nextUnlocked && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}
