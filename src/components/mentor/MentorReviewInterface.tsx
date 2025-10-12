import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Save, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConversationTranscript } from '@/components/ConversationTranscript';
import { SkeletonLoader } from '@/components/SkeletonLoader';

interface RoleplaySession {
  id: string;
  user_id: string;
  scenario_title: string;
  scenario_category: string;
  scenario_difficulty: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  video_url: string | null;
  profiles: {
    display_name: string | null;
    email: string | null;
  } | null;
  roleplay_feedback: {
    overall_score: number;
    communication_score: number;
    active_listening_score: number;
    objection_handling_score: number;
    product_knowledge_score: number;
    strengths: string[];
    improvement_areas: string[];
    specific_feedback: string;
  }[];
  mentor_reviews: {
    id: string;
    status: string;
    mentor_feedback: string | null;
    mentor_score: number | null;
    mentor_notes: any[];
  }[];
}

interface MentorAnnotation {
  id?: string;
  timestamp_seconds: number;
  annotation_type: 'praise' | 'improvement' | 'note' | 'question';
  content: string;
}

export function MentorReviewInterface() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [session, setSession] = useState<RoleplaySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mentorScore, setMentorScore] = useState([7]);
  const [mentorFeedback, setMentorFeedback] = useState('');
  const [annotations, setAnnotations] = useState<MentorAnnotation[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState('');
  const [annotationType, setAnnotationType] = useState<MentorAnnotation['annotation_type']>('note');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const { data, error } = await supabase
        .from('roleplay_sessions')
        .select(`
          *,
          profiles (display_name, email),
          roleplay_feedback (*),
          mentor_reviews (
            id, status, mentor_feedback, mentor_score, mentor_notes
          )
        `)
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      
      setSession(data as any);
      
      const review = data.mentor_reviews?.[0];
      if (review) {
        setMentorFeedback(review.mentor_feedback || '');
        setMentorScore([review.mentor_score || 7]);
        
        // Load existing annotations
        const { data: annotationsData } = await supabase
          .from('mentor_annotations')
          .select('*')
          .eq('review_id', review.id)
          .order('timestamp_seconds');
        
        if (annotationsData) {
          setAnnotations(annotationsData.map(ann => ({
            ...ann,
            annotation_type: ann.annotation_type as MentorAnnotation['annotation_type']
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      toast({
        title: "Error",
        description: "Failed to load session data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const addAnnotation = async () => {
    if (!currentAnnotation.trim() || !session?.mentor_reviews?.[0]?.id) return;
    
    const annotation: MentorAnnotation = {
      timestamp_seconds: Math.floor(currentTime),
      annotation_type: annotationType,
      content: currentAnnotation.trim()
    };

    try {
      const { data, error } = await supabase
        .from('mentor_annotations')
        .insert({
          review_id: session.mentor_reviews[0].id,
          ...annotation
        })
        .select()
        .single();

      if (error) throw error;

      setAnnotations([...annotations, { ...annotation, id: data.id }]);
      setCurrentAnnotation('');
      
      toast({
        title: "Success",
        description: "Annotation added successfully"
      });
    } catch (error) {
      console.error('Error adding annotation:', error);
      toast({
        title: "Error",
        description: "Failed to add annotation",
        variant: "destructive"
      });
    }
  };

  const saveReview = async () => {
    if (!session?.mentor_reviews?.[0]?.id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('mentor_reviews')
        .update({
          mentor_feedback: mentorFeedback,
          mentor_score: mentorScore[0],
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', session.mentor_reviews[0].id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Review saved successfully"
      });
      
      navigate('/mentor');
    } catch (error) {
      console.error('Error saving review:', error);
      toast({
        title: "Error",
        description: "Failed to save review",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <SkeletonLoader type="card" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium mb-2">Session not found</h3>
            <Button onClick={() => navigate('/mentor')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const aiFeedback = session.roleplay_feedback?.[0];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/mentor')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{session.scenario_title}</h1>
            <p className="text-muted-foreground">
              {session.profiles?.display_name} • {session.scenario_difficulty}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            {formatTime(session.duration_seconds)}
          </Badge>
          <Badge>
            {session.scenario_category}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Video & Transcript */}
        <div className="space-y-6">
          {/* Video Player */}
          {session.video_url ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Session Recording
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <video
                  ref={videoRef}
                  src={session.video_url}
                  className="w-full rounded-lg"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                />
                
                {/* Video Controls */}
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => seekTo(Math.max(0, currentTime - 10))}
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button onClick={togglePlayPause}>
                      {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => seekTo(Math.min(duration, currentTime + 10))}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  
                  <Slider
                    value={[currentTime]}
                    max={duration}
                    step={1}
                    onValueChange={(value) => seekTo(value[0])}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Video Recording</h3>
                <p className="text-muted-foreground">
                  This session doesn't have a video recording available.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Conversation Transcript */}
          <ConversationTranscript sessionId={session.id} />
        </div>

        {/* Right Column - Feedback & Review */}
        <div className="space-y-6">
          {/* AI Feedback Summary */}
          {aiFeedback && (
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Overall:</span> {aiFeedback.overall_score}/10
                  </div>
                  <div>
                    <span className="font-medium">Communication:</span> {aiFeedback.communication_score}/10
                  </div>
                  <div>
                    <span className="font-medium">Listening:</span> {aiFeedback.active_listening_score}/10
                  </div>
                  <div>
                    <span className="font-medium">Product Knowledge:</span> {aiFeedback.product_knowledge_score}/10
                  </div>
                </div>
                
                {aiFeedback.strengths?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                    <ul className="text-sm space-y-1">
                      {aiFeedback.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Mentor Review Form */}
          <Card>
            <CardHeader>
              <CardTitle>Mentor Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Overall Score: {mentorScore[0]}/10
                </label>
                <Slider
                  value={mentorScore}
                  onValueChange={setMentorScore}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Detailed Feedback
                </label>
                <Textarea
                  value={mentorFeedback}
                  onChange={(e) => setMentorFeedback(e.target.value)}
                  placeholder="Provide detailed feedback on the student's performance..."
                  className="min-h-32"
                />
              </div>

              <Button 
                onClick={saveReview} 
                disabled={saving}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Review'}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Annotations */}
          <Card>
            <CardHeader>
              <CardTitle>Add Annotation</CardTitle>
              <p className="text-sm text-muted-foreground">
                Current time: {formatTime(currentTime)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {(['praise', 'improvement', 'note', 'question'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={annotationType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAnnotationType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
              
              <Textarea
                value={currentAnnotation}
                onChange={(e) => setCurrentAnnotation(e.target.value)}
                placeholder="Add a timestamped annotation..."
                className="min-h-20"
              />
              
              <Button 
                onClick={addAnnotation}
                disabled={!currentAnnotation.trim()}
                size="sm"
              >
                Add Annotation
              </Button>
            </CardContent>
          </Card>

          {/* Existing Annotations */}
          {annotations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Annotations ({annotations.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {annotations.map((annotation, index) => (
                  <div key={index} className="border-l-4 border-l-primary pl-3 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-micro">
                        {annotation.annotation_type}
                      </Badge>
                      <button
                        onClick={() => seekTo(annotation.timestamp_seconds)}
                        className="text-primary hover:underline"
                      >
                        {formatTime(annotation.timestamp_seconds)}
                      </button>
                    </div>
                    <p className="text-sm">{annotation.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
