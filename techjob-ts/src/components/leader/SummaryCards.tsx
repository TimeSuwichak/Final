import React from 'react';
import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';

// --- Components ย่อยสำหรับ Chart (Mock Charts - เน้นความกระชับและเล็กลง) ---

// 1. Progress Ring (สำหรับ งานทั้งหมด) - ลดขนาดลงอีก
const CompactProgressRing: React.FC<{ value: number }> = ({ value = 80 }) => (
    <div className="relative w-10 h-10">
        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <path
                className="text-slate-700/50 dark:text-slate-700/50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5" // เส้นบางลงอีก
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Progress Arc (80% complete) */}
            <path
                className="text-emerald-600 dark:text-emerald-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray={`${value}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <span className="text-[10px] font-bold text-slate-700 dark:text-white">{value}%</span>
        </div>
    </div>
);

// 2. Line Chart (สำหรับ กำลังทำ) - ลดความสูงลง
const CompactMiniLineChart: React.FC<{ color: string }> = ({ color = 'text-amber-500' }) => (
    <div className="h-6 w-full relative">
        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={`w-full h-full stroke-current ${color}`} fill="none" strokeWidth="2">
            <polyline points="0,20 25,10 50,25 75,5 100,20" />
        </svg>
        <span className="absolute bottom-[-10px] right-0 text-[10px] font-medium text-slate-500 dark:text-slate-400">↗ +12%</span>
    </div>
);

// 3. Bar Chart (สำหรับ เสร็จสิ้น) - ลดความสูงลง
const CompactMiniBarChart: React.FC<{ color: string }> = ({ color = 'text-indigo-500' }) => (
    <div className="h-6 w-full flex items-end justify-around gap-0.5">
        {[20, 60, 40, 80, 50].map((height, index) => (
            <div 
                key={index} 
                className={`w-1.5 rounded-t-sm transition-all duration-500 ${color} opacity-80`} 
                style={{ height: `${height}%`, backgroundColor: `currentColor` }}
            />
        ))}
    </div>
);


// --- Main Component ---

const SummaryCardsCompact: React.FC = () => {
  const { jobs } = useJobs();
  const { user } = useAuth();
  
  // Filter jobs assigned to leader
  const leaderJobs = React.useMemo(() => {
    if (!user || !jobs) return [];
    return jobs.filter(j => String(j.leadId) === String(user.id));
  }, [jobs, user]);
  
  const totalCount = leaderJobs.length;
  const inProgressCount = leaderJobs.filter(j => j.status === 'in-progress').length;
  const completedCount = leaderJobs.filter(j => j.status === 'completed').length;
  const completedPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  const cards = [
    { 
      title: 'งานทั้งหมด', 
      value: totalCount, 
      label: 'TOTAL',
      unit: 'จำนวนงาน',
      bgClass: 'bg-emerald-50 dark:bg-slate-800/50',
      borderClass: 'border-emerald-300 dark:border-emerald-700',
      textClass: 'text-emerald-700 dark:text-emerald-400',
      shadowClass: 'shadow-md hover:shadow-lg',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
      chart: <CompactProgressRing value={completedPercent} /> ,
      auxiliary: `${completedPercent}% เสร็จสิ้น`,
      auxColor: 'text-emerald-500 dark:text-emerald-400'
    },
    { 
      title: 'กำลังดำเนินการ', 
      value: inProgressCount, 
      label: 'IN PROGRESS',
      unit: 'งานที่กำลังทำ',
      bgClass: 'bg-amber-50 dark:bg-slate-800/50',
      borderClass: 'border-amber-300 dark:border-amber-700',
      textClass: 'text-amber-700 dark:text-amber-400',
      shadowClass: 'shadow-md hover:shadow-lg',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>,
      chart: <CompactMiniLineChart color="text-amber-500 dark:text-amber-400" />,
      auxiliary: `${inProgressCount} งานกำลังทำ`,
      auxColor: 'text-amber-500 dark:text-amber-400'
    },
    { 
      title: 'เสร็จสิ้น', 
      value: completedCount, 
      label: 'COMPLETED',
      unit: 'งานที่เสร็จสิ้น',
      bgClass: 'bg-indigo-50 dark:bg-slate-800/50',
      borderClass: 'border-indigo-300 dark:border-indigo-700',
      textClass: 'text-indigo-700 dark:text-indigo-400',
      shadowClass: 'shadow-md hover:shadow-lg',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>,
      chart: <CompactMiniBarChart color="text-indigo-500 dark:text-indigo-400" />,
      auxiliary: 'เสร็จสิ้นสมบูรณ์จากการทำงาน',
      auxColor: 'text-indigo-500 dark:text-indigo-400'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"> 
      {cards.map((c, idx) => (
        <div 
          key={idx} 
          // ลด Padding เป็น p-4
          className={`relative p-4 rounded-xl border ${c.bgClass} ${c.borderClass} ${c.shadowClass} transition-all duration-300 transform hover:scale-[1.01] overflow-hidden`}
        >
          
          {/* TOP ROW: Label & Icon */}
          <div className="flex items-center justify-between z-10 relative mb-2"> 
            <p className={`text-[10px] font-bold uppercase tracking-widest ${c.textClass} opacity-80`}>{c.label}</p>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.iconBg} ${c.textClass} p-1`}>
              {c.icon}
            </div>
          </div>
          
          {/* MAIN ROW: Value, Title, Chart */}
          <div className="flex items-center justify-between">
            {/* Left: Value & Title */}
            <div>
              <h4 className="text-slate-800 dark:text-slate-100 text-base font-bold">{c.title}</h4>
              <div className="mt-1 flex items-baseline gap-1"> 
                 {/* ปรับขนาดตัวเลข */}
                 <span className={`text-3xl font-extrabold ${c.textClass}`}>{c.value}</span>
                 <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{c.unit}</span>
              </div>
            </div>

            {/* Right: Chart */}
            <div className="w-1/3 flex justify-end">
              {c.chart}
            </div>
          </div>
          
          {/* AUXILIARY/FOOTER SECTION */}
          <div className={`mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/50`}>
              <span className={`text-xs font-medium ${c.auxColor}`}>{c.auxiliary}</span>
          </div>
          
        </div>
      ))}
    </div>
  );
};

export default SummaryCardsCompact;