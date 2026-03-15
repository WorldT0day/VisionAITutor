import { useState, useRef, useCallback } from 'react';

const useWebRTC = () => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const startMedia = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Start with back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });
      
      setStream(mediaStream);
      return mediaStream;
    } catch (err) {
      console.error('Error starting media constraints:', err);
      setError(err.message);
      return null;
    }
  }, []);

  const stopMedia = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !stream) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    // Return base64 JPEG format ready to transmit via WebSocket
    return canvas.toDataURL('image/jpeg', 0.8);
  }, [stream]);

  return {
    stream,
    videoRef,
    startMedia,
    stopMedia,
    captureFrame,
    error
  };
};

export default useWebRTC;
