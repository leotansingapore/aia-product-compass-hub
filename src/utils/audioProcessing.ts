export interface AudioChunk {
  audio: string; // base64 encoded PCM
  timestamp: number;
  sessionId: string;
}

export interface RealTimeMetrics {
  hasVoice: boolean;
  energyLevel: number;
  timestamp: number;
}

export interface CoachingEvent {
  type: 'pace_slow' | 'pace_fast' | 'filler_warning' | 'energy_low' | 'pause_long';
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
}

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private isRecording = false;
  
  constructor(
    private onAudioChunk: (chunk: AudioChunk) => void,
    private sessionId: string
  ) {}

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        if (!this.isRecording) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const audioChunk: AudioChunk = {
          audio: this.encodePCMAudio(inputData),
          timestamp: Date.now(),
          sessionId: this.sessionId
        };
        
        this.onAudioChunk(audioChunk);
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      this.isRecording = true;
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop(): void {
    this.isRecording = false;
    
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  private encodePCMAudio(float32Array: Float32Array): string {
    // Convert Float32 to 16-bit PCM
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    // Convert to bytes (little-endian)
    const uint8Array = new Uint8Array(int16Array.length * 2);
    for (let i = 0; i < int16Array.length; i++) {
      const sample = int16Array[i];
      uint8Array[i * 2] = sample & 0xFF;
      uint8Array[i * 2 + 1] = (sample >> 8) & 0xFF;
    }
    
    // Encode to base64 in chunks to prevent memory issues
    let binary = '';
    const chunkSize = 8192;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binary);
  }
}

export class RealtimeSpeechClient {
  private ws: WebSocket | null = null;
  private recorder: AudioRecorder | null = null;
  private sessionId: string;
  
  constructor(
    sessionId: string,
    private onMetrics: (metrics: RealTimeMetrics) => void,
    private onCoaching: (event: CoachingEvent) => void,
    private onError: (error: string) => void
  ) {
    this.sessionId = sessionId;
  }

  async connect(): Promise<void> {
    try {
      // Use the actual Supabase project URL
      const wsUrl = 'wss://hgdbflprrficdoyxmdxe.functions.supabase.co/speech-analysis';
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected for real-time speech analysis');
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'metrics_update':
              this.onMetrics(data.metrics);
              break;
            case 'coaching_event':
              this.onCoaching(data.event);
              break;
            case 'error':
              this.onError(data.message);
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.onError('Failed to parse server message');
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.onError('WebSocket connection error');
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
      };
      
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      throw error;
    }
  }

  async startRecording(): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    
    this.recorder = new AudioRecorder(
      (chunk) => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            type: 'audio_chunk',
            ...chunk
          }));
        }
      },
      this.sessionId
    );
    
    await this.recorder.start();
  }

  stopRecording(): void {
    this.recorder?.stop();
    this.recorder = null;
  }

  sendTranscription(text: string, confidence: number, timestamp: number): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'transcription',
        text,
        confidence,
        timestamp,
        sessionId: this.sessionId
      }));
    }
  }

  disconnect(): void {
    this.stopRecording();
    this.ws?.close();
    this.ws = null;
  }
}

export const uploadAudioForAnalysis = async (
  audioBlob: Blob,
  sessionId: string
): Promise<{
  transcription: string;
  metrics: any;
  analysis: any;
}> => {
  try {
    // Convert blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 8192;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const base64Audio = btoa(binary);
    
    // Send to our speech analysis edge function
    const response = await fetch('https://hgdbflprrficdoyxmdxe.functions.supabase.co/speech-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio: base64Audio,
        sessionId
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Error uploading audio for analysis:', error);
    throw error;
  }
};