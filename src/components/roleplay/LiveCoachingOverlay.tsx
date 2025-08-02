import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mic, Clock, TrendingUp, Volume2 } from 'lucide-react';
import { SpeechMetrics, CoachingEvent } from '@/hooks/useSpeechAnalysis';

interface LiveCoachingOverlayProps {
  metrics: SpeechMetrics | null;
  recentEvents: CoachingEvent[];
  sessionDuration: number;
  isVisible: boolean;
}

export const LiveCoachingOverlay: React.FC<LiveCoachingOverlayProps> = ({
  metrics,
  recentEvents,
  sessionDuration,
  isVisible
}) => {
  if (!isVisible) return null;

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getWPMColor = (wpm: number) => {
    if (wpm < 120) return 'text-yellow-500';
    if (wpm > 180) return 'text-red-500';
    return 'text-green-500';
  };

  const getEnergyColor = (energy: number) => {
    if (energy < 0.3) return 'text-yellow-500';
    if (energy > 0.7) return 'text-green-500';
    return 'text-blue-500';
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {/* Real-time metrics */}
      <Card className="p-4 bg-background/95 backdrop-blur-sm border-border">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {formatDuration(sessionDuration)}
            </span>
          </div>

          {metrics && (
            <>
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-muted-foreground" />
                <span className={`text-sm font-medium ${getWPMColor(metrics.wordsPerMinute)}`}>
                  {metrics.wordsPerMinute} WPM
                </span>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  Filler words: {metrics.fillerWordCount}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Energy</span>
                    <span className={getEnergyColor(metrics.energyLevel)}>
                      {Math.round(metrics.energyLevel * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={metrics.energyLevel * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Recent coaching events */}
      {recentEvents.slice(-3).map((event, index) => (
        <Card 
          key={index} 
          className="p-3 bg-background/95 backdrop-blur-sm border-border animate-in slide-in-from-right"
        >
          <div className="flex items-start gap-2">
            <Badge 
              variant={
                event.type === 'filler_warning' ? 'destructive' :
                event.type === 'pace_fast' ? 'secondary' :
                event.type === 'pace_slow' ? 'outline' :
                'default'
              }
              className="text-xs"
            >
              {event.type.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {event.message}
          </p>
        </Card>
      ))}
    </div>
  );
};