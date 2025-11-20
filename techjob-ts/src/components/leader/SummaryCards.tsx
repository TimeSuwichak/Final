import React from 'react';

// --- Components ย่อยสำหรับ Chart (Mock Charts - เน้นความกระชับ) ---

// 1. Progress Ring (สำหรับ งานทั้งหมด) - ใช้พื้นที่น้อยลง
const CompactProgressRing: React.FC = ({ value = 80 }) => (
    <div className="relative w-12 h-12">
        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <path
                className="text-slate-200 dark:text-slate-700/50"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.0" // เส้นบางลง
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Progress Arc (80% complete) */}
            <path
                className="text-emerald-600 dark:text-emerald-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.0"
                strokeDasharray={`${value}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <span className="text-xs font-bold text-slate-700 dark:text-white">{value}%</span>
        </div>
    </div>
);

// 2. Line Chart (สำหรับ กำลังทำ) - ใช้พื้นที่น้อยลง
const CompactMiniLineChart: React.FC = ({ color = 'text-amber-500' }) => (
    <div className="h-8 w-full relative">
        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={`w-full h-full stroke-current ${color}`} fill="none" strokeWidth="2">
            <polyline points="0,20 25,10 50,25 75,5 100,20" />
        </svg>
        <span className="absolute bottom-0 right-0 text-[10px] font-medium text-slate-500 dark:text-slate-400">↗ +12%</span>
    </div>
);

// 3. Bar Chart (สำหรับ เสร็จสิ้น) - ใช้พื้นที่น้อยลง
const CompactMiniBarChart: React.FC = ({ color = 'text-indigo-500' }) => (
    <div className="h-8 w-full flex items-end justify-around gap-1">
        {[20, 60, 40, 80, 50].map((height, index) => (
            <div 
                key={index} 
                className={`w-2.5 rounded-t-sm transition-all duration-500 ${color} opacity-70`} 
                style={{ height: `${height}%`, backgroundColor: `currentColor` }}
            />
        ))}
    </div>
);


// --- Main Component ---

const SummaryCardsVibrant: React.FC = () => {
  const cards = [
    { 
      title: 'งานทั้งหมด', 
      value: 15, 
      label: 'Total Tasks',
      bgClass: 'bg-emerald-50/80 dark:bg-emerald-900/10',
      borderClass: 'border-emerald-200 dark:border-emerald-800',
      textClass: 'text-emerald-700 dark:text-emerald-400',
      shadowClass: 'shadow-sm hover:shadow-md', // ลดความเข้มของ Shadow
      iconBg: 'bg-emerald-100/50 dark:bg-emerald-900/30',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
      chart: <CompactProgressRing value={80} /> 
    },
    { 
      title: 'กำลังทำ', 
      value: 2, 
      label: 'In Progress',
      bgClass: 'bg-amber-50/80 dark:bg-amber-900/10',
      borderClass: 'border-amber-200 dark:border-amber-800',
      textClass: 'text-amber-700 dark:text-amber-400',
      shadowClass: 'shadow-sm hover:shadow-md',
      iconBg: 'bg-amber-100/50 dark:bg-amber-900/30',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>,
      chart: <CompactMiniLineChart color="text-amber-500 dark:text-amber-400" />
    },
    { 
      title: 'เสร็จสิ้น', 
      value: 3, 
      label: 'Approved',
      bgClass: 'bg-indigo-50/80 dark:bg-indigo-900/10',
      borderClass: 'border-indigo-200 dark:border-indigo-800',
      textClass: 'text-indigo-700 dark:text-indigo-400',
      shadowClass: 'shadow-sm hover:shadow-md',
      iconBg: 'bg-indigo-100/50 dark:bg-indigo-900/30',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>,
      chart: <CompactMiniBarChart color="text-indigo-500 dark:text-indigo-400" />
    },
  ];

  return (
    // ลด Gap ของ Grid
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"> 
      {cards.map((c, idx) => (
        <div 
          key={idx} 
          // ปรับ p-6 เป็น p-5 และลบเอฟเฟกต์ Scale/Blur
          className={`relative p-5 rounded-xl border ${c.bgClass} ${c.borderClass} ${c.shadowClass} transition-all duration-300 overflow-hidden`}
        >
          
          {/* TOP SECTION: Text Info + Icon */}
          <div className="flex items-start justify-between z-10 relative">
            {/* Left: Text Info */}
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest ${c.textClass} opacity-80`}>{c.label}</p>
              {/* ปรับขนาด title */}
              <h4 className="text-slate-800 dark:text-slate-100 text-lg font-bold mt-1">{c.title}</h4>
              <div className="mt-3 flex items-baseline gap-1"> 
                 {/* ปรับขนาดตัวเลข */}
                 <span className={`text-4xl font-extrabold ${c.textClass}`}>{c.value}</span>
                 <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">รายการ</span>
              </div>
            </div>

            {/* Right: Icon (ขนาดเล็กลง) */}
            <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${c.iconBg} ${c.textClass} p-1.5`}>
                  {c.icon}
                </div>
            </div>
          </div>
          
          {/* BOTTOM SECTION: CHART (แทรกในพื้นที่ว่าง) */}
          <div className="mt-4 flex justify-between items-center h-12">
              {c.chart}
              {/* ลบ View Details ออกเพื่อให้กระชับ */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCardsVibrant;