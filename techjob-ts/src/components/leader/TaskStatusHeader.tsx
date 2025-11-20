// TaskStatusHeroRich.tsx (Card 5 ใบด้านบน)
import React from 'react';

const TaskStatusHeroRich: React.FC = () => {
  return (
    <div className="w-full p-6">
       {/* --- Header คงเดิม --- */}
       <div className="bg-white dark:bg-[#1e1e2d] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 mb-6 flex items-center gap-4 relative overflow-hidden">
         <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-violet-600 rounded-l-xl"></div>
         <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
         </div>
         <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
            Task Status Leader
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            ภาพรวมสถานะงานและสถิติการทำงานของคุณ
            </p>
         </div>
       </div>
       
       {/* *** Grid layout 5 คอลัมน์ (มาตรฐานความสูง: min-h-[140px] / text-2xl) *** */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5"> 
          
          {/* Card 1: งานใหม่ (New Task) */}
          <div className="relative bg-white dark:bg-[#1e1e2d] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group cursor-pointer h-full min-h-[140px]">
             {/* ... Icon, Span, and text content (text-2xl) ... */}
             <div className="absolute -right-4 -bottom-4 text-amber-50 dark:text-amber-500/5 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                 <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
             </div>
             <div className="flex justify-between items-start z-10">
                 <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                 </div>
                 <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                     +1 New
                 </span>
             </div>
             <div className="z-10 mt-3">
                 <span className="text-2xl font-bold text-slate-800 dark:text-white">1</span>
                 <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">งานใหม่ที่รอรับ</p>
                 <p className="text-xs text-slate-400 mt-1">อัปเดตเมื่อ 5 นาทีที่แล้ว</p>
             </div>
          </div>

          {/* Card 2: กำลังทำ (In Progress) */}
          <div className="relative bg-white dark:bg-[#1e1e2d] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group cursor-pointer h-full min-h-[140px]">
             {/* ... content ... */}
             <div className="absolute -right-4 -bottom-4 text-sky-50 dark:text-sky-500/5 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
             </div>
             <div className="flex justify-between items-start z-10">
                 <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                 </div>
                 <span className="bg-sky-50 text-sky-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-100 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800">
                     In Progress
                 </span>
             </div>
             <div className="z-10 mt-3">
                 <span className="text-2xl font-bold text-slate-800 dark:text-white">5</span>
                 <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">กำลังทำ</p>
                 <p className="text-xs text-slate-400 mt-1">เหลือเวลา 3 วัน</p>
             </div>
          </div>

          {/* Card 3: รอตรวจสอบ (Pending Review) */}
          <div className="relative bg-white dark:bg-[#1e1e2d] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group cursor-pointer h-full min-h-[140px]">
             {/* ... content ... */}
             <div className="absolute -right-4 -bottom-4 text-violet-50 dark:text-violet-500/5 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
             </div>
             <div className="flex justify-between items-start z-10">
                 <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                 </div>
                 <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                     Pending
                 </span>
             </div>
             <div className="z-10 mt-3">
                 <span className="text-2xl font-bold text-slate-800 dark:text-white">3</span>
                 <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">รอตรวจสอบ</p>
             </div>
          </div>

          {/* Card 4: ตรวจสอบเสร็จสิ้น (Done) */}
          <div className="relative bg-white dark:bg-[#1e1e2d] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group cursor-pointer h-full min-h-[140px]">
             {/* ... content ... */}
             <div className="absolute -right-4 -bottom-4 text-green-50 dark:text-green-500/5 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
             </div>
             <div className="flex justify-between items-start z-10">
                 <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center">
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                 </div>
                 <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                     Done
                 </span>
             </div>
             <div className="z-10 mt-3">
                 <span className="text-2xl font-bold text-slate-800 dark:text-white">12</span>
                 <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">ตรวจสอบเสร็จสิ้น</p>
                 <p className="text-xs text-slate-400 mt-1">ทั้งหมดในเดือนนี้</p>
             </div>
          </div>

          {/* Card 5: รอแก้ไข (Awaiting Fix) */}
          <div className="relative bg-white dark:bg-[#1e1e2d] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group cursor-pointer h-full min-h-[140px]">
             {/* ... content ... */}
             <div className="absolute -right-4 -bottom-4 text-rose-50 dark:text-rose-500/5 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
             </div>
             <div className="flex justify-between items-start z-10">
                 <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                 </div>
                 <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                     Clean
                 </span>
             </div>
             <div className="z-10 mt-3">
                 <span className="text-2xl font-bold text-slate-800 dark:text-white">0</span>
                 <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">รอแก้ไข</p>
                 <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                     <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                     ไม่มีงานที่ต้องแก้ไข
                 </p>
             </div>
          </div>
       </div>
    </div>
  );
};

export default TaskStatusHeroRich;