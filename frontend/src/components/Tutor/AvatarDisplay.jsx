import React from 'react';

const AvatarDisplay = ({ isSpeaking }) => {
  return (
    <div className="w-full flex justify-center py-6 px-4">
      <style>{`
        @keyframes talk-animation {
          0% { transform: scaleY(0.2); }
          20% { transform: scaleY(1.2); }
          40% { transform: scaleY(0.6); }
          60% { transform: scaleY(1.5); }
          80% { transform: scaleY(0.4); }
          100% { transform: scaleY(1.0); }
        }
        .animate-talk {
          animation: talk-animation 0.4s infinite alternate ease-in-out;
          transform-origin: 200px 245px;
        }
        @keyframes float-animation {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float-animation 4s ease-in-out infinite;
        }
        @keyframes ring-pulse {
          0% { opacity: 0.4; transform: scale(0.98); }
          50% { opacity: 0.8; transform: scale(1.02); }
          100% { opacity: 0.4; transform: scale(0.98); }
        }
        .animate-ring {
          animation: ring-pulse 3s infinite ease-in-out;
          transform-origin: 200px 150px;
        }
        @keyframes blink-animation {
          0%, 94%, 100% { transform: scaleY(1); }
          97% { transform: scaleY(0.05); }
        }
        .animate-blink {
          animation: blink-animation 5s infinite;
          transform-origin: 200px 200px;
        }
      `}</style>
      
      <div className="max-w-md w-full flex flex-col items-center">
        
        {/* Main 3D Animated Character */}
        <div className={`relative mb-8 mt-4 w-64 h-64 md:w-80 md:h-80 flex items-center justify-center animate-float transition-all duration-300 ${isSpeaking ? 'scale-105' : 'scale-100'}`}>
          
          <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-[0_20px_20px_rgba(0,0,0,0.3)]">
            <defs>
              {/* Vibrant glowing border gradient */}
              <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7e22ce" />
                <stop offset="50%" stopColor="#d946ef" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
              
              {/* Hair Gradient: Electric purple to baby pink */}
              <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#fbcfe8" />
              </linearGradient>
              
              {/* Face Gradient: Soft luminous white/pink */}
              <radialGradient id="faceGrad" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#fdf2f8" />
                <stop offset="100%" stopColor="#fce7f3" />
              </radialGradient>
              
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              
              <filter id="glowStrong" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glowing Backdrop Ring */}
            <circle cx="200" cy="200" r="170" fill="#1e1b4b" stroke="url(#borderGrad)" strokeWidth="18" opacity="0.9" />

            {/* Hair Base */}
            <circle cx="200" cy="180" r="110" fill="url(#hairGrad)" />

            {/* Hair Lobs / Pigtails */}
            <ellipse cx="125" cy="250" rx="35" ry="65" fill="url(#hairGrad)" />
            <ellipse cx="275" cy="250" rx="35" ry="65" fill="url(#hairGrad)" />

            {/* Floating Holographic Ring */}
            <ellipse cx="200" cy="160" rx="110" ry="25" fill="none" stroke="#ffffff" strokeWidth="2" className="animate-ring" />
            <ellipse cx="200" cy="160" rx="110" ry="25" fill="none" stroke="#ffffff" strokeWidth="4" filter="url(#glowStrong)" className="animate-ring" opacity="0.6" />

            {/* Soft Luminous Face */}
            <circle cx="200" cy="215" r="95" fill="url(#faceGrad)" />

            <g className="animate-blink">
              {/* Left Eye */}
              <circle cx="155" cy="205" r="14" fill="#ffffff" filter="url(#glow)" />
              <circle cx="155" cy="205" r="8" fill="#000000" />
              <circle cx="152" cy="202" r="3" fill="#ffffff" />
              <circle cx="158" cy="208" r="1.5" fill="#ffffff" />
              {/* Eyelashes */}
              <path d="M 143 194 L 136 186" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 148 192 L 144 182" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />

              {/* Right Eye */}
              <circle cx="245" cy="205" r="14" fill="#ffffff" filter="url(#glow)" />
              <circle cx="245" cy="205" r="8" fill="#000000" />
              <circle cx="242" cy="202" r="3" fill="#ffffff" />
              <circle cx="248" cy="208" r="1.5" fill="#ffffff" />
              {/* Eyelashes */}
              <path d="M 257 194 L 264 186" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 252 192 L 256 182" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* Tiny Cute Nose */}
            <circle cx="200" cy="225" r="1.5" fill="#f472b6" opacity="0.6" />

            {/* Mouth */}
            {!isSpeaking && (
              <path d="M 185 242 Q 200 252 215 242" fill="none" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
            )}
            
            {/* Animated Talking Mouth */}
            <ellipse 
              cx="200" 
              cy="245" 
              rx="12" 
              ry="8" 
              fill="#ec4899" 
              className={isSpeaking ? "animate-talk" : "opacity-0"} 
              style={{ display: isSpeaking ? 'block' : 'none' }}
            />
          </svg>
        </div>

        {/* Status Text Below Avatar */}
        <div className="text-center bg-bg-surface/80 px-8 py-4 rounded-3xl border border-border-dim backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-center gap-3">
            {isSpeaking ? (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-[#d946ef] animate-ping" />
                <p className="text-md font-bold text-[#d946ef]">Speaking...</p>
              </>
            ) : (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-text-muted/50" />
                <p className="text-md font-bold text-text-muted">Listening...</p>
              </>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AvatarDisplay;
