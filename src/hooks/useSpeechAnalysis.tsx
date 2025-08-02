import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SpeechMetrics {
  wordsPerMinute: number;
  fillerWordCount: number;
  speakingTimeMs: number;
  pauseDurationMs: number;
  energyLevel: number;
}

export interface CoachingEvent {
  type: 'filler_warning' | 'pace_slow' | 'pace_fast' | 'energy_low';
  message: string;
  timestamp: number;
}

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'so', 'actually', 'basically', 'literally'];

export const useSpeechAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [realtimeMetrics, setRealtimeMetrics] = useState<SpeechMetrics | null>(null);
  const [coachingEvents, setCoachingEvents] = useState<CoachingEvent[]>([]);
  
  const sessionStartTime = useRef<number>(0);
  const lastSpeechTime = useRef<number>(0);
  const speechBuffer = useRef<string[]>([]);
  const speakingPeriods = useRef<{ start: number; end: number }[]>([]);
  const currentSpeakingStart = useRef<number | null>(null);

  const detectFillerWords = useCallback((text: string): string[] => {
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(word => 
      FILLER_WORDS.some(filler => word.includes(filler))
    );
  }, []);

  const calculateWPM = useCallback((text: string, timeMs: number): number => {
    const words = text.trim().split(/\s+/).length;
    const minutes = timeMs / 60000;
    return minutes > 0 ? Math.round(words / minutes) : 0;
  }, []);

  const analyzeEnergyLevel = useCallback((text: string): number => {
    // Simple energy analysis based on text characteristics
    const exclamationPoints = (text.match(/!/g) || []).length;
    const questionMarks = (text.match(/\?/g) || []).length;
    const capitalWords = (text.match(/[A-Z]{2,}/g) || []).length;
    
    const energyScore = (exclamationPoints * 0.3) + (questionMarks * 0.2) + (capitalWords * 0.4);
    return Math.min(1.0, energyScore / text.split(' ').length);
  }, []);

  const startAnalysis = useCallback((sessionId: string) => {
    setIsAnalyzing(true);
    sessionStartTime.current = Date.now();
    speechBuffer.current = [];
    speakingPeriods.current = [];
    setCoachingEvents([]);
    setRealtimeMetrics(null);
  }, []);

  const processSpeechData = useCallback(async (
    text: string, 
    sessionId: string, 
    speaker: 'user' | 'ai' = 'user',
    confidence: number = 1.0
  ) => {
    if (!isAnalyzing || speaker !== 'user') return;

    const currentTime = Date.now();
    const timestampOffset = currentTime - sessionStartTime.current;
    
    // Detect filler words
    const fillerWords = detectFillerWords(text);
    
    // Update speaking periods
    if (currentSpeakingStart.current === null) {
      currentSpeakingStart.current = currentTime;
    }
    
    // Calculate pause duration
    const pauseDuration = lastSpeechTime.current > 0 
      ? currentTime - lastSpeechTime.current 
      : 0;
    
    lastSpeechTime.current = currentTime;
    speechBuffer.current.push(text);
    
    // Calculate metrics
    const combinedText = speechBuffer.current.join(' ');
    const totalSpeakingTime = speakingPeriods.current.reduce(
      (total, period) => total + (period.end - period.start), 
      currentTime - (currentSpeakingStart.current || currentTime)
    );
    
    const metrics: SpeechMetrics = {
      wordsPerMinute: calculateWPM(combinedText, totalSpeakingTime),
      fillerWordCount: speechBuffer.current.reduce(
        (total, segment) => total + detectFillerWords(segment).length, 0
      ),
      speakingTimeMs: totalSpeakingTime,
      pauseDurationMs: pauseDuration,
      energyLevel: analyzeEnergyLevel(text)
    };

    setRealtimeMetrics(metrics);

    // Generate coaching events
    const newCoachingEvents: CoachingEvent[] = [];
    
    // Check for excessive filler words
    if (fillerWords.length > 2) {
      newCoachingEvents.push({
        type: 'filler_warning',
        message: `Try to reduce filler words like "${fillerWords.join(', ')}"`,
        timestamp: timestampOffset
      });
    }
    
    // Check speaking pace
    if (metrics.wordsPerMinute > 180) {
      newCoachingEvents.push({
        type: 'pace_fast',
        message: 'You\'re speaking quite fast. Try to slow down for better clarity.',
        timestamp: timestampOffset
      });
    } else if (metrics.wordsPerMinute < 120 && metrics.wordsPerMinute > 0) {
      newCoachingEvents.push({
        type: 'pace_slow',
        message: 'Consider speaking a bit faster to maintain engagement.',
        timestamp: timestampOffset
      });
    }
    
    // Check energy level
    if (metrics.energyLevel < 0.2) {
      newCoachingEvents.push({
        type: 'energy_low',
        message: 'Try to inject more energy and enthusiasm into your voice.',
        timestamp: timestampOffset
      });
    }

    if (newCoachingEvents.length > 0) {
      setCoachingEvents(prev => [...prev, ...newCoachingEvents]);
      
      // Store coaching events in database
      for (const event of newCoachingEvents) {
        await supabase
          .from('coaching_events')
          .insert({
            session_id: sessionId,
            event_type: event.type,
            message: event.message,
            timestamp_offset: event.timestamp
          });
      }
    }

    // Store transcript
    await supabase
      .from('conversation_transcripts')
      .insert({
        session_id: sessionId,
        speaker,
        text,
        timestamp_offset: timestampOffset,
        confidence,
        filler_words: fillerWords
      });

    // Store metrics periodically (every 10 seconds)
    if (timestampOffset % 10000 < 1000) {
      await supabase
        .from('speech_metrics')
        .insert({
          session_id: sessionId,
          timestamp_offset: timestampOffset,
          words_per_minute: metrics.wordsPerMinute,
          filler_word_count: metrics.fillerWordCount,
          speaking_time_ms: metrics.speakingTimeMs,
          pause_duration_ms: metrics.pauseDurationMs,
          energy_level: metrics.energyLevel
        });
    }
  }, [isAnalyzing, detectFillerWords, calculateWPM, analyzeEnergyLevel]);

  const endSpeaking = useCallback(() => {
    if (currentSpeakingStart.current !== null) {
      speakingPeriods.current.push({
        start: currentSpeakingStart.current,
        end: Date.now()
      });
      currentSpeakingStart.current = null;
    }
  }, []);

  const stopAnalysis = useCallback(() => {
    setIsAnalyzing(false);
    endSpeaking();
  }, [endSpeaking]);

  return {
    isAnalyzing,
    realtimeMetrics,
    coachingEvents,
    startAnalysis,
    processSpeechData,
    endSpeaking,
    stopAnalysis
  };
};