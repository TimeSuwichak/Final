import React from 'react';
import TaskStatusHeader from '../../components/leader/TaskStatusHeader';
import SummaryCards from '../../components/leader/SummaryCards';
import TypeDonut from '../../components/leader/TypeDonut';
import MonthlyBarChart from '../../components/leader/MonthlyBarChart';

const LeaderDashboard: React.FC = () => {
  return (
    <div className="space-y-6 p-4">
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
      <SummaryCards />

      <TaskStatusHeader />

      

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <TypeDonut />
        </div>

        <div>
          <MonthlyBarChart />
        </div>
      </div>
    </div>
  );
};

export default LeaderDashboard;