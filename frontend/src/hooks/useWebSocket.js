import { useRef, useCallback, useState } from 'react';

// Sequential audio queue: schedules each chunk to play exactly after the previous one ends
class AudioQueue {
  constructor(onSpeakingChange) {
    this.audioCtx = null;
    this.nextStartTime = 0;
    this.onSpeakingChange = onSpeakingChange;
    this.speakingTimer = null;
    this.isCurrentlySpeaking = false;
  }

  getContext() {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      this.nextStartTime = 0;
    }
    return this.audioCtx;
  }

  async resume() {
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  enqueue(buffer) {
    try {
      const ctx = this.getContext();

      // Gemini sends PCM s16le at 24kHz
      const int16 = new Int16Array(buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      // Schedule sequentially — never overlap, never re-start at 0
      const now = ctx.currentTime;
      const startAt = Math.max(this.nextStartTime, now + 0.05); // 50ms lookahead buffer
      source.start(startAt);
      this.nextStartTime = startAt + audioBuffer.duration;

      // Update speaking state
      if (!this.isCurrentlySpeaking) {
        this.isCurrentlySpeaking = true;
        if (this.onSpeakingChange) this.onSpeakingChange(true);
      }
      
      if (this.speakingTimer) clearTimeout(this.speakingTimer);
      const msUntilEnd = (this.nextStartTime - ctx.currentTime) * 1000;
      
      this.speakingTimer = setTimeout(() => {
        this.isCurrentlySpeaking = false;
        if (this.onSpeakingChange) this.onSpeakingChange(false);
      }, msUntilEnd + 100); // 100ms grace period

    } catch (e) {
      console.error('Audio queue error:', e);
    }
  }

  reset() {
    this.nextStartTime = 0;
    this.isCurrentlySpeaking = false;
    if (this.speakingTimer) clearTimeout(this.speakingTimer);
    if (this.onSpeakingChange) this.onSpeakingChange(false);
  }
}

const useWebSocket = (sessionId, token) => {
  const wsRef = useRef(null);
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Use a callback to update state without recreating the queue
  const handleSpeakingChange = useCallback((isSpeakingNow) => {
    setIsSpeaking(isSpeakingNow);
  }, []);
  
  const audioQueueRef = useRef(new AudioQueue(handleSpeakingChange));

  const [transcripts, setTranscripts] = useState([]);
  const [hints, setHints] = useState([]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const API_URL = import.meta.env.VITE_API_URL || 'localhost:8080';
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';

    const ws = new WebSocket(`${protocol}://${API_URL}/ws/tutor/${sessionId}?token=${token}`);
    ws.binaryType = 'arraybuffer'; // Receive audio as ArrayBuffer, not Blob

    ws.onopen = async () => {
      console.log('WebSocket Connected');
      audioQueueRef.current.reset();
      await audioQueueRef.current.resume();
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'transcript') {
            setTranscripts(prev => [...prev, { role: msg.isModel ? 'tutor' : 'student', text: msg.text }]);
          } else if (msg.type === 'hint') {
            setHints(prev => [...prev, msg]);
          }
        } catch (e) {
          console.error('Error parsing WS string message', e);
        }
      } else if (event.data instanceof ArrayBuffer) {
        // Audio data — enqueue for sequential playback
        if (event.data.byteLength > 0) {
          audioQueueRef.current.enqueue(event.data);
        }
      }
    };

    ws.onerror = (err) => console.error('WebSocket Error:', err);
    ws.onclose = (event) => {
      console.log(`WebSocket Closed: Code=${event.code}, Reason=${event.reason || 'None'}`);
      audioQueueRef.current.reset();
    };

    wsRef.current = ws;
  }, [sessionId, token]);

  const sendFrame = useCallback((base64Frame) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'frame', data: base64Frame }));
    }
  }, []);

  const sendAudio = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    }
  }, []);

  const sendTranscript = useCallback((text) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'client_transcript', text }));
    }
  }, []);

  const endSession = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'end_session' }));
      wsRef.current.close();
    }
  }, []);

  return {
    connect,
    sendFrame,
    sendAudio,
    sendTranscript,
    endSession,
    transcripts,
    hints,
    isSpeaking
  };
};

export default useWebSocket;
