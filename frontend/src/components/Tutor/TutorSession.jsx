// Remove ChatTranscript import and add AvatarDisplay
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../Auth/AuthProvider';
import useWebRTC from '../../hooks/useWebRTC';
import useWebSocket from '../../hooks/useWebSocket';

import CameraFeed from './CameraFeed';
import AudioControls from './AudioControls';
import AvatarDisplay from './AvatarDisplay';
import HintPanel from './HintPanel';

const TutorSession = () => {
  const { currentUser } = useAuth();
  const [sessionActive, setSessionActive] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('tutor');
  
  // Create a unique session ID for the backend connection (in production you'd get this from an API)
  const sessionIdRef = useRef(`session_${Date.now()}`);
  
  const { 
    videoRef, stream, startMedia, stopMedia, captureFrame, error: mediaError
  } = useWebRTC();

  const {
    connect, sendFrame, sendAudio, sendTranscript, endSession: closeWebSocket, transcripts, hints, isSpeaking
  } = useWebSocket(sessionIdRef.current, currentUser?.accessToken || "test-bypass");

  // Audio processing refs
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);

  const isAudioMutedRef = useRef(isAudioMuted);
  useEffect(() => { isAudioMutedRef.current = isAudioMuted; }, [isAudioMuted]);

  const startSession = useCallback(async () => {
    const activeStream = await startMedia();
    if (activeStream) {
      connect();
      setSessionActive(true);
      
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        // Gemini mic input requires 16kHz PCM. Playback AudioContext (in useWebSocket) uses 24kHz.
        const audioContext = new AudioContext({ sampleRate: 16000 });
        audioContextRef.current = audioContext;
        
        const source = audioContext.createMediaStreamSource(activeStream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;
        
        // Connect processor to a silent GainNode, then to destination.
        // This is REQUIRED because browsers will optimize away a disconnected ScriptProcessorNode
        // meaning onaudioprocess would never be called, resulting in no mic audio sent.
        const silentGain = audioContext.createGain();
        silentGain.gain.value = 0;
        
        source.connect(processor);
        processor.connect(silentGain);
        silentGain.connect(audioContext.destination);
        
        processor.onaudioprocess = (e) => {
          if (isAudioMutedRef.current) return;
          
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
          }
          sendAudio(pcmData.buffer);
        };
      } catch (err) {
        console.error('Audio capture setup failed:', err);
      }
    }
  }, [startMedia, connect, sendAudio]);

  const endSession = useCallback(() => {
    stopMedia();
    closeWebSocket();
    setSessionActive(false);
    
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
  }, [stopMedia, closeWebSocket]);

  useEffect(() => {
    // Frame capture loop (disabled for now — re-enable once conversation is stable)
    let interval;
    if (sessionActive && !isVideoMuted) {
      // Send a frame every 5 seconds (20 frames max for a 100 sec span if continuous, but limits apply)
      interval = setInterval(() => {
        const frame = captureFrame();
        if (frame) sendFrame(frame);
      }, 5000); 
    }
    return () => clearInterval(interval);
  }, [sessionActive, isVideoMuted, captureFrame, sendFrame]);

  // Handle toggling audio track state
  useEffect(() => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioMuted;
      }
    }
  }, [isAudioMuted, stream]);

  // Handle toggling video track state
  useEffect(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoMuted;
      }
    }
  }, [isVideoMuted, stream]);

  if (!sessionActive) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 bg-bg-base">
        <div className="flex flex-col items-center max-w-[600px] w-full text-center">
          {/* Large Camera Icon Container */}
          <div className="w-[200px] h-[200px] bg-bg-elevated rounded-[48px] border border-border-dim flex items-center justify-center mb-10 shadow-2xl transition-transform hover:scale-105 duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-text-muted opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-4xl md:text-[40px] font-extrabold text-text-primary mb-4 tracking-tight leading-tight">
            Ready to learn?
          </h1>
          <p className="text-lg text-text-muted mb-12 max-w-[420px] leading-relaxed">
            VisionTutor uses your camera to see your work and your microphone to talk with you. 
            Point your camera at a question to get started!
          </p>

          {mediaError && (
            <div className="mb-8 p-4 bg-accent-danger/10 text-accent-danger rounded-2xl text-xs border border-accent-danger/20 font-bold uppercase tracking-widest">
              {mediaError}
            </div>
          )}

          <button 
            onClick={startSession}
            className="btn-primary w-[200px] h-[52px] flex items-center justify-center gap-3 group"
          >
            <span>Start Session</span>
            <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col bg-bg-base overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-grow flex flex-col items-center p-4 md:p-6 custom-scrollbar overflow-y-auto">
        <div className="w-full max-w-5xl flex flex-col gap-6">
          
          {/* Video Feed Section */}
          <section className="relative w-full aspect-video bg-bg-surface rounded-2xl border border-border-dim overflow-hidden shadow-2xl">
            <CameraFeed videoRef={videoRef} stream={stream} />
            
            {/* Live Indicator Overlay */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full">
              <div className="w-2 h-2 rounded-full bg-accent-live animate-pulse-soft" />
              <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">Live</span>
            </div>
          </section>
          
          {/* Control bar & Tabs Section */}
          <div className="flex flex-col items-center gap-8 w-full">
            <div className="flex flex-col items-center gap-4">
              <AudioControls 
                isAudioMuted={isAudioMuted}
                isVideoMuted={isVideoMuted}
                toggleMicrophone={() => setIsAudioMuted(!isAudioMuted)} 
                toggleCamera={() => setIsVideoMuted(!isVideoMuted)} 
                endSession={endSession} 
              />
              
              {/* Debug Text Button */}
              <button 
                onClick={() => sendTranscript("Hello tutor, how is it going?")}
                className="px-4 py-2 bg-bg-surface border border-border-dim rounded-lg text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors"
              >
                Say 'Hi' to begin
              </button>
            </div>
            
            {/* Centered Tab Navigation */}
            <div className="flex items-center justify-center p-1 bg-bg-surface border border-border-dim rounded-2xl w-full max-w-sm shadow-lg">
              {['tutor', 'hints'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab 
                      ? 'bg-accent-primary text-white shadow-md' 
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Content Panel */}
          <div className="w-full max-w-3xl mx-auto pb-12">
            {activeTab === 'tutor' && <AvatarDisplay isSpeaking={isSpeaking} />}
            {activeTab === 'hints' && <HintPanel hints={hints} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorSession;
