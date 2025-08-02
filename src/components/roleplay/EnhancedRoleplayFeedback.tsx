import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Clock, Mic, TrendingUp, AlertTriangle, Target, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TranscriptDisplay } from './TranscriptDisplay';

interface RoleplaySession {
  id: string;
  scenario_title: string;
  scenario_category: string;
  scenario_difficulty: string;
  duration_seconds?: number;
}

interface RoleplayFeedback {
  overall_score: number;
  communication_score: number;
  listening_score: number;
  objection_handling_score: number;
  product_knowledge_score: number;
  strengths: string[];
  improvement_areas: string[];
  specific_feedback: string;
  coaching_points?: string[];
  follow_up_questions?: string[];
}

interface SpeechAnalytics {
  avgWPM: number;
  totalFillerWords: number;
  totalSpeakingTime: number;
  energyTrend: number[];
  wpmTrend: { time: number; wpm: number }[];
  fillerWordsByType: { word: string; count: number }[];
  coachingEvents: { type: string; count: number }[];
}

interface EnhancedRoleplayFeedbackProps {
  session: RoleplaySession;
  feedback: RoleplayFeedback;
  onPracticeAgain: () => void;
  onContinue: () => void;
}

export const EnhancedRoleplayFeedback: React.FC<EnhancedRoleplayFeedbackProps> = ({
  session,
  feedback,
  onPracticeAgain,
  onContinue
}) => {
  const [speechAnalytics, setSpeechAnalytics] = useState<SpeechAnalytics | null>(null);
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpeechAnalytics();
    loadTranscripts();
  }, [session.id]);

  const loadSpeechAnalytics = async () => {
    try {
      // Load speech metrics
      const { data: metrics } = await supabase
        .from('speech_metrics')
        .select('*')
        .eq('session_id', session.id)
        .order('timestamp_offset');

      // Load coaching events
      const { data: events } = await supabase
        .from('coaching_events')
        .select('*')
        .eq('session_id', session.id);

      // Load conversation transcripts
      const { data: conversations } = await supabase
        .from('conversation_transcripts')
        .select('*')
        .eq('session_id', session.id)
        .eq('speaker', 'user')
        .order('timestamp_offset');

      if (metrics && metrics.length > 0) {
        // Calculate analytics
        const avgWPM = metrics.reduce((sum, m) => sum + (m.words_per_minute || 0), 0) / metrics.length;
        const totalFillerWords = metrics.reduce((sum, m) => sum + (m.filler_word_count || 0), 0);
        const totalSpeakingTime = Math.max(...metrics.map(m => m.speaking_time_ms || 0));

        const wpmTrend = metrics.map(m => ({
          time: Math.floor(m.timestamp_offset / 1000),
          wpm: m.words_per_minute || 0
        }));

        const energyTrend = metrics.map(m => (m.energy_level || 0) * 100);

        // Analyze filler words from transcripts
        const fillerWordsByType: { [key: string]: number } = {};
        conversations?.forEach(conv => {
          conv.filler_words?.forEach((word: string) => {
            fillerWordsByType[word] = (fillerWordsByType[word] || 0) + 1;
          });
        });

        const fillerWordsArray = Object.entries(fillerWordsByType)
          .map(([word, count]) => ({ word, count }))
          .sort((a, b) => b.count - a.count);

        // Count coaching events by type
        const coachingEventsByType: { [key: string]: number } = {};
        events?.forEach(event => {
          coachingEventsByType[event.event_type] = (coachingEventsByType[event.event_type] || 0) + 1;
        });

        const coachingEventsArray = Object.entries(coachingEventsByType)
          .map(([type, count]) => ({ type: type.replace('_', ' '), count }));

        setSpeechAnalytics({
          avgWPM,
          totalFillerWords,
          totalSpeakingTime,
          energyTrend,
          wpmTrend,
          fillerWordsByType: fillerWordsArray,
          coachingEvents: coachingEventsArray
        });
      }
    } catch (error) {
      console.error('Error loading speech analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTranscripts = async () => {
    try {
      const { data } = await supabase
        .from('conversation_transcripts')
        .select('*')
        .eq('session_id', session.id)
        .order('timestamp_offset');

      setTranscripts(data || []);
    } catch (error) {
      console.error('Error loading transcripts:', error);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">Loading detailed analytics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Session Summary */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{session.scenario_title}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{session.scenario_category}</Badge>
                <Badge className={getDifficultyColor(session.scenario_difficulty)}>
                  {session.scenario_difficulty}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(session.duration_seconds)}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="speech">Speech Analysis</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="coaching">Coaching</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Overall Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className={`text-4xl font-bold ${getScoreColor(feedback.overall_score)}`}>
                  {feedback.overall_score}%
                </div>
                <Progress value={feedback.overall_score} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Communication', score: feedback.communication_score },
                { label: 'Listening', score: feedback.listening_score },
                { label: 'Objection Handling', score: feedback.objection_handling_score },
                { label: 'Product Knowledge', score: feedback.product_knowledge_score },
              ].map(({ label, score }) => (
                <div key={label} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{label}</span>
                    <span className={`font-bold ${getScoreColor(score)}`}>{score}%</span>
                  </div>
                  <Progress value={score} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Feedback Sections */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-amber-600">Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.improvement_areas.map((area, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed">{feedback.specific_feedback}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Speech Analysis Tab */}
        <TabsContent value="speech" className="space-y-6">
          {speechAnalytics && (
            <>
              {/* Speech Metrics Overview */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <Mic className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-2xl font-bold">{Math.round(speechAnalytics.avgWPM)}</div>
                        <div className="text-sm text-muted-foreground">Avg Words/Min</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <div>
                        <div className="text-2xl font-bold">{speechAnalytics.totalFillerWords}</div>
                        <div className="text-sm text-muted-foreground">Filler Words</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="text-2xl font-bold">
                          {Math.round(speechAnalytics.totalSpeakingTime / 1000)}s
                        </div>
                        <div className="text-sm text-muted-foreground">Speaking Time</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Speech Pattern Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Speaking Pace Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={speechAnalytics.wpmTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="wpm" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Most Common Filler Words</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={speechAnalytics.fillerWordsByType.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="word" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Transcript Tab */}
        <TabsContent value="transcript" className="space-y-4">
          <TranscriptDisplay
            sessionId={session.id}
            isLive={false}
            showControls={true}
            height="h-96"
          />
        </TabsContent>

        {/* Coaching Tab */}
        <TabsContent value="coaching" className="space-y-6">
          {feedback.coaching_points && feedback.coaching_points.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Coaching Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {feedback.coaching_points.map((point, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {feedback.follow_up_questions && feedback.follow_up_questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Reflection Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {feedback.follow_up_questions.map((question, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {speechAnalytics && speechAnalytics.coachingEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Real-time Coaching Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {speechAnalytics.coachingEvents.map((event, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="capitalize">{event.type}</span>
                      <Badge variant="outline">{event.count}x</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onPracticeAgain}>
          Practice Again
        </Button>
        <Button onClick={onContinue}>
          Continue Learning
        </Button>
      </div>
    </div>
  );
};