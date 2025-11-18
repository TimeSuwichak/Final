import React from 'react';

const TaskStatusHeader: React.FC = () => {
  return (
    <div className="p-6 transition-colors duration-300 bg-white border shadow-sm rounded-xl border-slate-200 dark:bg-[#1e1e2d] dark:border-slate-800 dark:shadow-lg">
      <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-white">Task Status สถานะงานของคุณ</h3>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: งานวันนี้ (Blue/Sky) */}
        <div className="flex items-center gap-4 p-4 transition-colors border rounded-xl bg-slate-50 border-slate-100 dark:bg-[#151521] dark:border-slate-800">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">2</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">งานที่ต้องทำวันนี้</div>
          </div>
        </div>

        {/* Card 2: งานใหม่ (Orange/Amber) */}
        <div className="flex items-center gap-4 p-4 transition-colors border rounded-xl bg-slate-50 border-slate-100 dark:bg-[#151521] dark:border-slate-800">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">1</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">งานใหม่ที่รอรับ</div>
          </div>
        </div>

        {/* Card 3: รอแก้ไข (Red/Rose) */}
        <div className="flex items-center gap-4 p-4 transition-colors border rounded-xl bg-slate-50 border-slate-100 dark:bg-[#151521] dark:border-slate-800">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">0</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">งานที่รอแก้ไข</div>
          </div>
        </div>

        {/* Card 4: รอตรวจสอบ (Violet/Purple) */}
        <div className="flex items-center gap-4 p-4 transition-colors border rounded-xl bg-slate-50 border-slate-100 dark:bg-[#151521] dark:border-slate-800">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">1</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">งานที่รอหัวหน้าตรวจสอบ</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaskStatusHeader;