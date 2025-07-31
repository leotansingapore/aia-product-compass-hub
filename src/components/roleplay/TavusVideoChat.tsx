import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  RotateCcw
} from 'lucide-react';

interface RoleplayScenario {
  id: string;
  title: string;
  description: string;
  category: 'sales' | 'objection' | 'consultation' | 'exam-prep';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  objectives: string[];
}

interface TavusVideoChatProps {
  scenario: RoleplayScenario;
}

export function TavusVideoChat({ scenario }: TavusVideoChatProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = async () => {
    setIsLoading(true);
    setConnectionError(null);
    
    try {
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // TODO: Initialize Tavus SDK here
      // This would involve creating a Tavus session with the scenario context
      
      setIsConnected(true);
      setIsRecording(true);
      startTimer();
      
    } catch (error) {
      console.error('Error starting session:', error);
      setConnectionError('Failed to access camera or microphone. Please check your permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = () => {
    setIsConnected(false);
    setIsRecording(false);
    stopTimer();
    
    // Stop camera stream
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    // TODO: End Tavus session
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
    // TODO: Implement actual mute functionality with Tavus
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // TODO: Implement actual video toggle with Tavus
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // TODO: Implement actual speaker toggle
  };

  return (
    <div className="space-y-6">
      {/* Session Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {scenario.title}
              </CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{scenario.category}</Badge>
                <Badge variant="outline">{scenario.difficulty}</Badge>
                {isConnected && (
                  <Badge variant="default">
                    {formatDuration(sessionDuration)}
                  </Badge>
                )}
              </div>
            </div>
            {isConnected && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Live Session</span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Video Interface */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* AI Avatar Video */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Trainer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              {!isConnected ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Click "Start Session" to begin</p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <MessageCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-muted-foreground">AI Avatar would appear here</p>
                  <p className="text-xs text-muted-foreground">
                    Tavus integration required for video display
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Your Video */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Video</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
              />
              {!isVideoEnabled && (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoOff className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {connectionError && (
        <Alert variant="destructive">
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}

      {/* Control Panel */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4">
            {!isConnected ? (
              <Button 
                onClick={handleStartSession} 
                disabled={isLoading}
                size="lg"
                className="px-8"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Session
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  onClick={isRecording ? handleEndSession : handleStartSession}
                  size="lg"
                >
                  {isRecording ? (
                    <>
                      <Square className="h-4 w-4 mr-2" />
                      End Session
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleRestart}
                  size="lg"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restart
                </Button>

                <div className="flex items-center gap-2 border-l pl-4">
                  <Button
                    variant={isMuted ? "destructive" : "outline"}
                    size="sm"
                    onClick={toggleMute}
                  >
                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>

                  <Button
                    variant={!isVideoEnabled ? "destructive" : "outline"}
                    size="sm"
                    onClick={toggleVideo}
                  >
                    {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>

                  <Button
                    variant={!isSpeakerOn ? "destructive" : "outline"}
                    size="sm"
                    onClick={toggleSpeaker}
                  >
                    {isSpeakerOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {scenario.objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Integration Notice */}
      <Alert>
        <MessageCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Tavus Integration Required:</strong> To enable AI video avatars, you'll need to integrate the Tavus SDK. 
          This component provides the UI framework and will connect to Tavus once configured.
        </AlertDescription>
      </Alert>
    </div>
  );
}