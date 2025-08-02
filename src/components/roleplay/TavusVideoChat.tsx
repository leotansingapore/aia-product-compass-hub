import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  AlertTriangle,
  Subtitles,
  X
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
  const [transcripts, setTranscripts] = useState<Array<{speaker: string, text: string, timestamp: number}>>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showTranscripts, setShowTranscripts] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Subscribe to real-time transcript updates
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel('conversation-transcripts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_transcripts',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('New transcript received:', payload);
          const newTranscript = payload.new as any;
          setTranscripts(prev => [...prev, {
            speaker: newTranscript.speaker,
            text: newTranscript.text,
            timestamp: newTranscript.timestamp_offset || Date.now()
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

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
        conversation_name: `${scenario.title} - Roleplay Session`
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
      
      // Create roleplay session record for transcript tracking
      const { data: sessionData, error: sessionError } = await supabase.rpc('create_roleplay_session', {
        scenario_title: scenario.title,
        scenario_category: scenario.category,
        scenario_difficulty: scenario.difficulty,
        tavus_conversation_id: data.conversation_id
      });

      if (sessionError) {
        console.error('Failed to create session record:', sessionError);
      } else {
        setSessionId(sessionData);
        console.log('Session record created with ID:', sessionData);
      }
      
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

      // Now the conversation will be embedded in the iframe instead of opening in a new window
      // The iframe will be displayed in the AI Avatar section
      
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

    // Update session record with end time
    if (sessionId) {
      try {
        await supabase.rpc('update_roleplay_session', {
          session_id: sessionId,
          end_time: new Date().toISOString(),
          duration: sessionDuration
        });
      } catch (error) {
        console.error('Failed to update session record:', error);
      }
    }

    setIsConnected(false);
    setIsRecording(false);
    stopTimer();
    setConversationId(null);
    setConversationUrl(null);
    setSessionId(null);
    setTranscripts([]);
    
    // Stop camera stream
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    toast({
      title: "Session Ended",
      description: "Your roleplay session has been completed.",
    });
  };

  const handleRestart = () => {
    handleEndSession();
    setSessionDuration(0);
    // Automatically restart after a brief delay
    setTimeout(() => {
      handleStartSession();
    }, 1000);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Microphone On" : "Microphone Off",
      description: "Control your microphone in the video chat window.",
    });
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    toast({
      title: isVideoOn ? "Camera Off" : "Camera On",
      description: "Control your camera in the video chat window.",
    });
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    toast({
      title: isSpeakerOn ? "Speaker Off" : "Speaker On",
      description: "Control audio output in the video chat window.",
    });
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

      {/* Main Video Area - AI Trainer */}
      <div className="absolute inset-0">
        {conversationUrl ? (
          <iframe
            src={conversationUrl}
            className="w-full h-full border-0"
            allow="camera *; microphone *; autoplay *; encrypted-media *; fullscreen *; display-capture *; clipboard-write *"
            title="Tavus AI Conversation"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-presentation allow-top-navigation allow-downloads"
            onLoad={() => {
              console.log('Tavus iframe loaded successfully');
              toast({
                title: "Connected",
                description: "Video session is now active"
              });
            }}
            onError={(e) => {
              console.error('Tavus iframe error:', e);
              toast({
                title: "Connection Issue", 
                description: "Retrying connection...",
                variant: "destructive"
              });
            }}
            style={{ backgroundColor: '#000' }}
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p>Initializing AI trainer session...</p>
              <p className="text-sm text-gray-400 mt-2">Please wait while we connect you...</p>
            </div>
          </div>
        )}
      </div>

      {/* Live Transcript Overlay */}
      {showTranscripts && transcripts.length > 0 && (
        <div className="absolute bottom-24 right-6 z-20 w-80 max-h-60 bg-black/80 backdrop-blur-sm rounded-lg p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Subtitles className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-medium">Live Transcript</span>
            </div>
            <Button
              onClick={() => setShowTranscripts(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white/60 hover:text-white"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-2 overflow-y-auto max-h-36 scrollbar-thin scrollbar-thumb-white/20">
            {transcripts.slice(-6).map((transcript, index) => (
              <div key={index} className="text-sm">
                <span className={`font-medium ${
                  transcript.speaker === 'user' ? 'text-blue-300' : 'text-green-300'
                }`}>
                  {transcript.speaker === 'user' ? 'You' : 'AI Trainer'}:
                </span>
                <span className="text-white/90 ml-2">
                  {transcript.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transcript Toggle Button */}
      {!showTranscripts && transcripts.length > 0 && (
        <div className="absolute bottom-24 right-6 z-20">
          <Button
            onClick={() => setShowTranscripts(true)}
            variant="secondary"
            size="sm"
            className="rounded-full bg-black/70 backdrop-blur-sm text-white border-white/20"
          >
            <Subtitles className="h-4 w-4" />
          </Button>
        </div>
      )}

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