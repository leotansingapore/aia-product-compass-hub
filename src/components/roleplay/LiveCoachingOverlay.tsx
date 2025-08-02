import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { SpeechMetrics, CoachingEvent } from '@/hooks/useSpeechAnalysis';
import { RealTimeMetrics } from '@/utils/audioProcessing';
import { Activity, Mic, MicOff, Zap } from 'lucide-react';

interface LiveCoachingOverlayProps {
  metrics: SpeechMetrics | null;
  liveMetrics: RealTimeMetrics | null;
  recentEvents: CoachingEvent[];
  sessionDuration: number;
  isVisible: boolean;
  isRealTimeEnabled: boolean;
}

export const LiveCoachingOverlay: React.FC<LiveCoachingOverlayProps> = ({
  metrics,
  liveMetrics,
  recentEvents,
  sessionDuration,
  isVisible,
  isRealTimeEnabled
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

  const getEnergyColor = (energy: number): string => {
    if (energy >= 0.7) return 'text-emerald-400';
    if (energy >= 0.4) return 'text-amber-400';
    return 'text-red-400';
  };

  const getBadgeVariant = (priority?: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <Card className="p-4 bg-black/80 backdrop-blur-sm border-white/20 text-white">
        <div className="space-y-3">
          {/* Header with Real-time Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Duration:</span>
              <span className="font-mono text-lg">{formatDuration(sessionDuration)}</span>
            </div>
            <div className="flex items-center gap-2">
              {isRealTimeEnabled && liveMetrics?.hasVoice ? (
                <div className="flex items-center gap-1">
                  <Mic className="h-3 w-3 text-emerald-400" />
                  <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
                </div>
              ) : isRealTimeEnabled ? (
                <div className="flex items-center gap-1">
                  <MicOff className="h-3 w-3 text-gray-400" />
                  <div className="h-2 w-2 bg-gray-400 rounded-full" />
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-blue-400" />
                  <span className="text-xs text-blue-400">Batch Mode</span>
                </div>
              )}
            </div>
          </div>

          {/* Live Voice Activity */}
          {isRealTimeEnabled && liveMetrics && (
            <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
              <Zap className="h-4 w-4 text-amber-400" />
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">Voice Energy</span>
                  <span className={getEnergyColor(liveMetrics.energyLevel)}>
                    {Math.round(liveMetrics.energyLevel * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-200 ${
                      liveMetrics.energyLevel >= 0.7 ? 'bg-emerald-400' :
                      liveMetrics.energyLevel >= 0.4 ? 'bg-amber-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${Math.min(100, liveMetrics.energyLevel * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Comprehensive Metrics */}
          {metrics && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-300">WPM: </span>
                <span className={`font-semibold ${getWPMColor(metrics.wordsPerMinute)}`}>
                  {metrics.wordsPerMinute}
                </span>
              </div>
              <div>
                <span className="text-gray-300">Fillers: </span>
                <span className="font-semibold text-orange-400">
                  {metrics.fillerWordCount}
                </span>
              </div>
              {metrics.clarityScore !== undefined && (
                <div>
                  <span className="text-gray-300">Clarity: </span>
                  <span className="font-semibold text-blue-400">
                    {Math.round(metrics.clarityScore * 100)}%
                  </span>
                </div>
              )}
              {metrics.confidenceScore !== undefined && (
                <div>
                  <span className="text-gray-300">Confidence: </span>
                  <span className="font-semibold text-purple-400">
                    {Math.round(metrics.confidenceScore * 100)}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Recent Coaching Events */}
          {recentEvents.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Recent Tips:</h4>
              <div className="space-y-1">
                {recentEvents.slice(-3).map((event, index) => (
                  <Badge 
                    key={index} 
                    variant={getBadgeVariant(event.priority)}
                    className="text-xs w-full justify-start"
                  >
                    {event.message}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};