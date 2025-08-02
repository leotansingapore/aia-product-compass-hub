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

async function handleFinalizeSession(body: any, supabase: any) {
  const { conversationId, recordingUrl, finalTranscript, durationSeconds, meta } = body;
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  console.log('Processing roleplay session for conversation:', conversationId);
  
  // Get or create session record
  let session;
  if (conversationId !== 'unknown') {
    const { data: existingSessions } = await supabase
      .from('roleplay_sessions')
      .select('*')
      .eq('tavus_conversation_id', conversationId)
      .single();
    
    session = existingSessions;
  }
  
  // Analyze transcript and generate AI feedback if provided
  let analysis = null;
  let aiFeedback = null;
  
  if (finalTranscript && finalTranscript.trim()) {
    console.log('Analyzing transcript:', finalTranscript.substring(0, 100) + '...');
    
    const duration = durationSeconds || 60;
    const fillerWords = AudioProcessor.analyzeFillerWords(finalTranscript);
    const wpm = AudioProcessor.calculateWPM(finalTranscript, duration * 1000);
    const clarity = AudioProcessor.calculateClarityScore(finalTranscript, 0.9);
    
    // Generate AI feedback using OpenAI
    try {
      const prompt = `
You are an expert sales and communication coach analyzing a roleplay conversation. 
The conversation was a ${session?.scenario_difficulty || 'beginner'} level ${session?.scenario_category || 'sales consultation'} roleplay session titled "${session?.scenario_title || 'Practice Session'}".

Here is the complete transcript of the roleplay session:
"${finalTranscript}"

Please analyze this conversation and provide detailed feedback in the following JSON format:
{
  "overall_score": [number 0-100],
  "communication_score": [number 0-100],
  "listening_score": [number 0-100], 
  "objection_handling_score": [number 0-100],
  "product_knowledge_score": [number 0-100],
  "strengths": [array of 3-5 specific strengths observed],
  "improvement_areas": [array of 3-5 specific areas for improvement],
  "specific_feedback": "[detailed paragraph explaining performance]",
  "coaching_points": [array of 3-5 actionable coaching tips],
  "follow_up_questions": [array of 2-3 reflection questions]
}

Focus on:
- Communication clarity and effectiveness
- Active listening and responsiveness  
- Handling objections and concerns
- Product/service knowledge demonstration
- Overall professionalism and rapport building
- Speaking pace and filler word usage (they spoke at ${wpm} WPM with ${fillerWords.count} filler words)

Provide constructive, specific feedback that will help improve their roleplay skills.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert sales coach providing detailed performance feedback.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1500
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const feedbackText = result.choices[0].message.content;
        
        try {
          aiFeedback = JSON.parse(feedbackText);
          console.log('AI feedback generated:', aiFeedback);
        } catch (parseError) {
          console.error('Failed to parse AI feedback JSON:', parseError);
          // Fallback feedback if JSON parsing fails
          aiFeedback = {
            overall_score: Math.round((wpm > 120 ? 80 : wpm < 80 ? 60 : 75) - fillerWords.count * 2 + clarity * 10),
            communication_score: Math.round(clarity * 100),
            listening_score: 75,
            objection_handling_score: 70,
            product_knowledge_score: 75,
            strengths: ["Clear communication", "Good engagement"],
            improvement_areas: ["Reduce filler words", "Improve pacing"],
            specific_feedback: "Overall good performance with room for improvement in speaking fluency.",
            coaching_points: ["Practice speaking at a consistent pace", "Work on reducing filler words"],
            follow_up_questions: ["What would you do differently next time?", "How did you feel about your responses?"]
          };
        }
      } else {
        console.error('OpenAI API error:', await response.text());
      }
    } catch (error) {
      console.error('Error generating AI feedback:', error);
    }
    
    analysis = {
      transcript: finalTranscript,
      wpm,
      filler_count: fillerWords.count,
      clarity_score: clarity,
      sentiment: 0.7,
      score: aiFeedback?.overall_score || Math.round((wpm > 120 ? 80 : wpm < 80 ? 60 : 75) - fillerWords.count * 2 + clarity * 10)
    };
    
    // Store AI feedback in database
    if (aiFeedback && session) {
      await supabase.from('roleplay_feedback').insert({
        session_id: session.id,
        overall_score: aiFeedback.overall_score,
        communication_score: aiFeedback.communication_score,
        listening_score: aiFeedback.listening_score,
        objection_handling_score: aiFeedback.objection_handling_score,
        product_knowledge_score: aiFeedback.product_knowledge_score,
        strengths: aiFeedback.strengths,
        improvement_areas: aiFeedback.improvement_areas,
        specific_feedback: aiFeedback.specific_feedback,
        coaching_points: aiFeedback.coaching_points,
        follow_up_questions: aiFeedback.follow_up_questions
      });
      
      // Store performance metrics
      await supabase.from('roleplay_performance_metrics').insert([
        { session_id: session.id, metric_name: 'wpm', metric_value: Math.round(wpm), metric_description: 'Words per minute' },
        { session_id: session.id, metric_name: 'filler_words', metric_value: fillerWords.count, metric_description: 'Total filler words used' },
        { session_id: session.id, metric_name: 'clarity_score', metric_value: Math.round(clarity * 100), metric_description: 'Speech clarity percentage' }
      ]);
      
      console.log('Feedback stored successfully');
    }
  }
  
  // Update or create session
  const sessionData = {
    ended_at: new Date().toISOString(),
    duration_seconds: durationSeconds,
    transcript: analysis?.transcript,
    tavus_conversation_id: conversationId,
    ...(recordingUrl && { meta: { ...meta, recording_url: recordingUrl } })
  };
  
  if (session) {
    const { data: updatedSession } = await supabase
      .from('roleplay_sessions')
      .update(sessionData)
      .eq('id', session.id)
      .select()
      .single();
    
    return new Response(JSON.stringify({
      id: updatedSession.id,
      scenario_title: updatedSession.scenario_title,
      scenario_category: updatedSession.scenario_category,
      scenario_difficulty: updatedSession.scenario_difficulty,
      ...analysis,
      started_at: updatedSession.started_at,
      ended_at: updatedSession.ended_at,
      duration_seconds: updatedSession.duration_seconds,
      tavus_video_url: recordingUrl
    }), { headers: corsHeaders });
  }
  
  return new Response(JSON.stringify({
    id: 'temp',
    scenario_title: 'Unknown Session',
    scenario_category: 'consultation',
    scenario_difficulty: 'beginner',
    ...analysis,
    started_at: new Date().toISOString(),
    ended_at: new Date().toISOString(),
    duration_seconds: durationSeconds,
    tavus_video_url: recordingUrl
  }), { headers: corsHeaders });
}

async function handleGetSession(body: any, supabase: any) {
  const { sessionId } = body;
  
  const { data: session } = await supabase
    .from('roleplay_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
  
  if (!session) {
    return new Response(JSON.stringify({ error: 'Session not found' }), { 
      status: 404, 
      headers: corsHeaders 
    });
  }
  
  return new Response(JSON.stringify({
    id: session.id,
    scenario_title: session.scenario_title,
    scenario_category: session.scenario_category,
    scenario_difficulty: session.scenario_difficulty,
    transcript: session.transcript,
    started_at: session.started_at,
    ended_at: session.ended_at,
    duration_seconds: session.duration_seconds,
    tavus_video_url: session.meta?.recording_url
  }), { headers: corsHeaders });
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

    // REST endpoint for different actions
    if (req.method === 'POST') {
      const body = await req.json();
      const { action } = body;

      switch (action) {
        case 'finalize_session':
          return await handleFinalizeSession(body, supabase);
        
        case 'get_session':
          return await handleGetSession(body, supabase);
        
        default:
          // Original batch transcription logic
          const { audio, sessionId } = body;
          
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