import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Video, MessageSquare, Filter, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { SkeletonLoader } from '@/components/SkeletonLoader';

interface RoleplaySession {
  id: string;
  user_id: string;
  scenario_title: string;
  scenario_category: string;
  scenario_difficulty: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  video_url: string | null;
  recording_status: string;
  profiles: {
    display_name: string | null;
    email: string | null;
  } | null;
  mentor_reviews: {
    id: string;
    status: string;
    mentor_feedback: string | null;
    mentor_score: number | null;
    assigned_at: string;
    completed_at: string | null;
  }[];
}

const statusColors = {
  assigned: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
};

const difficultyColors = {
  beginner: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  advanced: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
};

export function MentorDashboard() {
  const [sessions, setSessions] = useState<RoleplaySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('roleplay_sessions')
        .select(`
          *,
          profiles (display_name, email),
          mentor_reviews (
            id, status, mentor_feedback, mentor_score, 
            assigned_at, completed_at
          )
        `)
        .not('ended_at', 'is', null)
        .order('started_at', { ascending: false });

      if (error) throw error;
      setSessions((data || []) as any);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load roleplay sessions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const assignReview = async (sessionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('mentor_reviews')
        .insert({
          session_id: sessionId,
          mentor_id: user.id,
          status: 'assigned'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Review assigned successfully"
      });

      fetchSessions();
    } catch (error) {
      console.error('Error assigning review:', error);
      toast({
        title: "Error",
        description: "Failed to assign review",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.scenario_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const reviewStatus = session.mentor_reviews?.[0]?.status || 'unassigned';
    const matchesStatus = statusFilter === 'all' || reviewStatus === statusFilter;
    
    const matchesDifficulty = difficultyFilter === 'all' || session.scenario_difficulty === difficultyFilter;

    return matchesSearch && matchesStatus && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <SkeletonLoader type="card" />
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Mentor Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Review and provide feedback on roleplay sessions</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 flex-shrink-0" />
            <Input
              placeholder="Search sessions, students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full sm:col-span-2 md:col-span-1">
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredSessions.map((session) => {
          const review = session.mentor_reviews?.[0];
          const reviewStatus = review?.status || 'unassigned';
          
          return (
            <Card key={session.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{session.scenario_title}</CardTitle>
                    <CardDescription>
                      {session.profiles?.display_name || 'Unknown Student'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={statusColors[reviewStatus as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                      {reviewStatus}
                    </Badge>
                    <Badge className={difficultyColors[session.scenario_difficulty as keyof typeof difficultyColors]}>
                      {session.scenario_difficulty}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(session.started_at)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(session.duration_seconds)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{session.profiles?.email}</span>
                  </div>
                  
                  {session.video_url && (
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span className="text-green-600">Video Available</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {reviewStatus === 'unassigned' ? (
                    <Button 
                      onClick={() => assignReview(session.id)}
                      className="flex-1"
                    >
                      Assign to Me
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => navigate(`/mentor/review/${session.id}`)}
                      className="flex-1"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Review Session
                    </Button>
                  )}
                </div>

                {review?.mentor_score && (
                  <div className="text-center">
                    <span className="text-2xl font-bold">{review.mentor_score}/10</span>
                    <p className="text-sm text-muted-foreground">Mentor Score</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredSessions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No sessions found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || difficultyFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'No roleplay sessions available for review yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}