import { useEffect, useRef } from 'react';

const ChatTranscript = ({ transcripts }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  return (
    <div className="w-full max-w-[720px] mx-auto card overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 border-b border-border-dim flex items-center justify-between">
         <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Session Transcript</span>
         <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-accent-primary" />
            <div className="w-1 h-1 rounded-full bg-accent-primary opacity-40" />
            <div className="w-1 h-1 rounded-full bg-accent-primary opacity-20" />
         </div>
      </div>

      <div 
        ref={bottomRef}
        className="flex-grow p-6 overflow-y-auto custom-scrollbar flex flex-col gap-8"
      >
        {transcripts && transcripts.length > 0 ? (
          transcripts.map((msg, i) => (
            <div 
              key={i} 
              className={`flex flex-col gap-2 ${msg.role === 'tutor' ? 'items-start' : 'items-end'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">
                {msg.role === 'tutor' ? 'Tutor' : 'You'}
              </span>
              <div 
                className={`max-w-[85%] p-4 rounded-2xl text-[15px] leading-relaxed ${
                  msg.role === 'tutor' 
                    ? 'bg-bg-elevated text-text-primary border-l-4 border-accent-primary rounded-tl-none' 
                    : 'bg-accent-primary/10 text-text-primary border border-accent-primary/20 rounded-tr-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center opacity-30 gap-4">
             <div className="w-12 h-12 rounded-full border-2 border-dashed border-text-muted flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-text-muted" />
             </div>
             <p className="text-sm font-medium">Say hi to start the session</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatTranscript;
