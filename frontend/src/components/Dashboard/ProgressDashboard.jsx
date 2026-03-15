import { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthProvider';

const CosmicDashboard = () => {
  const { currentUser } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Simulated dynamic progress
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    streak: 0,
    subjects: [
      { name: 'Mathematics', percentage: 0, target: 85, color: 'from-blue-400 to-indigo-600' },
      { name: 'Science', percentage: 0, target: 45, color: 'from-emerald-400 to-teal-500' },
      { name: 'History', percentage: 0, target: 60, color: 'from-amber-400 to-orange-500' },
      { name: 'Literature', percentage: 0, target: 30, color: 'from-fuchsia-400 to-purple-600' }
    ]
  });

  useEffect(() => {
    // Animate numbers up cleanly after mount for an interactive feel
    setIsLoaded(true);
    const timeout = setTimeout(() => {
      setStats({
        totalSessions: 24,
        totalMinutes: 345,
        streak: 7,
        subjects: stats.subjects.map(s => ({ ...s, percentage: s.target }))
      });
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="w-full flex justify-center py-6 px-4">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-slide-up {
          animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
      `}</style>

      <div className="max-w-5xl w-full flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 opacity-0 anim-slide-up">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] tracking-tight mb-2">
              Learning Matrix
            </h1>
            <p className="text-text-muted font-medium ml-1">
              Welcome back, <span className="text-slate-200">{currentUser?.email || "Explorer"}</span>
            </p>
          </div>
          <div className="px-6 py-2 rounded-full border border-[#d946ef]/30 bg-[#d946ef]/10 shadow-[0_0_15px_rgba(217,70,239,0.15)] flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-[#d946ef] animate-pulse" />
             <span className="text-xs font-bold text-[#d946ef] uppercase tracking-widest">Aura Sync Active</span>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Sessions" 
            value={stats.totalSessions} 
            subtitle="Lifetime"
            delayClass="delay-100"
            color="border-blue-500/50"
          />
          <StatCard 
            title="Learning Time" 
            value={`${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`} 
            subtitle="Total focus hours"
            delayClass="delay-200"
            color="border-emerald-500/50"
          />
          <StatCard 
            title="Current Streak" 
            value={`${stats.streak} Days`} 
            subtitle="Keep it up! 🔥"
            delayClass="delay-300"
            color="border-amber-500/50"
          />
        </div>

        {/* Breakdown Section */}
        <div className="bg-bg-surface/80 rounded-3xl border border-border-dim backdrop-blur-md shadow-xl p-8 opacity-0 anim-slide-up delay-300">
          <h3 className="text-lg font-bold text-slate-200 mb-8 uppercase tracking-widest text-xs">Knowledge Mastery Protocol</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {stats.subjects.map((subject, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-slate-300">{subject.name}</span>
                  <span className="text-xs font-black text-slate-400">{subject.percentage}%</span>
                </div>
                <div className="w-full bg-slate-800/50 rounded-full h-3 overflow-hidden border border-slate-700/50">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${subject.color} transition-all duration-1000 ease-out relative`} 
                    style={{ width: isLoaded ? `${subject.percentage}%` : '0%' }}
                  >
                     <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/30 rounded-full blur-[1px]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, delayClass, color }) => (
  <div className={`bg-bg-surface/80 rounded-3xl border-t-[3px] border-x border-b border-border-dim ${color} backdrop-blur-md shadow-lg p-6 opacity-0 anim-slide-up ${delayClass} hover:-translate-y-1 transition-transform duration-300 cursor-default`}>
    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">{title}</h3>
    <p className="text-4xl font-extrabold text-slate-100 tracking-tight">{value}</p>
    <p className="text-xs text-slate-500 font-medium mt-2">{subtitle}</p>
  </div>
);

export default CosmicDashboard;
