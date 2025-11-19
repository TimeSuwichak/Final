import React from 'react';
import TaskStatusHeader from '../../components/leader/TaskStatusHeader';
import SummaryCards from '../../components/leader/SummaryCards';
import TypeDonut from '../../components/leader/TypeDonut';
import MonthlyBarChart from '../../components/leader/MonthlyBarChart';

const LeaderDashboard: React.FC = () => {
  return (
    <div className="space-y-6 p-4">
      <TaskStatusHeader />

      <SummaryCards />

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