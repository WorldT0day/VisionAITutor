import { useEffect, useRef } from 'react';

const HintPanel = ({ hints }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [hints]);

  return (
    <div className="w-full max-w-[720px] mx-auto card overflow-hidden flex flex-col min-h-[300px] h-[400px]">
      <style>{`
        @keyframes slideIn {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-hint-enter {
          animation: slideIn 0.4s ease-out forwards;
        }
      `}</style>
      
      <div className="p-4 border-b border-border-dim/50 bg-bg-surface flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
         <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Aura Insights</span>
         </div>
         <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#d946ef] animate-pulse" />
         </div>
      </div>

      <div ref={scrollRef} className="p-6 flex flex-col gap-5 overflow-y-auto custom-scrollbar flex-grow bg-bg-elevated/20">
        {hints && hints.length > 0 ? (
          hints.map((hintObj, i) => {
            const text = hintObj.text || hintObj;
            return (
              <div 
                key={i} 
                className="flex flex-col gap-2 p-5 bg-gradient-to-br from-[#1e1b4b]/60 to-[#312e81]/30 rounded-2xl border border-[#c084fc]/30 shadow-lg animate-hint-enter"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-[#f472b6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#f472b6]">Key Concept</span>
                </div>
                <p className="text-[15px] leading-relaxed text-slate-200 whitespace-pre-wrap font-medium">{text}</p>
              </div>
            );
          })
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center py-12 opacity-40 gap-4">
             <div className="w-16 h-16 rounded-full border border-dashed border-[#c084fc]/50 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#c084fc]/50" />
             </div>
             <p className="text-sm font-medium text-slate-400 text-center px-8">As Aura speaks, important key concepts will automatically appear here!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HintPanel;
