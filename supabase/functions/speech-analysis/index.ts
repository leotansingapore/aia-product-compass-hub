import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AudioChunk {
  audio: string; // base64 encoded PCM
  timestamp: number;
  sessionId: string;
}

interface SpeechMetrics {
  wordsPerMinute: number;
  fillerWordCount: number;
  speakingTimeMs: number;
  pauseDurationMs: number;
  energyLevel: number;
  clarityScore: number;
  confidenceScore: number;
}

interface CoachingEvent {
  type: 'pace_slow' | 'pace_fast' | 'filler_warning' | 'energy_low' | 'pause_long';
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
}

class AudioProcessor {
  private static readonly FILLER_WORDS = [
    'um', 'uh', 'like', 'you know', 'so', 'actually', 'basically', 'literally',
    'sort of', 'kind of', 'i mean', 'well', 'right', 'okay', 'alright'
  ];

  static decodePCMAudio(base64Audio: string): Float32Array {
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Convert bytes to 16-bit PCM samples
    const samples = new Float32Array(bytes.length / 2);
    for (let i = 0; i < samples.length; i++) {
      const sample = (bytes[i * 2 + 1] << 8) | bytes[i * 2];
      samples[i] = sample / 32768.0; // Normalize to [-1, 1]
    }
    
    return samples;
  }

  static calculateRMS(samples: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    return Math.sqrt(sum / samples.length);
  }

  static detectVAD(samples: Float32Array, threshold: number = 0.01): boolean {
    const rms = this.calculateRMS(samples);
    return rms > threshold;
  }

  static analyzeFillerWords(text: string): { count: number; words: string[] } {
    const words = text.toLowerCase().split(/\s+/);
    const fillerWords: string[] = [];
    
    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (this.FILLER_WORDS.includes(cleanWord)) {
        fillerWords.push(cleanWord);
      }
    }
    
    return { count: fillerWords.length, words: fillerWords };
  }

  static calculateWPM(text: string, durationMs: number): number {
    const words = text.trim().split(/\s+/).length;
    const minutes = durationMs / 60000;
    return minutes > 0 ? Math.round(words / minutes) : 0;
  }

  static calculateClarityScore(text: string, confidence: number): number {
    // Simple clarity heuristic based on sentence structure and confidence
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    
    // Optimal sentence length for clarity is 15-20 words
    const lengthScore = Math.max(0, 1 - Math.abs(avgSentenceLength - 17.5) / 17.5);
    
    return (lengthScore * 0.4 + confidence * 0.6);
  }
}

class CoachingEngine {
  private lastCoachingTime = 0;
  private readonly COACHING_COOLDOWN = 3000; // 3 seconds between coaching messages
  
  generateCoaching(metrics: SpeechMetrics, context: { 
    avgWPM: number; 
    sessionDuration: number;
    recentFillers: number;
  }): CoachingEvent[] {
    const now = Date.now();
    const events: CoachingEvent[] = [];
    
    // Rate limiting
    if (now - this.lastCoachingTime < this.COACHING_COOLDOWN) {
      return events;
    }
    
    // WPM coaching
    if (metrics.wordsPerMinute > context.avgWPM * 1.3) {
      events.push({
        type: 'pace_fast',
        message: 'Consider slowing down slightly for better clarity',
        priority: 'medium',
        timestamp: now
      });
    } else if (metrics.wordsPerMinute < context.avgWPM * 0.7 && metrics.wordsPerMinute > 0) {
      events.push({
        type: 'pace_slow',
        message: 'Try speaking a bit faster to maintain engagement',
        priority: 'low',
        timestamp: now
      });
    }
    
    // Filler word coaching
    if (context.recentFillers > 3) {
      events.push({
        type: 'filler_warning',
        message: 'Notice the filler words - try pausing instead',
        priority: 'high',
        timestamp: now
      });
    }
    
    // Energy coaching
    if (metrics.energyLevel < 0.3) {
      events.push({
        type: 'energy_low',
        message: 'Inject more energy and enthusiasm into your voice',
        priority: 'medium',
        timestamp: now
      });
    }
    
    // Long pause coaching
    if (metrics.pauseDurationMs > 3000) {
      events.push({
        type: 'pause_long',
        message: 'Extended pause detected - continue when ready',
        priority: 'low',
        timestamp: now
      });
    }
    
    if (events.length > 0) {
      this.lastCoachingTime = now;
      // Return only highest priority event to avoid overwhelming
      return [events.sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      })[0]];
    }
    
    return events;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.headers.get("upgrade") === "websocket") {
      // WebSocket connection for real-time analysis
      const { socket, response } = Deno.upgradeWebSocket(req);
      const coachingEngine = new CoachingEngine();
      
      let sessionContext = {
        avgWPM: 150,
        sessionDuration: 0,
        recentFillers: 0,
        textBuffer: '',
        lastVADTime: 0
      };

      socket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'audio_chunk') {
            const chunk = data as AudioChunk;
            const samples = AudioProcessor.decodePCMAudio(chunk.audio);
            
            // Voice Activity Detection
            const hasVoice = AudioProcessor.detectVAD(samples);
            const now = Date.now();
            
            if (hasVoice) {
              sessionContext.lastVADTime = now;
              
              // For real-time, we'd integrate with streaming ASR here
              // For now, we'll simulate with basic audio analysis
              const rms = AudioProcessor.calculateRMS(samples);
              const energyLevel = Math.min(1.0, rms * 10); // Normalize energy
              
              const metrics: SpeechMetrics = {
                wordsPerMinute: 0, // Would come from streaming ASR
                fillerWordCount: 0,
                speakingTimeMs: 1000, // Chunk duration
                pauseDurationMs: now - sessionContext.lastVADTime,
                energyLevel,
                clarityScore: 0.8,
                confidenceScore: 0.9
              };
              
              // Generate coaching
              const coaching = coachingEngine.generateCoaching(metrics, sessionContext);
              
              if (coaching.length > 0) {
                socket.send(JSON.stringify({
                  type: 'coaching_event',
                  event: coaching[0]
                }));
              }
              
              // Store metrics
              await supabase.from('speech_metrics').insert({
                session_id: chunk.sessionId,
                timestamp_offset: chunk.timestamp,
                words_per_minute: metrics.wordsPerMinute,
                filler_word_count: metrics.fillerWordCount,
                speaking_time_ms: metrics.speakingTimeMs,
                pause_duration_ms: metrics.pauseDurationMs,
                energy_level: metrics.energyLevel
              });
            }
            
            socket.send(JSON.stringify({
              type: 'metrics_update',
              metrics: {
                hasVoice,
                energyLevel: hasVoice ? Math.min(1.0, AudioProcessor.calculateRMS(samples) * 10) : 0,
                timestamp: chunk.timestamp
              }
            }));
            
          } else if (data.type === 'transcription') {
            // Handle transcription from streaming ASR
            const { text, confidence, timestamp } = data;
            
            sessionContext.textBuffer += ` ${text}`;
            const fillerAnalysis = AudioProcessor.analyzeFillerWords(text);
            sessionContext.recentFillers += fillerAnalysis.count;
            
            // Calculate WPM from recent text
            const wpm = AudioProcessor.calculateWPM(sessionContext.textBuffer, sessionContext.sessionDuration);
            sessionContext.avgWPM = wpm || sessionContext.avgWPM;
            
            // Store transcript
            await supabase.from('conversation_transcripts').insert({
              session_id: data.sessionId,
              speaker: 'user',
              text,
              timestamp_offset: timestamp,
              confidence,
              filler_words: fillerAnalysis.words
            });
          }
          
        } catch (error) {
          console.error('WebSocket message error:', error);
          socket.send(JSON.stringify({
            type: 'error',
            message: error.message
          }));
        }
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed');
      };

      return response;
    }

    // REST endpoint for batch transcription
    if (req.method === 'POST') {
      const { audio, sessionId } = await req.json();
      
      if (!audio || !sessionId) {
        throw new Error('Missing audio data or session ID');
      }

      // Transcribe with OpenAI Whisper
      let transcriptionResult = { text: '', confidence: 0.9 };
      
      if (openaiApiKey) {
        const audioBuffer = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
        const formData = new FormData();
        formData.append('file', new Blob([audioBuffer], { type: 'audio/wav' }), 'audio.wav');
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'verbose_json');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
          },
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          transcriptionResult = {
            text: result.text || '',
            confidence: result.segments?.[0]?.no_speech_prob ? 1 - result.segments[0].no_speech_prob : 0.9
          };
        }
      }

      // Analyze speech metrics
      const samples = AudioProcessor.decodePCMAudio(audio);
      const duration = (samples.length / 24000) * 1000; // Assuming 24kHz sample rate
      const rms = AudioProcessor.calculateRMS(samples);
      const fillerAnalysis = AudioProcessor.analyzeFillerWords(transcriptionResult.text);
      
      const metrics: SpeechMetrics = {
        wordsPerMinute: AudioProcessor.calculateWPM(transcriptionResult.text, duration),
        fillerWordCount: fillerAnalysis.count,
        speakingTimeMs: duration,
        pauseDurationMs: 0,
        energyLevel: Math.min(1.0, rms * 5),
        clarityScore: AudioProcessor.calculateClarityScore(transcriptionResult.text, transcriptionResult.confidence),
        confidenceScore: transcriptionResult.confidence
      };

      // Store results
      await supabase.from('conversation_transcripts').insert({
        session_id: sessionId,
        speaker: 'user',
        text: transcriptionResult.text,
        timestamp_offset: 0,
        confidence: transcriptionResult.confidence,
        filler_words: fillerAnalysis.words
      });

      await supabase.from('speech_metrics').insert({
        session_id: sessionId,
        timestamp_offset: 0,
        words_per_minute: metrics.wordsPerMinute,
        filler_word_count: metrics.fillerWordCount,
        speaking_time_ms: metrics.speakingTimeMs,
        pause_duration_ms: metrics.pauseDurationMs,
        energy_level: metrics.energyLevel
      });

      return new Response(JSON.stringify({
        transcription: transcriptionResult.text,
        metrics,
        analysis: {
          fillerWords: fillerAnalysis.words,
          clarity: metrics.clarityScore,
          confidence: metrics.confidenceScore
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Speech analysis error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});