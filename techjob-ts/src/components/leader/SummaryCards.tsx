import React from 'react';

const SummaryCards: React.FC = () => {
  const cards = [
    { 
      title: 'งานทั้งหมด (Total Tasks)', 
      value: 15, 
      subtitle: 'จำนวนงานที่คุณทำสำเร็จ',
      borderColor: 'border-emerald-500',
      // ปรับสีตัวอักษรและพื้นหลังไอคอนให้รองรับทั้ง 2 โหมด
      textColor: 'text-emerald-600 dark:text-emerald-500', 
      bgIcon: 'bg-emerald-100 dark:bg-slate-900/30',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )
    },
    { 
      title: 'กำลังดำเนินการ (Working)', 
      value: 2, 
      subtitle: 'จำนวนงานที่กำลังดำเนินการ',
      borderColor: 'border-amber-500',
      textColor: 'text-amber-600 dark:text-amber-500',
      bgIcon: 'bg-amber-100 dark:bg-slate-900/30',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      )
    },
    { 
      title: 'งานค้าง (Pending Tasks)', 
      value: 5, 
      subtitle: 'งานค้างที่ยังไม่ได้เริ่มทำ',
      borderColor: 'border-orange-500',
      textColor: 'text-orange-600 dark:text-orange-500',
      bgIcon: 'bg-orange-100 dark:bg-slate-900/30',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
        </svg>
      )
    },
    { 
      title: 'ตรวจสอบแล้ว (Approved)', 
      value: 3, 
      subtitle: 'งานที่ตรวจสอบแล้ว',
      borderColor: 'border-indigo-500',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      bgIcon: 'bg-indigo-100 dark:bg-slate-900/30',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path>
        </svg>
      )
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((c, idx) => (
        <div 
          key={idx} 
          className="flex flex-col justify-between min-h-[140px] p-5 rounded-xl transition-colors duration-300 bg-white border border-slate-200 shadow-sm dark:bg-[#1e1e2d] dark:border-slate-800 dark:shadow-lg"
        >
          
          {/* Header: Title & Icon */}
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-semibold pr-2 text-slate-600 dark:text-slate-300">{c.title}</div>
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${c.borderColor} ${c.textColor} ${c.bgIcon}`}>
              {c.icon}
            </div>
          </div>

          {/* Body: Value & Subtitle */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-800 dark:text-white">{c.value}</span>
              <span className="text-sm font-medium text-slate-500">งาน</span>
            </div>
            <div className="text-xs mt-1 text-slate-500 dark:text-slate-400">{c.subtitle}</div>
          </div>

        </div>
      ))}
    </div>
  );
};

export default SummaryCards;