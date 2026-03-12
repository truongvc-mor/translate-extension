class AudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const float32Buffer = input[0]; // Lấy dữ liệu âm thanh kênh mono
      // Gửi dữ liệu âm thanh về offscreen.js
      this.port.postMessage(float32Buffer);
    }
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);