import React from 'react';

const SummaryCardsVibrant: React.FC = () => {
  const cards = [
    { 
      title: 'งานทั้งหมด', 
      value: 15, 
      label: 'Total Tasks',
      // ใช้ Theme สีเขียว
      bgClass: 'bg-emerald-50/80 dark:bg-emerald-500/10',
      borderClass: 'border-emerald-100 dark:border-emerald-500/20',
      textClass: 'text-emerald-700 dark:text-emerald-400',
      iconBg: 'bg-white dark:bg-emerald-500/20',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    },
    { 
      title: 'กำลังทำ', 
      value: 2, 
      label: 'In Progress',
      // ใช้ Theme สีเหลือง/ส้ม
      bgClass: 'bg-amber-50/80 dark:bg-amber-500/10',
      borderClass: 'border-amber-100 dark:border-amber-500/20',
      textClass: 'text-amber-700 dark:text-amber-400',
      iconBg: 'bg-white dark:bg-amber-500/20',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
    },
    { 
      title: 'งานค้าง', 
      value: 5, 
      label: 'Pending',
      // ใช้ Theme สีส้มแดง
      bgClass: 'bg-orange-50/80 dark:bg-orange-500/10',
      borderClass: 'border-orange-100 dark:border-orange-500/20',
      textClass: 'text-orange-700 dark:text-orange-400',
      iconBg: 'bg-white dark:bg-orange-500/20',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path></svg>
    },
    { 
      title: 'เสร็จสิ้น', 
      value: 3, 
      label: 'Approved',
      // ใช้ Theme สีม่วง/คราม
      bgClass: 'bg-indigo-50/80 dark:bg-indigo-500/10',
      borderClass: 'border-indigo-100 dark:border-indigo-500/20',
      textClass: 'text-indigo-700 dark:text-indigo-400',
      iconBg: 'bg-white dark:bg-indigo-500/20',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, idx) => (
        <div 
          key={idx} 
          className={`relative p-5 rounded-2xl border ${c.bgClass} ${c.borderClass} transition-transform duration-300 hover:-translate-y-1`}
        >
          <div className="flex items-center justify-between">
            {/* Left: Text Info */}
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider opacity-70 ${c.textClass}`}>{c.label}</p>
              <h4 className="text-slate-700 dark:text-slate-200 font-semibold mt-1">{c.title}</h4>
              <div className="mt-2 flex items-baseline gap-1">
                 <span className={`text-3xl font-bold ${c.textClass}`}>{c.value}</span>
                 <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">รายการ</span>
              </div>
            </div>

            {/* Right: Icon in a Circle */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${c.iconBg} ${c.textClass}`}>
              {c.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCardsVibrant;