import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, RefreshCw, Target, TrendingUp, MessageSquare, Volume2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FeedbackData {
  id: string;
  session_id: string;
  overall_score: number;
  communication_score: number;
  active_listening_score: number;
  objection_handling_score: number;
  product_knowledge_score: number;
  small_talk_score: number | null;
  pain_point_identification_score: number | null;
  strengths: string[] | null;
  improvement_areas: string[] | null;
  specific_feedback: string;
  coaching_points: string[] | null;
  follow_up_questions: string[] | null;
  tone_analysis: string[] | null;
  visual_presence_analysis: string[] | null;
  pronunciation_feedback: string | null;
  conversation_summary: string | null;
  created_at: string;
}

const RoleplayFeedback = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!sessionId) return;

      try {
        const { data, error } = await supabase
          .from('roleplay_feedback')
          .select('*')
          .eq('session_id', sessionId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching feedback:', error);
          toast({
            title: "Error",
            description: "Failed to load feedback data.",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          setFeedback(data);
        } else {
          setGenerating(true);
          // Set up real-time subscription for feedback generation
          const channel = supabase
            .channel('feedback-updates')
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'roleplay_feedback',
                filter: `session_id=eq.${sessionId}`
              },
              (payload) => {
                setFeedback(payload.new as FeedbackData);
                setGenerating(false);
              }
            )
            .subscribe();

          return () => {
            supabase.removeChannel(channel);
          };
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [sessionId]);

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'bg-green-500';
    if (score >= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4) return 'Excellent';
    if (score >= 3) return 'Good';
    if (score >= 2) return 'Needs Work';
    return 'Missed';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <SkeletonLoader type="card" />
      </div>
    );
  }

  if (generating) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-semibold mb-2">Generating Your Feedback</h2>
          <p className="text-muted-foreground">Our AI is analyzing your performance...</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No Feedback Available</h2>
          <p className="text-muted-foreground mb-4">Feedback for this session is not yet available.</p>
          <Button onClick={() => navigate('/roleplay')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Roleplay
          </Button>
        </div>
      </div>
    );
  }

  const coreScores = [
    { name: 'Engage in Small Talk', score: feedback.small_talk_score || 0 },
    { name: 'Active Listening', score: feedback.active_listening_score },
    { name: 'Identify Pain Points', score: feedback.pain_point_identification_score || 0 },
    { name: 'Product Knowledge', score: feedback.product_knowledge_score },
    { name: 'Objection Handling', score: feedback.objection_handling_score },
    { name: 'Communication', score: feedback.communication_score },
  ];

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/roleplay')}
            className="gap-2 min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Scenarios
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Roleplay Feedback</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Your performance analysis and coaching insights</p>
          </div>
        </div>
        <Button onClick={() => navigate('/roleplay')} className="gap-2 min-h-[44px] w-full sm:w-auto">
          <RefreshCw className="h-4 w-4" />
          Practice Again
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Rubric Section */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Rubric
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {coreScores.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.name}</span>
                    <Badge 
                      variant={item.score >= 4 ? 'default' : item.score >= 3 ? 'secondary' : 'destructive'}
                      className="min-w-[60px] justify-center"
                    >
                      {item.score === 0 ? 'Missed' : `${item.score}/5`}
                    </Badge>
                  </div>
                  <Progress value={(item.score / 5) * 100} className="h-2" />
                  {item.score === 0 && (
                    <p className="text-sm text-muted-foreground">
                      This competency was not demonstrated during the conversation.
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Feedback Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {feedback.strengths && feedback.strengths.length > 0 && (
                <div>
                  <h3 className="font-semibold text-green-600 mb-2">Strengths</h3>
                  <ul className="space-y-1">
                    {feedback.strengths.map((strength, index) => (
                      <li key={index} className="text-sm">{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.improvement_areas && feedback.improvement_areas.length > 0 && (
                <div>
                  <h3 className="font-semibold text-orange-600 mb-2">Growth Areas</h3>
                  <ul className="space-y-1 list-disc list-inside">
                    {feedback.improvement_areas.map((area, index) => (
                      <li key={index} className="text-sm">{area}</li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.specific_feedback && (
                <div>
                  <h3 className="font-semibold mb-2">Detailed Feedback</h3>
                  <p className="text-sm text-muted-foreground">{feedback.specific_feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Follow-up Questions */}
          {feedback.follow_up_questions && feedback.follow_up_questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Follow-up Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {feedback.follow_up_questions.map((question, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{question}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Advanced Analytics */}
        <div className="space-y-4 sm:space-y-6">
          {/* Tone Analysis */}
          {feedback.tone_analysis && feedback.tone_analysis.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {feedback.tone_analysis.map((tone, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tone}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Visual Presence */}
          {feedback.visual_presence_analysis && feedback.visual_presence_analysis.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Visual Presence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {feedback.visual_presence_analysis.map((presence, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {presence}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          {feedback.conversation_summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feedback.conversation_summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Pronunciation */}
          {feedback.pronunciation_feedback && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Volume2 className="h-4 w-4" />
                  Pronunciation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feedback.pronunciation_feedback}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleplayFeedback;