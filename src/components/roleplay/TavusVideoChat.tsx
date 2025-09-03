import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
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
  X,
  RefreshCw,
  Settings,
  HelpCircle,
  Camera,
  CameraOff,
  VolumeOff
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
  const [permissionStatus, setPermissionStatus] = useState<{
    camera: 'granted' | 'denied' | 'prompt' | 'checking';
    microphone: 'granted' | 'denied' | 'prompt' | 'checking';
  }>({ camera: 'checking', microphone: 'checking' });
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Check permissions on component mount
  useEffect(() => {
    checkPermissions();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const checkPermissions = async () => {
    try {
      setPermissionStatus({ camera: 'checking', microphone: 'checking' });
      
      // Simple permission check by trying to get media
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setPermissionStatus({ camera: 'granted', microphone: 'granted' });
      
      // Stop the stream immediately as this is just a permission check
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Permission check error:', error);
      const errorName = (error as any)?.name;
      
      if (errorName === 'NotAllowedError') {
        setPermissionStatus({ camera: 'denied', microphone: 'denied' });
        setShowPermissionHelp(true);
      } else if (errorName === 'NotFoundError') {
        setPermissionStatus({ camera: 'denied', microphone: 'denied' });
      } else {
        setPermissionStatus({ camera: 'prompt', microphone: 'prompt' });
      }
    }
  };

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
      setIsLoading(true);
      setConnectionError(null);

      // Create session in our database first
      const { data: sessionData, error: sessionError } = await supabase.rpc(
        'create_roleplay_session',
        {
          scenario_title: scenario.title,
          scenario_category: scenario.category,
          scenario_difficulty: scenario.difficulty,
          tavus_conversation_id: '' // Will be updated after Tavus call
        }
      );

      if (sessionError) {
        throw new Error(`Failed to create session: ${sessionError.message}`);
      }

      setSessionId(sessionData);

      // Use the specific replica and persona IDs from the scenario
      const replicaToUse = scenario.replicaId;
      const personaToUse = scenario.personaId;
      
      console.log('Using specific replica and persona:', { replicaToUse, personaToUse });

      // Create the Tavus conversation with recording enabled
      const requestBody = {
        action: 'create_conversation',
        replica_id: replicaToUse,
        persona_id: personaToUse,
        conversation_name: `${scenario.title} - ${new Date().toLocaleString()}`,
        enable_recording: true
      };

      console.log('Creating Tavus conversation with:', requestBody);

      const { data: conversationData, error: conversationError } = await supabase.functions.invoke('tavus-session', {
        body: requestBody
      });

      if (conversationError) {
        console.error('Failed to create Tavus conversation:', conversationError);
        setConnectionError(`Failed to create conversation: ${conversationError.message || 'Unknown error'}`);
        setIsLoading(false);
        return;
      }

      if (!conversationData) {
        setConnectionError('No conversation data received from Tavus');
        setIsLoading(false);
        return;
      }

      console.log('Full Tavus conversation response:', conversationData);

      // Normalize conversation URL - try multiple possible field names
      const conversationUrl = conversationData.conversation_url || 
                             conversationData.web_url || 
                             conversationData.room_url || 
                             conversationData.url;

      if (!conversationUrl) {
        console.error('No conversation URL found in response. Available fields:', Object.keys(conversationData));
        setConnectionError('No conversation URL received from Tavus. Please check your configuration.');
        setIsLoading(false);
        return;
      }

      setConversationId(conversationData.conversation_id);
      setConversationUrl(conversationUrl);

      // Update the session with the Tavus conversation ID and recording status
      const { error: updateError } = await supabase
        .from('roleplay_sessions')
        .update({ 
          tavus_conversation_id: conversationData.conversation_id,
          recording_status: 'recording',
          recording_started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionData);

      if (updateError) {
        console.error('Failed to update session with conversation ID:', updateError);
      }

      return conversationData;
    } catch (error: any) {
      setConnectionError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = async () => {
    setIsLoading(true);
    setConnectionError(null);
    setShowPermissionHelp(false);
    
    try {
      // Request media permissions first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });

      // Update permission status to granted
      setPermissionStatus({ camera: 'granted', microphone: 'granted' });

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
      const errorName = (error as any)?.name;
      
      // Handle specific permission errors
      if (errorName === 'NotAllowedError') {
        setPermissionStatus({ camera: 'denied', microphone: 'denied' });
        setShowPermissionHelp(true);
        setConnectionError(
          'Camera and microphone access denied. Please allow permissions in your browser and try again.'
        );
        
        toast({
          title: "Permissions Required",
          description: "Please enable camera and microphone access to start the roleplay session.",
          variant: "destructive"
        });
      } else if (errorName === 'NotFoundError') {
        setConnectionError('No camera or microphone found. Please connect your devices and try again.');
        toast({
          title: "Hardware Not Found",
          description: "Please connect a camera and microphone to continue.",
          variant: "destructive"
        });
      } else {
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
      }
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
        await supabase.rpc('update_roleplay_session' as any, {
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
      description: "Redirecting to your feedback results...",
    });

    // Redirect to feedback page using React Router
    if (sessionId) {
      navigate(`/roleplay/feedback/${sessionId}`);
    } else {
      console.error('No session ID available for feedback redirect');
      toast({
        title: "Navigation Error",
        description: "Unable to load feedback. Session ID not found.",
        variant: "destructive",
      });
      navigate('/roleplay');
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

        {/* Permission Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Camera & Microphone Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Camera className="h-4 w-4" />
                  <span>Camera Access</span>
                </div>
                <div className="flex items-center gap-2">
                  {permissionStatus.camera === 'checking' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  )}
                  <Badge variant={permissionStatus.camera === 'granted' ? 'default' : 
                                 permissionStatus.camera === 'denied' ? 'destructive' : 'secondary'}>
                    {permissionStatus.camera === 'granted' ? 'Allowed' :
                     permissionStatus.camera === 'denied' ? 'Denied' :
                     permissionStatus.camera === 'checking' ? 'Checking...' : 'Prompt'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mic className="h-4 w-4" />
                  <span>Microphone Access</span>
                </div>
                <div className="flex items-center gap-2">
                  {permissionStatus.microphone === 'checking' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  )}
                  <Badge variant={permissionStatus.microphone === 'granted' ? 'default' : 
                                 permissionStatus.microphone === 'denied' ? 'destructive' : 'secondary'}>
                    {permissionStatus.microphone === 'granted' ? 'Allowed' :
                     permissionStatus.microphone === 'denied' ? 'Denied' :
                     permissionStatus.microphone === 'checking' ? 'Checking...' : 'Prompt'}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={checkPermissions}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-3 w-3" />
                  Check Permissions
                </Button>
                
                {(permissionStatus.camera === 'denied' || permissionStatus.microphone === 'denied') && (
                  <Button
                    onClick={() => setShowPermissionHelp(!showPermissionHelp)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <HelpCircle className="h-3 w-3" />
                    Need Help?
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permission Help */}
        {showPermissionHelp && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                How to Enable Camera & Microphone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Chrome Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Click the camera/microphone icon in your address bar</li>
                    <li>Select "Always allow" for this site</li>
                    <li>Refresh the page or click "Check Permissions" above</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Alternative Method:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Go to Chrome Settings → Privacy and Security → Site Settings</li>
                    <li>Click "Camera" and "Microphone"</li>
                    <li>Remove this site from the "Blocked" list</li>
                    <li>Add this site to the "Allowed" list</li>
                  </ol>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Camera and microphone access is required for the AI roleplay session to work properly.
                    The video chat needs both permissions to function.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        )}

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
            <Button 
              onClick={() => setConnectionError(null)} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Retry
            </Button>
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
          <>
            <iframe
              src={conversationUrl}
              className="w-full h-full border-0"
              allow="camera *; microphone *; autoplay *; encrypted-media *; fullscreen *; display-capture *; clipboard-write *"
              title="Tavus AI Conversation"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-presentation allow-top-navigation allow-downloads"
              onLoad={() => {
                console.log('Tavus iframe loaded successfully with URL:', conversationUrl);
                toast({
                  title: "Connected",
                  description: "Video session is now active"
                });
              }}
              onError={(e) => {
                console.error('Tavus iframe error:', e);
                console.error('Failed URL:', conversationUrl);
                toast({
                  title: "Connection Issue", 
                  description: "Failed to load video session. Please try again.",
                  variant: "destructive"
                });
              }}
              style={{ backgroundColor: '#000' }}
              referrerPolicy="no-referrer-when-downgrade"
            />
            {/* Debug info overlay */}
            <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs p-2 rounded">
              ID: {conversationId}<br/>
              URL: {conversationUrl}
            </div>
          </>
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