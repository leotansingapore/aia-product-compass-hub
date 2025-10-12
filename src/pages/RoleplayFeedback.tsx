import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, RefreshCw, Target, TrendingUp, MessageSquare, Volume2, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ConversationTranscript } from '@/components/ConversationTranscript';

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
  // Enhanced fields
  practice_score?: number;
  detailed_rubric_feedback?: any;
  conversation_flow_summary?: string[];
  body_language_analysis?: string;
  tone_detailed_analysis?: string;
}

const RoleplayFeedback = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [expandedRubric, setExpandedRubric] = useState<{ [key: string]: boolean }>({});
  const [progressMessage, setProgressMessage] = useState("");
  const [estimatedTime, setEstimatedTime] = useState(60);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let channel: any;

    const fetchFeedback = async () => {
      if (!sessionId) {
        console.error('🔍 FEEDBACK DEBUG: No session ID provided in URL parameters');
        toast({
          title: "Error",
          description: "No session ID found. Please start a new roleplay session.",
          variant: "destructive",
        });
        navigate('/roleplay');
        return;
      }

      console.log('🔍 FEEDBACK DEBUG: Starting feedback fetch for session ID:', sessionId);
      console.log('🔍 FEEDBACK DEBUG: Initial state - loading:', loading, 'generating:', generating, 'feedback:', !!feedback);

      try {
        console.log('🔍 FEEDBACK DEBUG: Querying database...');
        const { data, error } = await supabase
          .from('roleplay_feedback')
          .select('*')
          .eq('session_id', sessionId)
          .maybeSingle();

        console.log('🔍 FEEDBACK DEBUG: Database query result:', {
          hasData: !!data,
          error: error?.message,
          errorCode: error?.code,
          dataId: data?.id
        });

        if (error && error.code !== 'PGRST116') {
          console.error('🔍 FEEDBACK DEBUG: Database error:', error);
          toast({
            title: "Error",
            description: "Failed to load feedback data.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (data) {
          console.log('🔍 FEEDBACK DEBUG: Feedback found! Setting feedback and disabling loading states');
          setFeedback(data as FeedbackData);
          setLoading(false);
          setGenerating(false);
          console.log('🔍 FEEDBACK DEBUG: States updated - feedback loaded successfully');
        } else {
          console.log('🔍 FEEDBACK DEBUG: No feedback found, checking session transcript status');

          // Check if session has transcript before trying to generate feedback
          const { data: sessionData } = await supabase
            .from('roleplay_sessions')
            .select('transcript, recording_status, ended_at')
            .eq('id', sessionId)
            .maybeSingle();

          console.log('🔍 FEEDBACK DEBUG: Session data:', {
            hasTranscript: !!sessionData?.transcript,
            transcriptLength: sessionData?.transcript?.length || 0,
            recordingStatus: sessionData?.recording_status,
            endedAt: sessionData?.ended_at
          });

          // If session just ended (within last 10 seconds), wait for webhook to process
          const sessionEndTime = sessionData?.ended_at ? new Date(sessionData.ended_at).getTime() : 0;
          const timeSinceEnd = Date.now() - sessionEndTime;

          if (sessionEndTime && timeSinceEnd < 10000) {
            console.log('🔍 FEEDBACK DEBUG: Session recently ended, waiting for webhook processing...');
            setProgressMessage("Processing conversation recording...");

            // Wait 8 seconds for webhook to process transcript
            await new Promise(resolve => setTimeout(resolve, 8000));

            // Re-check for transcript
            const { data: updatedSession } = await supabase
              .from('roleplay_sessions')
              .select('transcript')
              .eq('id', sessionId)
              .maybeSingle();

            if (updatedSession?.transcript && Array.isArray(updatedSession.transcript) && updatedSession.transcript.length > 0) {
              console.log('🔍 FEEDBACK DEBUG: Transcript now available after waiting');
            } else {
              console.log('🔍 FEEDBACK DEBUG: Transcript still not available after waiting');
            }
          }

          setLoading(false);
          setGenerating(true);
          setProgressMessage("Starting feedback generation...");

          // Trigger feedback generation
          console.log('🔍 FEEDBACK DEBUG: Calling generate-roleplay-feedback function');
          supabase.functions.invoke('generate-roleplay-feedback', {
            body: { sessionId }
          }).then(result => {
            console.log('🔍 FEEDBACK DEBUG: Generation function result:', result);
            if (result.error) {
              console.error('🔍 FEEDBACK DEBUG: Generation function error:', result.error);

              // Parse error response for better messaging
              let errorMessage = "Failed to generate feedback. Please try again.";
              let suggestion = "Try the 'Retry Transcript Retrieval' button or refresh the page.";

              try {
                const errorData = typeof result.error === 'object' ? result.error : JSON.parse(result.error.message || '{}');
                if (errorData.message) {
                  errorMessage = errorData.message;
                }
                if (errorData.suggestion) {
                  suggestion = errorData.suggestion;
                }
              } catch (e) {
                // Use default messages if parsing fails
                if (result.error.message?.includes('Transcript not ready') || result.error.message?.includes('No transcript available')) {
                  errorMessage = "The conversation transcript is not available.";
                  suggestion = "Click 'Retry Transcript Retrieval' to fetch the recording, or try starting a new session.";
                }
              }

              toast({
                title: "Feedback Not Ready",
                description: `${errorMessage} ${suggestion}`,
                variant: "destructive",
                duration: 8000
              });
              setGenerating(false);
              setTimeoutReached(true);
            }
          }).catch(error => {
            console.error('🔍 FEEDBACK DEBUG: Generation function call failed:', error);
            toast({
              title: "Error", 
              description: "Failed to start feedback generation. Please refresh and try again.",
              variant: "destructive",
            });
            setGenerating(false);
            setTimeoutReached(true);
          });
          
          // Progress message updates
          const progressTimer = setInterval(() => {
            setElapsedTime(prev => {
              const newTime = prev + 1;
              if (newTime <= 15) {
                setProgressMessage("Analyzing conversation...");
              } else if (newTime <= 30) {
                setProgressMessage("Generating detailed feedback...");
              } else if (newTime <= 45) {
                setProgressMessage("Finalizing insights...");
              } else {
                setProgressMessage("Almost ready...");
              }
              return newTime;
            });
          }, 1000);
          
          // Set up 45-second timeout (reduced from 60)
          timeoutId = setTimeout(() => {
            console.log('🔍 FEEDBACK DEBUG: Timeout reached after 45 seconds');
            clearInterval(progressTimer);
            setTimeoutReached(true);
            setGenerating(false);
            toast({
              title: "Feedback Generation Taking Longer Than Expected",
              description: "The conversation may not have been recorded properly. Try refreshing or starting a new roleplay session.",
              variant: "default",
            });
          }, 45000);

          // Set up real-time subscription for feedback generation
          console.log('🔍 FEEDBACK DEBUG: Setting up real-time subscription');
          channel = supabase
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
                console.log('🔍 FEEDBACK DEBUG: Real-time update received:', payload);
                // Type conversion for compatibility
                const feedbackData: FeedbackData = {
                  ...payload.new as any,
                  conversation_flow_summary: Array.isArray(payload.new.conversation_flow_summary) 
                    ? payload.new.conversation_flow_summary 
                    : payload.new.conversation_flow_summary 
                      ? (typeof payload.new.conversation_flow_summary === 'string' 
                         ? JSON.parse(payload.new.conversation_flow_summary) 
                         : payload.new.conversation_flow_summary)
                      : undefined
                };
                setFeedback(feedbackData);
                setGenerating(false);
                setTimeoutReached(false);
                if (timeoutId) clearTimeout(timeoutId);
              }
            )
            .subscribe((status) => {
              console.log('🔍 FEEDBACK DEBUG: Subscription status:', status);
              if (status === 'SUBSCRIBED') {
                console.log('🔍 FEEDBACK DEBUG: Successfully subscribed to real-time updates');
              }
            });

          // Add fallback polling mechanism
          const pollInterval = setInterval(async () => {
            console.log('🔍 FEEDBACK DEBUG: Polling for feedback...');
            try {
              const { data, error } = await supabase
                .from('roleplay_feedback')
                .select('*')
                .eq('session_id', sessionId)
                .maybeSingle();

              if (data && !feedback) {
                console.log('🔍 FEEDBACK DEBUG: Polling found feedback!');
                setFeedback(data as FeedbackData);
                setGenerating(false);
                setTimeoutReached(false);
                if (timeoutId) clearTimeout(timeoutId);
                clearInterval(pollInterval);
              }
            } catch (error) {
              console.error('🔍 FEEDBACK DEBUG: Polling error:', error);
            }
          }, 2000); // Poll every 2 seconds (reduced from 3)

          // Store poll interval for cleanup
          const pollIntervalRef = pollInterval;
          
          // Update timeout to also clear polling (reduced to 45 seconds)
          timeoutId = setTimeout(() => {
            console.log('🔍 FEEDBACK DEBUG: Timeout reached after 45 seconds');
            clearInterval(pollIntervalRef);
            clearInterval(progressTimer);
            setTimeoutReached(true);
            setGenerating(false);
            toast({
              title: "Feedback Generation Taking Longer Than Expected", 
              description: "The conversation may not have been recorded properly. Try refreshing or starting a new roleplay session.",
              variant: "default",
            });
          }, 45000);

          console.log('🔍 FEEDBACK DEBUG: Real-time subscription and polling established');
        }
      } catch (error) {
        console.error('🔍 FEEDBACK DEBUG: Fetch error:', error);
        setLoading(false);
        setGenerating(false);
        toast({
          title: "Error",
          description: "Failed to load feedback. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchFeedback();

    // Cleanup function
    return () => {
      console.log('🔍 FEEDBACK DEBUG: Cleaning up - removing channel and timeout');
      if (timeoutId) clearTimeout(timeoutId);
      if (channel) supabase.removeChannel(channel);
    };
  }, [sessionId, navigate]);

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
        <Helmet>
          <title>Roleplay Feedback - Loading</title>
          <meta name="description" content="Generating your AI roleplay feedback." />
          <link rel="canonical" href={`${window.location.origin}/roleplay/feedback/${sessionId || ''}`} />
        </Helmet>
        <SkeletonLoader type="card" />
      </div>
    );
  }

  if (generating) {
    const progressPercentage = Math.min((elapsedTime / estimatedTime) * 100, 95);
    
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Helmet>
          <title>Roleplay Feedback - Generating</title>
          <meta name="description" content="Our AI is analyzing your conversation to prepare feedback." />
          <link rel="canonical" href={`${window.location.origin}/roleplay/feedback/${sessionId || ''}`} />
        </Helmet>
        <div className="text-center py-12 max-w-md mx-auto">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-semibold mb-2">Generating Your Feedback</h2>
          <p className="text-muted-foreground mb-4">{progressMessage}</p>
          
          <div className="space-y-3">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{Math.floor(elapsedTime)}s elapsed</span>
              <span>~{estimatedTime}s estimated</span>
            </div>
          </div>
          
          <p className="text-micro text-muted-foreground mt-4">
            Our AI is providing comprehensive analysis of your roleplay performance
          </p>
        </div>
      </div>
    );
  }

  const handleCheckAgain = async () => {
    setTimeoutReached(false);
    setGenerating(true);
    setElapsedTime(0);
    setProgressMessage("Checking for feedback...");

    try {
      const { data, error } = await supabase
        .from('roleplay_feedback')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (data) {
        setFeedback(data as FeedbackData);
        setGenerating(false);
        toast({
          title: "Feedback Found!",
          description: "Your feedback has been successfully loaded.",
          variant: "default",
        });
      } else {
        // Restart the generation process
        setTimeout(() => {
          setTimeoutReached(true);
          setGenerating(false);
        }, 15000); // Give it 15 more seconds
      }
    } catch (error) {
      setGenerating(false);
      setTimeoutReached(true);
      toast({
        title: "Error",
        description: "Failed to check for feedback. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  };

  const handleRetryTranscript = async () => {
    setTimeoutReached(false);
    setGenerating(true);
    setElapsedTime(0);
    setProgressMessage("Retrieving conversation transcript...");

    try {
      console.log('🔄 Manually retrying transcript retrieval for session:', sessionId);

      const { data, error } = await supabase.functions.invoke('retry-transcript-retrieval', {
        body: { sessionId }
      });

      if (error) {
        console.error('Transcript retrieval error:', error);
        throw error;
      }

      console.log('✅ Transcript retrieval response:', data);

      toast({
        title: "Transcript Retrieved!",
        description: "Generating your feedback now. This may take up to 60 seconds.",
      });

      setProgressMessage("Generating detailed feedback...");

      // Wait for feedback to be generated (with polling)
      let attempts = 0;
      const maxAttempts = 30; // 60 seconds total (2s intervals)

      const pollForFeedback = setInterval(async () => {
        attempts++;

        const { data: feedbackData } = await supabase
          .from('roleplay_feedback')
          .select('*')
          .eq('session_id', sessionId)
          .maybeSingle();

        if (feedbackData) {
          clearInterval(pollForFeedback);
          setFeedback(feedbackData as FeedbackData);
          setGenerating(false);
          toast({
            title: "Feedback Ready!",
            description: "Your performance analysis is now available.",
          });
        } else if (attempts >= maxAttempts) {
          clearInterval(pollForFeedback);
          setTimeoutReached(true);
          setGenerating(false);
          toast({
            title: "Still Processing",
            description: "Feedback generation is taking longer than expected. Try refreshing in a moment.",
          });
        }
      }, 2000);

    } catch (error: any) {
      console.error('Failed to retry transcript:', error);
      setGenerating(false);
      setTimeoutReached(true);

      toast({
        title: "Transcript Retrieval Failed",
        description: error.message || "Unable to retrieve the conversation transcript. The recording may not be available.",
        variant: "destructive",
      });
    }
  };

  if (timeoutReached) {
    return (
        <div className="container mx-auto p-6 space-y-6">
          <Helmet>
            <title>Roleplay Feedback - Processing</title>
            <meta name="description" content="The AI is still preparing your detailed feedback. Please check again shortly." />
            <link rel="canonical" href={`${window.location.origin}/roleplay/feedback/${sessionId || ''}`} />
          </Helmet>
        <div className="text-center py-12 max-w-md mx-auto">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Feedback Not Available</h2>
          <p className="text-muted-foreground mb-6">
            The conversation transcript may not have been recorded properly. This can happen if the connection was interrupted during the roleplay session.
          </p>
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <Button onClick={handleRetryTranscript} className="gap-2 bg-primary">
              <RefreshCw className="h-4 w-4" />
              Retry Transcript Retrieval
            </Button>
            <Button onClick={handleCheckAgain} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Check Again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </Button>
            <Button variant="ghost" onClick={() => navigate('/roleplay')}>
              <ArrowLeft className="h-4 w-4" />
              Back to Roleplay
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
       <div className="container mx-auto p-6 space-y-6">
         <Helmet>
           <title>Roleplay Feedback - Not Available</title>
           <meta name="description" content="Feedback for this session is not yet available." />
           <link rel="canonical" href={`${window.location.origin}/roleplay/feedback/${sessionId || ''}`} />
         </Helmet>
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
    { name: 'Engage in Small Talk', score: feedback.small_talk_score || 0, key: 'smallTalk' },
    { name: 'Active Listening', score: feedback.active_listening_score, key: 'activeListening' },
    { name: 'Identify Pain Points', score: feedback.pain_point_identification_score || 0, key: 'painPointIdentification' },
    { name: 'Product Knowledge', score: feedback.product_knowledge_score, key: 'productKnowledge' },
    { name: 'Objection Handling', score: feedback.objection_handling_score, key: 'objectionHandling' },
    { name: 'Communication', score: feedback.communication_score, key: 'communication' },
  ];

  const toggleRubricExpansion = (key: string) => {
    setExpandedRubric(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="container mx-auto px-1 sm:px-4 md:px-6 py-2 sm:py-6 space-y-3 sm:space-y-6">
      <Helmet>
        <title>Roleplay Feedback - FINternship</title>
        <meta name="description" content="Detailed performance analysis, rubric scores, and coaching insights from your AI roleplay session." />
        <link rel="canonical" href={`${window.location.origin}/roleplay/feedback/${sessionId || ''}`} />
      </Helmet>
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

      {/* Conversation Transcript - Full Width */}
      <ConversationTranscript sessionId={sessionId!} />

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
              {coreScores.map((item, index) => {
                const rubricData = feedback.detailed_rubric_feedback?.[item.key];
                const isExpanded = expandedRubric[item.key];
                
                return (
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
                    
                    {item.score === 0 && !rubricData && (
                      <p className="text-sm text-muted-foreground">
                        This competency was not demonstrated during the conversation.
                      </p>
                    )}
                    
                    {rubricData && (
                      <div className="mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRubricExpansion(item.key)}
                          className="h-auto p-1 text-micro text-muted-foreground hover:text-foreground"
                        >
                          {isExpanded ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                          {isExpanded ? 'Hide' : 'Show'} in-depth insights
                        </Button>
                        
                        {isExpanded && (
                          <div className="mt-2 p-3 bg-muted/50 rounded-lg space-y-2">
                            <p className="text-sm">{rubricData.explanation}</p>
                            {rubricData.insights && (
                              <div className="text-sm">
                                <span className="font-medium">Improvement suggestions:</span>
                                <p className="mt-1 text-muted-foreground">{rubricData.insights}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
              {feedback.practice_score && (
                <div>
                  <h3 className="font-semibold mb-2">Practice Score</h3>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {feedback.practice_score}/3
                  </Badge>
                </div>
              )}

              {feedback.strengths && feedback.strengths.length > 0 && (
                <div>
                  <h3 className="font-semibold text-green-600 mb-2">Strength</h3>
                  <div className="space-y-2">
                    {feedback.strengths.map((strength, index) => (
                      <p key={index} className="text-sm leading-relaxed">{strength}</p>
                    ))}
                  </div>
                </div>
              )}

              {feedback.improvement_areas && feedback.improvement_areas.length > 0 && (
                <div>
                  <h3 className="font-semibold text-orange-600 mb-2">Growth Area</h3>
                  <div className="space-y-3">
                    {feedback.improvement_areas.map((area, index) => (
                      <div key={index} className="text-sm">
                        <p className="leading-relaxed">{area}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {feedback.specific_feedback && (
                <div>
                  <h3 className="font-semibold mb-2">Detailed Feedback</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feedback.specific_feedback}</p>
                </div>
              )}

              {feedback.coaching_points && feedback.coaching_points.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Coaching Points</h3>
                  <div className="space-y-1">
                    {feedback.coaching_points.map((point, index) => (
                      <p key={index} className="text-sm text-muted-foreground">{point}</p>
                    ))}
                  </div>
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
          {(feedback.tone_analysis && feedback.tone_analysis.length > 0) || feedback.tone_detailed_analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {feedback.tone_analysis && feedback.tone_analysis.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {feedback.tone_analysis.map((tone, index) => (
                      <Badge key={index} variant="outline" className="text-micro">
                        {tone}
                      </Badge>
                    ))}
                  </div>
                )}
                {feedback.tone_detailed_analysis && (
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {feedback.tone_detailed_analysis.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-2">{paragraph}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Visual Presence */}
          {(feedback.visual_presence_analysis && feedback.visual_presence_analysis.length > 0) || feedback.body_language_analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Visual Presence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {feedback.visual_presence_analysis && feedback.visual_presence_analysis.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {feedback.visual_presence_analysis.map((presence, index) => (
                      <Badge key={index} variant="outline" className="text-micro">
                        {presence}
                      </Badge>
                    ))}
                  </div>
                )}
                {feedback.body_language_analysis && (
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {feedback.body_language_analysis.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-2">{paragraph}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          {(feedback.conversation_summary || (feedback.conversation_flow_summary && feedback.conversation_flow_summary.length > 0)) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {feedback.conversation_flow_summary && feedback.conversation_flow_summary.length > 0 ? (
                  <div className="space-y-1">
                    {feedback.conversation_flow_summary.map((item, index) => (
                      <p key={index} className="text-sm text-muted-foreground">{item}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{feedback.conversation_summary}</p>
                )}
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
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {feedback.pronunciation_feedback.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-2">{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleplayFeedback;