// Audio Worklet Processor for real-time audio processing
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (input.length > 0) {
      const inputChannel = input[0];
      
      // Copy input to output (passthrough)
      if (output.length > 0) {
        output[0].set(inputChannel);
      }
      
      // Buffer audio for processing
      for (let i = 0; i < inputChannel.length; i++) {
        this.buffer[this.bufferIndex] = inputChannel[i];
        this.bufferIndex++;
        
        // When buffer is full, send it for processing
        if (this.bufferIndex >= this.bufferSize) {
          this.port.postMessage({
            audioData: new Float32Array(this.buffer),
            timestamp: currentTime,
            sampleRate: sampleRate
          });
          
          this.bufferIndex = 0;
        }
      }
    }
    
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);