import React from 'react';
import KpiRow from '../../components/leader/KpiRow';
import UrgentSection from '../../components/leader/UrgentSection';
import TechnicianStatusTable from '../../components/leader/TechnicianStatusTable';
import WorkloadDistributionChart from '../../components/leader/WorkloadDistributionChart';
import RecentActivityFeed from '../../components/leader/RecentActivityFeed';

const LeaderDashboard: React.FC = () => {
  return (
    <div className="space-y-6 p-4">
      <KpiRow />

      <UrgentSection />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <TechnicianStatusTable />
          <RecentActivityFeed />
        </div>

        <div className="space-y-4">
          <WorkloadDistributionChart />
        </div>
      </div>
    </div>
  );
};

export default LeaderDashboard;