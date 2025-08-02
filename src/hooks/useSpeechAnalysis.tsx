import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  RealtimeSpeechClient, 
  AudioChunk, 
  RealTimeMetrics, 
  CoachingEvent as RealtimeCoachingEvent,
  uploadAudioForAnalysis
} from '@/utils/audioProcessing';

export interface SpeechMetrics {
  wordsPerMinute: number;
  fillerWordCount: number;
  speakingTimeMs: number;
  pauseDurationMs: number;
  energyLevel: number;
  clarityScore?: number;
  confidenceScore?: number;
}

export interface CoachingEvent {
  type: 'filler_warning' | 'pace_slow' | 'pace_fast' | 'energy_low' | 'pause_long';
  message: string;
  timestamp: number;
  priority?: 'low' | 'medium' | 'high';
}

export const useSpeechAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [realtimeMetrics, setRealtimeMetrics] = useState<SpeechMetrics | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<RealTimeMetrics | null>(null);
  const [coachingEvents, setCoachingEvents] = useState<CoachingEvent[]>([]);
  
  const sessionStartTime = useRef<number>(0);
  const realtimeClient = useRef<RealtimeSpeechClient | null>(null);
  const currentSessionId = useRef<string>('');

  const handleRealTimeMetrics = useCallback((metrics: RealTimeMetrics) => {
    setLiveMetrics(metrics);
    
    // Convert to our SpeechMetrics format for consistency
    setRealtimeMetrics(prev => ({
      ...prev,
      energyLevel: metrics.energyLevel,
      speakingTimeMs: prev?.speakingTimeMs || 0,
      wordsPerMinute: prev?.wordsPerMinute || 0,
      fillerWordCount: prev?.fillerWordCount || 0,
      pauseDurationMs: prev?.pauseDurationMs || 0,
    }));
  }, []);

  const handleRealTimeCoaching = useCallback((event: RealtimeCoachingEvent) => {
    const coachingEvent: CoachingEvent = {
      type: event.type,
      message: event.message,
      timestamp: event.timestamp,
      priority: event.priority
    };
    
    setCoachingEvents(prev => [...prev, coachingEvent]);
  }, []);

  const handleRealTimeError = useCallback((error: string) => {
    console.error('Real-time speech analysis error:', error);
  }, []);

  const startAnalysis = useCallback(async (sessionId: string, enableRealTime: boolean = false) => {
    setIsAnalyzing(true);
    setIsRealTimeEnabled(enableRealTime);
    sessionStartTime.current = Date.now();
    currentSessionId.current = sessionId;
    setCoachingEvents([]);
    setRealtimeMetrics(null);
    setLiveMetrics(null);
    
    if (enableRealTime) {
      try {
        realtimeClient.current = new RealtimeSpeechClient(
          sessionId,
          handleRealTimeMetrics,
          handleRealTimeCoaching,
          handleRealTimeError
        );
        
        await realtimeClient.current.connect();
        await realtimeClient.current.startRecording();
        
        console.log('Real-time speech analysis started');
      } catch (error) {
        console.error('Failed to start real-time analysis:', error);
        setIsRealTimeEnabled(false);
      }
    }
  }, [handleRealTimeMetrics, handleRealTimeCoaching, handleRealTimeError]);

  const processAudioUpload = useCallback(async (
    audioBlob: Blob,
    sessionId: string
  ) => {
    if (!isAnalyzing) return null;

    try {
      const result = await uploadAudioForAnalysis(audioBlob, sessionId);
      
      // Update metrics with comprehensive analysis
      const enhancedMetrics: SpeechMetrics = {
        ...result.metrics,
        clarityScore: result.analysis.clarity,
        confidenceScore: result.analysis.confidence
      };
      
      setRealtimeMetrics(enhancedMetrics);
      
      return {
        transcription: result.transcription,
        metrics: enhancedMetrics,
        fillerWords: result.analysis.fillerWords
      };
      
    } catch (error) {
      console.error('Error processing audio upload:', error);
      return null;
    }
  }, [isAnalyzing]);

  const sendTranscriptionToRealTime = useCallback((
    text: string,
    confidence: number = 0.9
  ) => {
    if (realtimeClient.current && isRealTimeEnabled) {
      realtimeClient.current.sendTranscription(
        text, 
        confidence, 
        Date.now() - sessionStartTime.current
      );
    }
  }, [isRealTimeEnabled]);

  const stopAnalysis = useCallback(() => {
    setIsAnalyzing(false);
    setIsRealTimeEnabled(false);
    
    // Cleanup real-time client
    if (realtimeClient.current) {
      realtimeClient.current.disconnect();
      realtimeClient.current = null;
    }
    
    console.log('Speech analysis stopped');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (realtimeClient.current) {
        realtimeClient.current.disconnect();
      }
    };
  }, []);

  return {
    isAnalyzing,
    isRealTimeEnabled,
    realtimeMetrics,
    liveMetrics,
    coachingEvents,
    startAnalysis,
    processAudioUpload,
    sendTranscriptionToRealTime,
    stopAnalysis
  };
};