import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  quizzes_completed: number;
  roleplays_completed: number;
  total_activities: number;
}

export function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase.rpc('get_learning_leaderboard', {
        result_limit: 15,
      });
      if (!error && data) {
        setEntries(data as LeaderboardEntry[]);
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-amber-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
    return <span className="text-xs font-bold text-muted-foreground w-5 text-center">{rank}</span>;
  };

  if (loading) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-6 text-center text-muted-foreground text-sm">
          Loading leaderboard…
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground">No activity yet. Complete quizzes and roleplays to appear here!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-1">
          {entries.map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = entry.user_id === user?.id;

            return (
              <div
                key={entry.user_id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  isCurrentUser
                    ? "bg-primary/10 border border-primary/20"
                    : rank <= 3
                      ? "bg-muted/40"
                      : "hover:bg-muted/30"
                )}
              >
                {/* Rank */}
                <div className="w-6 flex items-center justify-center shrink-0">
                  {getRankIcon(rank)}
                </div>

                {/* Avatar */}
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={entry.avatar_url || undefined} />
                  <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                    {entry.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    isCurrentUser && "font-bold"
                  )}>
                    {entry.display_name}
                    {isCurrentUser && <span className="text-xs text-muted-foreground ml-1">(you)</span>}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                  <span title="Quizzes completed">{entry.quizzes_completed} quiz</span>
                  <span title="Roleplays completed">{entry.roleplays_completed} RP</span>
                  <span className="font-bold text-foreground">{entry.total_activities}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
