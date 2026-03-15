import { useEffect } from 'react';

const CameraFeed = ({ videoRef, stream, isStreaming }) => {
  useEffect(() => {
    if (videoRef && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  return (
    <div className="w-full aspect-video bg-bg-surface flex items-center justify-center relative group">
      {/* Video Element */}
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      ) : (
        /* Placeholder State */
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="w-24 h-24 bg-bg-elevated rounded-full flex items-center justify-center border border-border-dim shadow-inner">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-text-muted opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
             </svg>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Camera is inactive</span>
        </div>
      )}
    </div>
  );
};

export default CameraFeed;
