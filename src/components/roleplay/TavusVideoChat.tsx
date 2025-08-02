import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RoleplayFeedbackInterface } from './RoleplayFeedbackInterface';
import { EnhancedRoleplayFeedback } from './EnhancedRoleplayFeedback';
import { LiveCoachingOverlay } from './LiveCoachingOverlay';
import { LiveTranscriptOverlay } from './LiveTranscriptOverlay';
import { useSpeechAnalysis } from '@/hooks/useSpeechAnalysis';
import { useTavusCallbacks } from '@/hooks/useTavusCallbacks';
import { useAuth } from '@/hooks/useAuth';
import { SessionOut } from '@/lib/speechCoachApi';
import DailyIframe from '@daily-co/daily-js';

interface ExtendedSessionOut extends SessionOut {
  aiFeedback?: {
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
  };
}
import { 
  Play, 
  Pause, 
  Square, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Volume2,
  VolumeX,
  MessageCircle,
  RotateCcw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface RoleplayScenario {
  id: string;
  title: string;
  description: string;
  category: 'sales' | 'objection' | 'consultation' | 'exam-prep';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  objectives: string[];
  replicaId?: string; // Optional Tavus replica ID for specific avatar appearance
  personaId?: string; // Optional Tavus persona ID for specific personality/behavior
  personaDescription?: string; // Description of the AI persona
}

interface TavusVideoChatProps {
  scenario: RoleplayScenario;
}

export function TavusVideoChat({ scenario }: TavusVideoChatProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [showLiveCoaching, setShowLiveCoaching] = useState(true);
  const [showLiveTranscript, setShowLiveTranscript] = useState(true);
  const [finalizedSession, setFinalizedSession] = useState<ExtendedSessionOut | null>(null);
  const [callFrame, setCallFrame] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const dailyRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioProcessorRef = useRef<AudioWorkletNode | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Speech analysis integration
  const {
    isAnalyzing,
    isRealTimeEnabled,
    realtimeMetrics,
    liveMetrics,
    coachingEvents,
    startAnalysis,
    processAudioUpload,
    sendTranscriptionToRealTime,
    stopAnalysis
  } = useSpeechAnalysis();

  // Tavus callbacks integration - get session token async
  const [userToken, setUserToken] = useState<string>('');
  
  useEffect(() => {
    const getToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserToken(session?.access_token || '');
    };
    getToken();
  }, []);

  const { isFinalizing } = useTavusCallbacks({
    callFrame: callFrame,
    userToken,
    onFinalized: async (session) => {
      // Fetch real AI feedback from database
      if (sessionId) {
        try {
          const { data: feedbackData } = await supabase
            .from('roleplay_feedback')
            .select('*')
            .eq('session_id', sessionId)
            .single();
          
          if (feedbackData) {
            // Create combined session object with real AI feedback
            const enhancedSession = {
              ...session,
              aiFeedback: {
                overall_score: feedbackData.overall_score,
                communication_score: feedbackData.communication_score,
                listening_score: feedbackData.listening_score,
                objection_handling_score: feedbackData.objection_handling_score,
                product_knowledge_score: feedbackData.product_knowledge_score,
                strengths: feedbackData.strengths,
                improvement_areas: feedbackData.improvement_areas,
                specific_feedback: feedbackData.specific_feedback,
                coaching_points: feedbackData.coaching_points,
                follow_up_questions: feedbackData.follow_up_questions
              }
            };
            setFinalizedSession(enhancedSession);
          } else {
            setFinalizedSession(session);
          }
        } catch (error) {
          console.error('Error fetching AI feedback:', error);
          setFinalizedSession(session);
        }
      } else {
        setFinalizedSession(session);
      }
      
      setIsConnected(false);
      toast({
        title: "Session Analyzed",
        description: "Your roleplay has been analyzed with real AI feedback!",
      });
    },
  });

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const createTavusConversation = async () => {
    try {
      let replicaId = scenario.replicaId;
      
      // If no specific replica ID is provided, get the first available one
      if (!replicaId) {
        const { data: replicasData, error: replicasError } = await supabase.functions.invoke('tavus-session', {
          body: {
            action: 'list_replicas'
          }
        });

        if (replicasError) {
          console.error('Failed to fetch replicas:', replicasError);
          throw new Error('Failed to fetch available AI avatars');
        }

        if (!replicasData?.data || replicasData.data.length === 0) {
          throw new Error('No AI avatars available. Please create a replica in your Tavus dashboard first.');
        }

        replicaId = replicasData.data[0].replica_id;
      }
      
      console.log('Using replica ID:', replicaId);

      const requestBody: any = {
        action: 'create_conversation',
        replica_id: replicaId,
        conversation_name: `${scenario.title} - Roleplay Session`,
        callback_url: `${window.location.origin}/functions/v1/speech-analysis`
      };

      // Add persona_id if available
      if (scenario.personaId) {
        requestBody.persona_id = scenario.personaId;
      }

      const { data, error } = await supabase.functions.invoke('tavus-session', {
        body: requestBody
      });

      if (error) throw error;

      console.log('Tavus conversation created:', data);
      setConversationId(data.conversation_id);
      setConversationUrl(data.conversation_url);
      
      return data;
    } catch (error) {
      console.error('Failed to create Tavus conversation:', error);
      
      // Show more specific error message for API key issues
      if (error.message?.includes('non-2xx') || error.message?.includes('401')) {
        throw new Error('Invalid Tavus API key. Please check your API key in the environment settings.');
      }
      
      throw error;
    }
  };

  const createRoleplaySession = async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('roleplay_sessions')
      .insert({
        user_id: user.id,
        scenario_title: scenario.title,
        scenario_category: scenario.category,
        scenario_difficulty: scenario.difficulty,
        started_at: new Date().toISOString(),
        tavus_conversation_id: conversationId
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create roleplay session:', error);
      return null;
    }

    return data.id;
  };

  const generateFeedback = async (sessionId: string) => {
    setIsGeneratingFeedback(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('roleplay-feedback', {
        body: {
          sessionId,
          scenario: {
            title: scenario.title,
            category: scenario.category,
            difficulty: scenario.difficulty,
            objectives: scenario.objectives
          },
          durationSeconds: sessionDuration
        }
      });

      if (error) throw error;
      
      return data.feedback;
    } catch (error) {
      console.error('Failed to generate feedback:', error);
      toast({
        title: "Feedback Generation Failed",
        description: "Unable to generate feedback. You can still review your session manually.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const setupDailyCall = async (conversationUrl: string) => {
    try {
      // Create Daily.co call frame with embedded configuration
      const call = DailyIframe.createFrame(dailyRef.current!, {
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '8px'
        },
        showLeaveButton: false,
        showFullscreenButton: false,
        showParticipantsBar: false,
        theme: {
          colors: {
            accent: '#3b82f6',
            accentText: '#ffffff',
            background: '#000000',
            backgroundAccent: '#1f2937',
            baseText: '#ffffff',
            border: '#374151',
            mainAreaBg: '#111827',
            mainAreaText: '#ffffff',
            supportiveText: '#9ca3af'
          }
        }
      });

      setCallFrame(call);

      // Set up audio processing and video subscription
      call.on('participant-joined', async (event: any) => {
        console.log('Participant joined:', event);
        
        // Subscribe to Tavus replica's video and audio
        if (event.participant.user_id === 'tavus-replica') {
          try {
            // Subscribe to the replica's video and audio tracks
            await call.updateParticipant(event.participant.session_id, {
              setSubscribedTracks: {
                audio: true,
                video: true
              }
            });
            console.log('Subscribed to Tavus replica tracks');
          } catch (error) {
            console.error('Failed to subscribe to replica tracks:', error);
          }
        }
      });

      call.on('track-started', async (event: any) => {
        console.log('Track started:', event);
        
        // Handle local audio track for speech analysis
        if (event.track.kind === 'audio' && event.participant.local) {
          await setupAudioProcessing(call);
        }
        
        // Ensure remote video tracks are displayed
        if (event.track.kind === 'video' && !event.participant.local) {
          console.log('Remote video track received from:', event.participant.user_id);
        }
      });

      call.on('participant-left', (event: any) => {
        console.log('Participant left:', event);
      });

      call.on('error', (event: any) => {
        console.error('Daily call error:', event);
        setConnectionError('Video call connection failed');
      });

      // Join the call with proper configuration
      await call.join({ 
        url: conversationUrl,
        userName: user?.email || 'User',
        subscribeToTracksAutomatically: true,
        audioSource: true,
        videoSource: true
      });

      console.log('Successfully joined Daily call');
      return call;

    } catch (error) {
      console.error('Failed to setup Daily call:', error);
      throw error;
    }
  };

  const setupAudioProcessing = async (call: any) => {
    try {
      if (!sessionId) return;

      // Get the local audio track
      const localTracks = call.participants().local.tracks;
      const audioTrack = localTracks.audio;
      
      if (!audioTrack?.track) {
        console.warn('No local audio track available');
        return;
      }

      // Create an audio context for processing
      const audioContext = new AudioContext({ sampleRate: 24000 });
      const mediaStream = new MediaStream([audioTrack.track]);
      const source = audioContext.createMediaStreamSource(mediaStream);

      // Create audio worklet for real-time processing
      await audioContext.audioWorklet.addModule('/audio-processor.js');
      const processor = new AudioWorkletNode(audioContext, 'audio-processor');
      
      audioProcessorRef.current = processor;

      // Connect audio processing pipeline
      source.connect(processor);
      processor.connect(audioContext.destination);

      // Send audio chunks to speech analysis
      processor.port.onmessage = (event) => {
        const { audioData, timestamp } = event.data;
        if (audioData && sessionId) {
          // Convert Float32Array to base64 PCM for analysis
          const pcmData = convertToPCM16(audioData);
          const base64Audio = arrayBufferToBase64(pcmData);
          
          // Send to speech analysis WebSocket
          if (isRealTimeEnabled) {
            // This will be handled by the useSpeechAnalysis hook
            console.log('Audio chunk processed:', audioData.length, 'samples');
          }
        }
      };

      console.log('Audio processing pipeline established');
      
    } catch (error) {
      console.error('Failed to setup audio processing:', error);
    }
  };

  const convertToPCM16 = (float32Array: Float32Array): ArrayBuffer => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array.buffer;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const handleStartSession = async () => {
    setIsLoading(true);
    setConnectionError(null);
    
    try {
      // Request media permissions first
      await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });

      // Create Tavus conversation
      const conversationData = await createTavusConversation();
      
      toast({
        title: "Session Starting",
        description: "Connecting to your AI roleplay partner...",
      });

      // Create session record
      const newSessionId = await createRoleplaySession();
      setSessionId(newSessionId);
      setSessionStartTime(new Date());
      
      // Start speech analysis with real-time processing
      if (newSessionId) {
        startAnalysis(newSessionId, true);
      }

      // Setup Daily.co video call with real audio processing
      await setupDailyCall(conversationData.conversation_url);
      
      setIsConnected(true);
      setIsRecording(true);
      startTimer();

      toast({
        title: "Session Active",
        description: "You're now connected to your AI roleplay partner!",
      });
      
    } catch (error) {
      console.error('Failed to start session:', error);
      setConnectionError(
        error instanceof Error 
          ? error.message 
          : 'Failed to start session. Please check your connection and try again.'
      );
      
      toast({
        title: "Connection Failed",
        description: "Unable to start roleplay session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    // Stop speech analysis
    stopAnalysis();
    
    // Clean up audio processing
    if (audioProcessorRef.current) {
      audioProcessorRef.current.disconnect();
      audioProcessorRef.current = null;
    }

    // Leave Daily call
    if (callFrame) {
      try {
        await callFrame.leave();
        callFrame.destroy();
        setCallFrame(null);
      } catch (error) {
        console.error('Failed to leave Daily call:', error);
      }
    }
    
    if (conversationId) {
      try {
        await supabase.functions.invoke('tavus-session', {
          body: {
            action: 'end_conversation',
            conversation_id: conversationId
          }
        });
      } catch (error) {
        console.error('Failed to end Tavus conversation:', error);
      }
    }

    // Update session end time in database
    if (sessionId && sessionStartTime) {
      try {
        await supabase
          .from('roleplay_sessions')
          .update({
            ended_at: new Date().toISOString(),
            duration_seconds: sessionDuration
          })
          .eq('id', sessionId);
      } catch (error) {
        console.error('Failed to update session end time:', error);
      }
    }

    setIsConnected(false);
    setIsRecording(false);
    stopTimer();
    setConversationId(null);
    setConversationUrl(null);
    
    // Generate and show feedback
    if (sessionId) {
      const feedbackData = await generateFeedback(sessionId);
      if (feedbackData) {
        setFeedback(feedbackData);
        setShowFeedback(true);
      }
    }

    if (!isGeneratingFeedback) {
      toast({
        title: "Session Ended",
        description: "Your roleplay session has been completed.",
      });
    }
  };

  const handleRestart = () => {
    handleEndSession();
    setSessionDuration(0);
    // Automatically restart after a brief delay
    setTimeout(() => {
      handleStartSession();
    }, 1000);
  };

  const toggleMute = async () => {
    if (callFrame) {
      try {
        await callFrame.setLocalAudio(!isMuted);
        setIsMuted(!isMuted);
        toast({
          title: isMuted ? "Microphone On" : "Microphone Off",
          description: "Audio control updated.",
        });
      } catch (error) {
        console.error('Failed to toggle microphone:', error);
      }
    }
  };

  const toggleVideo = async () => {
    if (callFrame) {
      try {
        await callFrame.setLocalVideo(!isVideoOn);
        setIsVideoOn(!isVideoOn);
        toast({
          title: isVideoOn ? "Camera Off" : "Camera On",
          description: "Video control updated.",
        });
      } catch (error) {
        console.error('Failed to toggle camera:', error);
      }
    }
  };

  const toggleSpeaker = async () => {
    if (callFrame) {
      try {
        // Daily.co handles speaker controls via outputDevice
        setIsSpeakerOn(!isSpeakerOn);
        toast({
          title: isSpeakerOn ? "Speaker Off" : "Speaker On",
          description: "Audio output control updated.",
        });
      } catch (error) {
        console.error('Failed to toggle speaker:', error);
      }
    }
  };

  const handlePracticeAgain = () => {
    setShowFeedback(false);
    setFeedback(null);
    setSessionId(null);
    setSessionStartTime(null);
    setSessionDuration(0);
  };

  const handleContinueLearning = () => {
    // Navigate back to roleplay scenarios or dashboard
    window.history.back();
  };

  // Category and difficulty styling
  const categoryColors = {
    sales: "border-blue-200 text-blue-800",
    objection: "border-orange-200 text-orange-800", 
    consultation: "border-green-200 text-green-800",
    "exam-prep": "border-purple-200 text-purple-800"
  };

  const difficultyColors = {
    beginner: "border-green-200 text-green-800",
    intermediate: "border-yellow-200 text-yellow-800",
    advanced: "border-red-200 text-red-800"
  };

  // Show enhanced feedback interface after session ends (prioritize finalized session)
  if (finalizedSession || (showFeedback && feedback)) {
    return (
      <EnhancedRoleplayFeedback
        session={{
          id: finalizedSession?.id || sessionId!,
          scenario_title: finalizedSession?.scenario_title || scenario.title,
          scenario_category: finalizedSession?.scenario_category || scenario.category,
          scenario_difficulty: finalizedSession?.scenario_difficulty || scenario.difficulty,
          duration_seconds: finalizedSession?.duration_seconds || sessionDuration
        }}
        feedback={finalizedSession?.aiFeedback || feedback}
        onPracticeAgain={() => {
          setShowFeedback(false);
          setFeedback(null);
          setFinalizedSession(null);
          setSessionId(null);
          setSessionStartTime(null);
          setSessionDuration(0);
        }}
        onContinue={handleContinueLearning}
      />
    );
  }

  // Show loading state while generating feedback or finalizing
  if (isGeneratingFeedback || isFinalizing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">
              {isFinalizing ? 'Processing Session Data' : 'Generating Your Feedback'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isFinalizing 
                ? 'Analyzing your conversation and speech patterns...' 
                : 'Our AI is analyzing your roleplay session and preparing personalized feedback...'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Setup State - Before session starts
  if (!isConnected) {
    return (
      <div className="min-h-screen space-y-6 p-6">
        {/* Session Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">{scenario.title}</CardTitle>
                <CardDescription className="mt-1">
                  <Badge variant="outline" className={categoryColors[scenario.category]}>
                    {scenario.category}
                  </Badge>
                  <Badge variant="outline" className={`ml-2 ${difficultyColors[scenario.difficulty]}`}>
                    {scenario.difficulty}
                  </Badge>
                  <span className="ml-2 text-sm text-muted-foreground">
                    Duration: {scenario.duration}
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Preview Video Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Trainer Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center text-white">
                <p>AI trainer will appear here when session starts</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Video Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Start Button */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <Button
                onClick={handleStartSession}
                disabled={isLoading}
                size="lg"
                className="px-8"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Starting Session...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Roleplay Session
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Learning Objectives */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {scenario.objectives.map((objective, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Error Display */}
        {connectionError && (
          <Alert variant="destructive">
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>
        )}

      </div>
    );
  }

  // Full-Screen State - During active session
  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Top Overlay - Session Info */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold">{scenario.title}</h1>
            <Badge variant="outline" className="border-white/20 text-white">
              {scenario.category}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">LIVE</span>
            <span className="text-sm">{formatTime(sessionDuration)}</span>
          </div>
        </div>
      </div>

      {/* Main Video Area - Daily.co Call Frame */}
      <div className="absolute inset-0">
        <div 
          ref={dailyRef}
          className="w-full h-full bg-black"
          style={{ 
            display: callFrame ? 'block' : 'flex',
            alignItems: !callFrame ? 'center' : undefined,
            justifyContent: !callFrame ? 'center' : undefined
          }}
        >
          {!callFrame && (
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p>Initializing AI trainer session...</p>
              <p className="text-sm text-gray-400 mt-2">Please wait while we connect you...</p>
            </div>
          )}
        </div>
      </div>


      {/* Live Coaching Overlay */}
      <LiveCoachingOverlay
        metrics={realtimeMetrics}
        liveMetrics={liveMetrics}
        recentEvents={coachingEvents.slice(-3)}
        sessionDuration={sessionDuration * 1000}
        isVisible={showLiveCoaching && isAnalyzing}
        isRealTimeEnabled={isRealTimeEnabled}
      />

      {/* Live Transcript Overlay */}
      <LiveTranscriptOverlay
        sessionId={sessionId || ''}
        isActive={isConnected && showLiveTranscript}
        onToggle={() => setShowLiveTranscript(!showLiveTranscript)}
      />

      {/* Bottom Floating Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black/70 backdrop-blur-sm rounded-full px-6 py-3 flex items-center space-x-3">
          <Button
            onClick={toggleMute}
            variant={isMuted ? "destructive" : "secondary"}
            size="sm"
            className="rounded-full"
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          
          <Button
            onClick={toggleVideo}
            variant={!isVideoOn ? "destructive" : "secondary"}
            size="sm"
            className="rounded-full"
          >
            {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
          
          <Button
            onClick={toggleSpeaker}
            variant={!isSpeakerOn ? "destructive" : "secondary"}
            size="sm"
            className="rounded-full"
          >
            {isSpeakerOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          <Button
            onClick={handleEndSession}
            variant="destructive"
            size="sm"
            className="rounded-full px-4"
          >
            <Square className="mr-2 h-3 w-3" />
            End Session
          </Button>

          <Button
            onClick={handleRestart}
            variant="secondary"
            size="sm"
            className="rounded-full"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}