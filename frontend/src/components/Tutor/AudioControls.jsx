import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

const AudioControls = ({
  isAudioMuted,
  isVideoMuted,
  toggleMicrophone,
  toggleCamera,
  endSession
}) => {
  return (
    <div className="flex items-center gap-3 p-2 bg-bg-surface/50 border border-border-dim rounded-full shadow-2xl backdrop-blur-md">
      {/* Microphone Toggle */}
      <button
        onClick={toggleMicrophone}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
          isAudioMuted
            ? 'bg-accent-danger/20 text-accent-danger border border-accent-danger/30'
            : 'bg-bg-elevated text-white hover:bg-accent-primary hover:text-white border border-border-dim'
        }`}
        title={isAudioMuted ? 'Unmute' : 'Mute'}
      >
        {isAudioMuted ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {/* Camera Toggle */}
      <button
        onClick={toggleCamera}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
          isVideoMuted
            ? 'bg-accent-danger/20 text-accent-danger border border-accent-danger/30'
            : 'bg-bg-elevated text-white hover:bg-accent-primary hover:text-white border border-border-dim'
        }`}
        title={isVideoMuted ? 'Start Camera' : 'Stop Camera'}
      >
        {isVideoMuted ? (
          <VideoOff className="w-5 h-5" />
        ) : (
          <Video className="w-5 h-5" />
        )}
      </button>

      {/* End Session Button */}
      <button
        onClick={endSession}
        className="w-11 h-11 rounded-full flex items-center justify-center bg-accent-danger text-white hover:brightness-110 active:scale-95 transition-all shadow-lg border border-white/10"
        title="End Session"
      >
        <PhoneOff className="w-5 h-5" />
      </button>
    </div>
  );
};

export default AudioControls;
