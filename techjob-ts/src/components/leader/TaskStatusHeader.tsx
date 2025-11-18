import React from 'react';

const TaskStatusHeroRich: React.FC = () => {
  return (
    <div className="w-full p-6">
       {/* --- Header แบบมีกรอบและเงา --- */}
       <div className="bg-white dark:bg-[#1e1e2d] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-5 mb-8 flex items-center gap-4 relative overflow-hidden">
         {/* Decorative Left Border */}
         <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-violet-600"></div>

         {/* Icon Box (เหมือนเดิม) */}
         <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
         </div>
         
         {/* [UPGRADE] Text Content - ปรับให้ดูเป็นมืออาชีพยิ่งขึ้น */}
         <div>
            {/* หัวข้อหลัก: ใช้ Font Weight ที่หนาขึ้น, Tracking ที่คมชัด, และใช้สีที่เน้นใน Dark Mode */}
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Task Status Leader
            </h3>
            {/* คำอธิบาย: ปรับขนาดและ Font Weight ให้ดูเป็นรอง, ใช้สีเทาที่อ่านง่าย */}
            <p className="text-base text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            ภาพรวมสถานะงานและสถิติการทำงานของคุณ
            </p>
         </div>
       </div>
       
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* HERO CARD (คงเดิม) */}
          <div className="lg:col-span-1 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all hover:shadow-indigo-500/30 hover:shadow-xl">
             <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
             <div className="flex justify-between items-start z-10">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">Priority</span>
             </div>
             <div className="mt-8 z-10">
                <h2 className="text-5xl font-bold mb-2">2</h2>
                <p className="text-indigo-100 font-medium">งานที่ต้องทำวันนี้</p>
                <div className="mt-4 w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-white h-full w-2/3 rounded-full"></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-indigo-200">66% Completed</p>
                    <span className="text-xs bg-white/20 px-2 rounded text-white">Due Soon</span>
                </div>
             </div>
          </div>

          {/* SIDE GRID (คงเดิม) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
             
             {/* Card 2: งานใหม่ */}
             <div className="relative bg-white dark:bg-[#1e1e2d] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group cursor-pointer h-full min-h-[160px]">
                <div className="absolute -right-4 -bottom-4 text-amber-50 dark:text-amber-500/5 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </div>

                <div className="flex justify-between items-start z-10">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    </div>
                    <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                        +1 New
                    </span>
                </div>
                
                <div className="z-10 mt-4">
                    <span className="text-3xl font-bold text-slate-800 dark:text-white">1</span>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">งานใหม่ที่รอรับ</p>
                    <p className="text-xs text-slate-400 mt-1">อัปเดตเมื่อ 5 นาทีที่แล้ว</p>
                </div>
             </div>

             {/* Card 3: รอแก้ไข */}
             <div className="relative bg-white dark:bg-[#1e1e2d] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group cursor-pointer h-full">
                <div className="absolute -right-4 -bottom-4 text-rose-50 dark:text-rose-500/5 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                   <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>

                <div className="flex justify-between items-start z-10">
                    <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    </div>
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                        Clean
                    </span>
                </div>

                <div className="z-10 mt-4">
                    <span className="text-3xl font-bold text-slate-800 dark:text-white">0</span>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">รอแก้ไข</p>
                    <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ไม่มีงานค้าง
                    </p>
                </div>
             </div>

             {/* Card 4: รอตรวจสอบ */}
             <div className="relative bg-white dark:bg-[#1e1e2d] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group cursor-pointer h-full">
                <div className="absolute -right-4 -bottom-4 text-violet-50 dark:text-violet-500/5 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                   <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </div>

                <div className="flex justify-between items-start z-10">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </div>
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                        Pending
                    </span>
                </div>

                <div className="z-10 mt-4">
                    <span className="text-3xl font-bold text-slate-800 dark:text-white">1</span>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">รอตรวจสอบ</p>
                    <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                        <div className="bg-violet-500 w-2/3 h-full"></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 text-right">QC Process</p>
                </div>
             </div>

          </div>
       </div>
    </div>
  );
};

export default TaskStatusHeroRich;